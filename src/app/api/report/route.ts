import { NextRequest } from "next/server";
import { type ContentPiece } from "@/lib/pipeline";
import { type CursorTask } from "@/lib/tasks";
import { kvGet, getStorageInfo } from "@/lib/storage";

function checkAuth(req: NextRequest): boolean {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const secret = process.env.API_SECRET;
  if (!secret) return true;
  return token === secret;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const player = await kvGet("rpg_player", { level: 7, xp: 0, gold: 178, mana: 72 });
  const quests = await kvGet<{ done: boolean; priority: string; title: string; xp: number; completed?: string }[]>("rpg_quests", []);
  const pipeline = await kvGet<ContentPiece[]>("content_pipeline", []);
  const tasks = await kvGet<CursorTask[]>("cursor_tasks", []);

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

  const h = now.getHours();
  const greeting = h < 6 ? "Ночная смена, Архитектор." :
    h < 12 ? "Доброе утро, Архитектор." :
    h < 18 ? "Добрый день, Архитектор." : "Добрый вечер, Архитектор.";

  return Response.json({
    greeting,
    storage: getStorageInfo(),
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
  });
}
