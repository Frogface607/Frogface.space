/**
 * Unified storage layer: OpenClaw memory (primary) → Supabase (fallback).
 *
 * KV data is stored in OpenClaw memory with prefix "KV::{key}::" + JSON.
 * Activity logs are stored as individual memories with category "log".
 * Chat messages are stored with category "chat".
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const KV_PREFIX = "KV::";

interface OpenClawConfig {
  url: string;
  token: string;
}

function getOpenClaw(): OpenClawConfig | null {
  const url = process.env.OPENCLAW_URL;
  const token = process.env.OPENCLAW_GATEWAY_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function ocInvoke(oc: OpenClawConfig, tool: string, args: Record<string, unknown>) {
  const res = await fetch(`${oc.url}/tools/invoke`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${oc.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tool, args }),
  });
  if (!res.ok) throw new Error(`OpenClaw ${res.status}`);
  return res.json();
}

// ─── KV Store ─────────────────────────────────────────────

export async function kvGet<T>(key: string, fallback: T): Promise<T> {
  const oc = getOpenClaw();
  if (oc) {
    try {
      const results = await ocInvoke(oc, "memory_recall", {
        query: `${KV_PREFIX}${key}`,
        limit: 3,
      });
      const items = Array.isArray(results) ? results : results?.memories || results?.results || [];
      for (const item of items) {
        const text = item.text || item.content || "";
        const prefix = `${KV_PREFIX}${key}::`;
        if (text.startsWith(prefix)) {
          try {
            return JSON.parse(text.slice(prefix.length)) as T;
          } catch { /* bad json, skip */ }
        }
      }
    } catch { /* openclaw unavailable */ }
  }

  const sb = getSupabase();
  if (sb) {
    try {
      const { data } = await sb.from("kv_store").select("value").eq("key", key).maybeSingle();
      if (data) return (data as { value: T }).value;
    } catch { /* supabase unavailable */ }
  }

  return fallback;
}

export async function kvSet<T>(key: string, value: T): Promise<void> {
  const serialized = `${KV_PREFIX}${key}::${JSON.stringify(value)}`;

  const oc = getOpenClaw();
  if (oc) {
    try {
      await ocInvoke(oc, "memory_forget", { query: `${KV_PREFIX}${key}` });
    } catch { /* may not exist yet */ }
    try {
      await ocInvoke(oc, "memory_store", {
        text: serialized,
        category: "kv_store",
        importance: 1.0,
      });
    } catch { /* openclaw unavailable */ }
  }

  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from("kv_store").upsert(
        { key, value: value as unknown, updated_at: new Date().toISOString() } as never,
      );
    } catch { /* supabase unavailable */ }
  }
}

// ─── Activity Log ─────────────────────────────────────────

export interface LogEntry {
  source: string;
  type: string;
  text: string;
}

export async function logAppend(entry: LogEntry): Promise<void> {
  const oc = getOpenClaw();
  if (oc) {
    try {
      await ocInvoke(oc, "memory_store", {
        text: `LOG::${entry.source}::${entry.type}::${entry.text}`,
        category: "activity_log",
        importance: 0.6,
      });
    } catch { /* ignore */ }
  }

  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from("activity_log").insert(entry as never);
    } catch { /* ignore */ }
  }
}

export async function logRecent(limit = 20, source?: string): Promise<LogEntry[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      let query = sb.from("activity_log").select("*").order("created_at", { ascending: false }).limit(limit);
      if (source) query = query.eq("source", source);
      const { data } = await query;
      if (data && data.length > 0) {
        return data.map((r) => ({ source: r.source, type: r.type, text: r.text }));
      }
    } catch { /* supabase unavailable */ }
  }

  const oc = getOpenClaw();
  if (oc) {
    try {
      const searchQuery = source ? `LOG::${source}` : "LOG::";
      const results = await ocInvoke(oc, "memory_recall", { query: searchQuery, limit });
      const items = Array.isArray(results) ? results : results?.memories || results?.results || [];
      return items
        .map((item: { text?: string }) => {
          const text = item.text || "";
          if (!text.startsWith("LOG::")) return null;
          const parts = text.slice(5).split("::", 3);
          if (parts.length < 3) return null;
          return { source: parts[0], type: parts[1], text: parts[2] };
        })
        .filter(Boolean) as LogEntry[];
    } catch { /* ignore */ }
  }

  return [];
}

// ─── Chat Messages ────────────────────────────────────────

export interface ChatMessage {
  agent_id: string;
  role: string;
  content: string;
}

export async function chatSave(msg: ChatMessage): Promise<void> {
  const oc = getOpenClaw();
  if (oc) {
    try {
      await ocInvoke(oc, "memory_store", {
        text: `CHAT::${msg.agent_id}::${msg.role}::${msg.content}`,
        category: `chat_${msg.agent_id}`,
        importance: 0.5,
      });
    } catch { /* ignore */ }
  }

  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from("chat_messages").insert(msg as never);
    } catch { /* ignore */ }
  }
}

export async function chatRecent(agentId: string, limit = 50): Promise<ChatMessage[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data } = await sb
        .from("chat_messages")
        .select("*")
        .eq("agent_id", agentId)
        .order("created_at", { ascending: true })
        .limit(limit);
      if (data && data.length > 0) {
        return data.map((r) => ({ agent_id: r.agent_id, role: r.role, content: r.content }));
      }
    } catch { /* supabase unavailable */ }
  }

  const oc = getOpenClaw();
  if (oc) {
    try {
      const results = await ocInvoke(oc, "memory_recall", {
        query: `CHAT::${agentId}`,
        limit,
      });
      const items = Array.isArray(results) ? results : results?.memories || results?.results || [];
      return items
        .map((item: { text?: string }) => {
          const text = item.text || "";
          if (!text.startsWith(`CHAT::${agentId}::`)) return null;
          const rest = text.slice(`CHAT::${agentId}::`.length);
          const sepIdx = rest.indexOf("::");
          if (sepIdx === -1) return null;
          return {
            agent_id: agentId,
            role: rest.slice(0, sepIdx),
            content: rest.slice(sepIdx + 2),
          };
        })
        .filter(Boolean) as ChatMessage[];
    } catch { /* ignore */ }
  }

  return [];
}

// ─── Webhook ──────────────────────────────────────────────

export async function sendWebhook(text: string): Promise<void> {
  const webhookUrl = process.env.TASK_WEBHOOK_URL;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!webhookUrl || !chatId) return;

  if (webhookUrl.includes("api.telegram.org")) {
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
    }).catch(() => {});
  }
}

// ─── Storage info ─────────────────────────────────────────

export function getStorageInfo(): { openclaw: boolean; supabase: boolean; primary: string } {
  const hasOC = !!getOpenClaw();
  const hasSB = !!getSupabase();
  return {
    openclaw: hasOC,
    supabase: hasSB,
    primary: hasOC ? "OpenClaw VPS" : hasSB ? "Supabase" : "localStorage only",
  };
}
