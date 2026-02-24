import { NextRequest } from "next/server";
import { chatSave, logAppend, sendWebhook } from "@/lib/storage";

function checkAuth(req: NextRequest): boolean {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const secret = process.env.API_SECRET;
  if (!secret) return true;
  return token === secret;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try { body = await req.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { message, from = "cursor", channel = "command" } = body;
  if (!message) return Response.json({ error: "message is required" }, { status: 400 });

  const prefix = from === "cursor" ? "🤖 Cursor" : `📨 ${from}`;
  const text = `${prefix}: ${message}`;

  await chatSave({ agent_id: channel, role: "system", content: text });
  if (channel !== "moltbot") {
    await chatSave({ agent_id: "moltbot", role: "system", content: text });
  }
  await logAppend({ source: `notify:${from}`, type: "log", text });
  sendWebhook(text);

  return Response.json({ ok: true, delivered: true });
}
