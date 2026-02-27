import { readFile } from "fs/promises";
import { join } from "path";

async function readJson<T>(filename: string, fallback: T): Promise<T> {
  try {
    const content = await readFile(join(process.cwd(), "data", filename), "utf-8");
    return JSON.parse(content);
  } catch {
    return fallback;
  }
}

export async function GET() {
  const [player, quests, chronicle] = await Promise.all([
    readJson("player.json", { level: 7, xp: 0, gold: 178, mana: 72 }),
    readJson<{ id: string; title: string; project: string; xp: number; priority: string; done: boolean }[]>("quests.json", []),
    readJson<{ date: string; title: string; entries: string[]; xp_earned: number }[]>("chronicle.json", []),
  ]);

  const activeQuests = quests.filter((q) => !q.done);
  const completedQuests = quests.filter((q) => q.done);
  const lastDay = chronicle[chronicle.length - 1];

  const h = new Date().getHours();
  const greeting = h < 6 ? "Ночная смена" : h < 12 ? "Доброе утро" : h < 18 ? "Добрый день" : "Добрый вечер";

  return Response.json({
    greeting,
    player,
    quests: {
      active: activeQuests,
      completed: completedQuests.length,
      total: quests.length,
    },
    lastDay,
  });
}
