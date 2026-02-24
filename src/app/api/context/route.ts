import { NextRequest } from "next/server";
import { kvGet } from "@/lib/storage";
import { type CursorTask } from "@/lib/tasks";
import { type ContentPiece } from "@/lib/pipeline";

/**
 * Returns full context for Moltbot's system prompt.
 * Fetches tasks, quests, pipeline, player state + OpenClaw memory.
 */
export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") || "";

  const [player, quests, tasks, pipeline] = await Promise.all([
    kvGet("rpg_player", { level: 7, xp: 0, gold: 178, mana: 72 }),
    kvGet<{ id: string; title: string; project: string; xp: number; priority: string; done: boolean }[]>("rpg_quests", []),
    kvGet<CursorTask[]>("cursor_tasks", []),
    kvGet<ContentPiece[]>("content_pipeline", []),
  ]);

  const activeQuests = (quests as typeof quests).filter((q) => !q.done);
  const pendingTasks = tasks.filter((t) => t.status === "pending" || t.status === "in_progress");
  const pendingContent = pipeline.filter((c) => c.status === "pending");

  const lines: string[] = [];

  lines.push("=== СОСТОЯНИЕ СИСТЕМЫ ===");
  const p = player as { level?: number; xp?: number; gold?: number; mana?: number; quests_completed?: number };
  lines.push(`Игрок: Ур.${p.level} | XP: ${p.xp} | Gold: ${p.gold}K₽ | Mana: ${p.mana} | Квестов выполнено: ${p.quests_completed || 0}`);
  lines.push("");

  if (activeQuests.length > 0) {
    lines.push(`=== АКТИВНЫЕ КВЕСТЫ (${activeQuests.length}) ===`);
    for (const q of activeQuests.slice(0, 15)) {
      const tag = q.priority === "boss" ? "👑БОСС" : q.priority === "critical" ? "🔥КРИТ" : q.project;
      lines.push(`- [${tag}] ${q.title} (+${q.xp} XP)`);
    }
    lines.push("");
  }

  if (pendingTasks.length > 0) {
    lines.push(`=== ЗАДАЧИ CURSOR (${pendingTasks.length}) ===`);
    for (const t of pendingTasks.slice(0, 10)) {
      lines.push(`- [${t.status}] ${t.title} (${t.project}, ${t.priority})`);
    }
    lines.push("");
  }

  if (pendingContent.length > 0) {
    lines.push(`=== КОНТЕНТ НА ПРОВЕРКУ (${pendingContent.length}) ===`);
    for (const c of pendingContent.slice(0, 5)) {
      lines.push(`- [${c.brand}] ${c.topic}`);
    }
    lines.push("");
  }

  let memories = "";
  const ocUrl = process.env.OPENCLAW_URL;
  const ocToken = process.env.OPENCLAW_GATEWAY_TOKEN;
  if (ocUrl && ocToken && query) {
    try {
      const res = await fetch(`${ocUrl}/tools/invoke`, {
        method: "POST",
        headers: { Authorization: `Bearer ${ocToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "memory_recall", args: { query, limit: 5 } }),
      });
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : data?.memories || data?.results || [];
        const relevant = items
          .filter((m: { text?: string }) => m.text && !m.text.startsWith("KV::") && !m.text.startsWith("LOG::") && !m.text.startsWith("CHAT::"))
          .slice(0, 5);
        if (relevant.length > 0) {
          lines.push("=== ПАМЯТЬ (OpenClaw) ===");
          for (const m of relevant) {
            lines.push(`- ${(m.text || "").slice(0, 200)}`);
          }
          memories = relevant.map((m: { text?: string }) => m.text || "").join("\n");
        }
      }
    } catch { /* openclaw unavailable */ }
  }

  return Response.json({
    context: lines.join("\n"),
    summary: {
      quests: activeQuests.length,
      tasks: pendingTasks.length,
      content: pendingContent.length,
      player: p,
    },
    memories,
  });
}
