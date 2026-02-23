import { NextRequest } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { type ContentPiece } from "@/lib/pipeline";
import { type CursorTask } from "@/lib/tasks";

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

async function getKV<T>(sb: SupabaseClient, key: string, fallback: T): Promise<T> {
  const { data } = await sb.from("kv_store").select("value").eq("key", key).maybeSingle();
  if (!data) return fallback;
  return (data as { value: T }).value;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabase();
  if (!sb) {
    return Response.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const player = await getKV(sb, "rpg_player", { level: 7, xp: 0, gold: 178, mana: 72 });
  const quests = await getKV<{ done: boolean; priority: string; title: string; xp: number; completed?: string }[]>(sb, "rpg_quests", []);
  const pipeline = await getKV<ContentPiece[]>(sb, "content_pipeline", []);
  const tasks = await getKV<CursorTask[]>(sb, "cursor_tasks", []);

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const yesterdayStr = new Date(now.getTime() - 86400000).toISOString().split("T")[0];

  const activeQuests = quests.filter((q) => !q.done);
  const completedToday = quests.filter((q) => q.done && q.completed?.startsWith(todayStr));
  const completedYesterday = quests.filter((q) => q.done && q.completed?.startsWith(yesterdayStr));

  const pendingContent = pipeline.filter((c) => c.status === "pending");
  const approvedContent = pipeline.filter((c) => c.status === "approved");

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const doneTasks = tasks.filter((t) => t.status === "done");

  const report = {
    greeting: getGreeting(),
    player,
    quests: {
      active: activeQuests.length,
      bosses: activeQuests.filter((q) => q.priority === "boss").map((q) => q.title),
      crits: activeQuests.filter((q) => q.priority === "critical").map((q) => q.title),
      completed_today: completedToday.length,
      xp_today: completedToday.reduce((s, q) => s + q.xp, 0),
      completed_yesterday: completedYesterday.length,
      xp_yesterday: completedYesterday.reduce((s, q) => s + q.xp, 0),
    },
    content: {
      pending_review: pendingContent.length,
      approved_ready: approvedContent.length,
      total: pipeline.length,
    },
    cursor_tasks: {
      pending: pendingTasks.length,
      done: doneTasks.length,
      total: tasks.length,
    },
  };

  return Response.json(report);
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "Ночная смена, Архитектор. Вот что произошло:";
  if (h < 12) return "Доброе утро, Архитектор. Ночной отчёт:";
  if (h < 18) return "Добрый день, Архитектор. Статус дня:";
  return "Добрый вечер, Архитектор. Итоги:";
}
