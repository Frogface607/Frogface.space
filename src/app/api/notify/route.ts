import { NextRequest } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function checkAuth(req: NextRequest): boolean {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const secret = process.env.API_SECRET;
  if (!secret) return true;
  return token === secret;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { message, from = "cursor", channel = "command" } = body;

  if (!message) {
    return Response.json({ error: "message is required" }, { status: 400 });
  }

  const sb = getSupabase();
  if (!sb) {
    return Response.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const prefix = from === "cursor" ? "🤖 Cursor" : `📨 ${from}`;
  const text = `${prefix}: ${message}`;

  await sb.from("chat_messages").insert(
    { agent_id: channel, role: "system", content: text } as never,
  );

  if (channel !== "moltbot") {
    await sb.from("chat_messages").insert(
      { agent_id: "moltbot", role: "system", content: text } as never,
    );
  }

  await sb.from("activity_log").insert(
    { source: `notify:${from}`, type: "log", text } as never,
  );

  const webhookUrl = process.env.TASK_WEBHOOK_URL;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (webhookUrl && chatId && webhookUrl.includes("api.telegram.org")) {
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
    }).catch(() => {});
  }

  return Response.json({ ok: true, delivered: { chat: true, log: true, webhook: !!webhookUrl } });
}
