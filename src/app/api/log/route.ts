import { NextRequest } from "next/server";
import { logAppend, logRecent } from "@/lib/storage";

function checkAuth(req: NextRequest): boolean {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const secret = process.env.API_SECRET;
  if (!secret) return true;
  return token === secret;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const limit = Number(req.nextUrl.searchParams.get("limit")) || 20;
  const source = req.nextUrl.searchParams.get("source") || undefined;

  const log = await logRecent(limit, source);
  return Response.json({ log });
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { text, source = "command", type = "log" } = body;

  if (!text) return Response.json({ error: "text is required" }, { status: 400 });

  await logAppend({ text, source, type });
  return Response.json({ ok: true });
}
