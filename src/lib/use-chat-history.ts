"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase";

export interface ChatMsg {
  id: string;
  role: "user" | "agent" | "assistant" | "system";
  text: string;
  time: string;
}

/**
 * Chat history hook: localStorage instant load + Supabase sync.
 * Each message is stored individually in chat_messages table.
 */
export function useChatHistory(
  agentId: string,
  initialMessages: ChatMsg[],
): [ChatMsg[], (msgs: ChatMsg[] | ((prev: ChatMsg[]) => ChatMsg[])) => void, () => void] {
  const lsKey = `ff_chat_${agentId}`;
  const [messages, setMessages] = useState<ChatMsg[]>(initialMessages);
  const lastSyncedCount = useRef(0);

  // Hydrate: localStorage first, then Supabase
  useEffect(() => {
    try {
      const local = localStorage.getItem(lsKey);
      if (local) {
        const parsed = JSON.parse(local) as ChatMsg[];
        if (parsed.length > 0) setMessages(parsed);
      }
    } catch {}

    if (supabase) {
      Promise.resolve(
        supabase
          .from("chat_messages")
          .select("*")
          .eq("agent_id", agentId)
          .order("created_at", { ascending: true })
          .limit(100)
      )
        .then(({ data }) => {
          if (data && data.length > 0) {
            const mapped: ChatMsg[] = data.map((row) => ({
              id: String(row.id),
              role: row.role as ChatMsg["role"],
              text: row.content,
              time: new Date(row.created_at).toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }));
            setMessages(mapped);
            lastSyncedCount.current = mapped.length;
            try {
              localStorage.setItem(lsKey, JSON.stringify(mapped));
            } catch {}
          }
        })
        .catch(() => {});
    }
  }, [agentId, lsKey]);

  const updateMessages = useCallback(
    (value: ChatMsg[] | ((prev: ChatMsg[]) => ChatMsg[])) => {
      setMessages((prev) => {
        const next = value instanceof Function ? value(prev) : value;

        try {
          localStorage.setItem(lsKey, JSON.stringify(next));
        } catch {}

        // Save only new messages to Supabase
        if (supabase && next.length > lastSyncedCount.current) {
          const newMsgs = next.slice(lastSyncedCount.current);
          const rows = newMsgs
            .filter((m) => m.text)
            .map((m) => ({
              agent_id: agentId,
              role: m.role,
              content: m.text,
            }));

          if (rows.length > 0) {
            supabase!.from("chat_messages").insert(rows).then(() => {});
            lastSyncedCount.current = next.length;
          }
        }

        return next;
      });
    },
    [agentId, lsKey],
  );

  const clearHistory = useCallback(() => {
    setMessages(initialMessages);
    lastSyncedCount.current = 0;
    try {
      localStorage.removeItem(lsKey);
    } catch {}
    if (supabase) {
      supabase!.from("chat_messages").delete().eq("agent_id", agentId).then(() => {});
    }
  }, [agentId, lsKey, initialMessages]);

  return [messages, updateMessages, clearHistory];
}
