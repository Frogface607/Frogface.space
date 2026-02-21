import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
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

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getSupabase();
  if (!sb) return Response.json({ error: "Supabase not configured" }, { status: 500 });

  const limit = Number(req.nextUrl.searchParams.get("limit")) || 20;
  const source = req.nextUrl.searchParams.get("source");

  let query = sb.from("activity_log").select("*").order("created_at", { ascending: false }).limit(limit);
  if (source) query = query.eq("source", source);

  const { data } = await query;
  return Response.json({ log: data || [] });
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getSupabase();
  if (!sb) return Response.json({ error: "Supabase not configured" }, { status: 500 });

  const body = await req.json();
  const { text, source = "command", type = "log" } = body;

  if (!text) return Response.json({ error: "text is required" }, { status: 400 });

  const { data, error } = await sb
    .from("activity_log")
    .insert({ text, source, type })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true, entry: data });
}
