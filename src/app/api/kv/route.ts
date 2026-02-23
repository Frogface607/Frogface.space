import { NextRequest } from "next/server";
import { kvGet, kvSet } from "@/lib/storage";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key) return Response.json({ error: "key required" }, { status: 400 });

  const value = await kvGet(key, null);
  return Response.json({ key, value });
}

export async function POST(req: NextRequest) {
  let body;
  try { body = await req.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { key, value } = body;
  if (!key) return Response.json({ error: "key required" }, { status: 400 });

  await kvSet(key, value);
  return Response.json({ ok: true });
}
