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

  const result: Record<string, unknown> = {
    system: "frogface",
    version: "1.0",
    timestamp: new Date().toISOString(),
    supabase: !!sb,
    openrouter: !!process.env.OPENROUTER_API_KEY,
  };

  if (sb) {
    const { data: quests } = await sb.from("kv_store").select("value").eq("key", "ff_hq_quests").maybeSingle();
    const questList = (quests?.value as { done: boolean; xp: number }[]) || [];
    const { count } = await sb.from("activity_log").select("*", { count: "exact", head: true });

    result.quests = {
      total: questList.length,
      done: questList.filter((q) => q.done).length,
      totalXp: questList.reduce((s, q) => s + (q.xp || 0), 0),
    };
    result.logEntries = count || 0;
  }

  return Response.json(result);
}
