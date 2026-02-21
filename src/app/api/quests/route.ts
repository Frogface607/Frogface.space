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

  const { data } = await sb.from("kv_store").select("value").eq("key", "ff_hq_quests").maybeSingle();
  return Response.json({ quests: data?.value || [] });
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getSupabase();
  if (!sb) return Response.json({ error: "Supabase not configured" }, { status: 500 });

  const body = await req.json();
  const { title, project = "General", xp = 100, priority = "normal" } = body;

  if (!title) return Response.json({ error: "title is required" }, { status: 400 });

  const { data: existing } = await sb
    .from("kv_store")
    .select("value")
    .eq("key", "ff_hq_quests")
    .maybeSingle();

  const quests = (existing?.value as unknown[]) || [];
  const newQuest = {
    id: `q_${Date.now()}`,
    title,
    project,
    xp,
    priority,
    progress: 0,
    done: false,
  };
  quests.push(newQuest);

  await sb.from("kv_store").upsert({
    key: "ff_hq_quests",
    value: quests,
    updated_at: new Date().toISOString(),
  });

  return Response.json({ ok: true, quest: newQuest });
}
