import { NextRequest } from "next/server";
import { kvGet, kvSet, logAppend } from "@/lib/storage";

const KV_PLAYER = "rpg_player";
const KV_QUESTS = "rpg_quests";

function checkAuth(req: NextRequest): boolean {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const secret = process.env.API_SECRET;
  if (!secret) return true;
  return token === secret;
}

export interface RpgQuest {
  id: string;
  title: string;
  project: string;
  chain?: string;
  xp: number;
  priority: "normal" | "critical" | "boss";
  progress: number;
  done: boolean;
  note?: string;
  created: string;
  completed?: string;
}

export interface PlayerState {
  level: number;
  xp: number;
  xp_to_next: number;
  gold: number;
  mana: number;
  mana_max: number;
  quests_completed: number;
  achievements: string[];
  updated: string;
}

const DEFAULT_PLAYER: PlayerState = {
  level: 7, xp: 2847, xp_to_next: 5000, gold: 178, mana: 72, mana_max: 100,
  quests_completed: 8, achievements: ["first_blood", "architect", "voice_master", "solo_preneur"],
  updated: new Date().toISOString(),
};

function xpForLevel(level: number): number {
  return Math.floor(1000 * Math.pow(1.5, level - 1));
}

function processLevelUp(player: PlayerState): { player: PlayerState; leveled: boolean } {
  let leveled = false;
  while (player.xp >= player.xp_to_next) {
    player.xp -= player.xp_to_next;
    player.level += 1;
    player.xp_to_next = xpForLevel(player.level);
    leveled = true;
  }
  return { player, leveled };
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const player = await kvGet<PlayerState>(KV_PLAYER, DEFAULT_PLAYER);
  const quests = await kvGet<RpgQuest[]>(KV_QUESTS, []);

  return Response.json({
    player,
    quests: quests.filter((q) => !q.done),
    completed: quests.filter((q) => q.done),
    total: quests.length,
  });
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try { body = await req.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { action } = body;

  if (action === "create_quest") {
    const { title, project = "General", priority = "normal", xp = 100, note, chain } = body;
    if (!title) return Response.json({ error: "title required" }, { status: 400 });

    const quest: RpgQuest = {
      id: `rq_${Date.now()}`, title, project, chain, xp, priority,
      progress: 0, done: false, note, created: new Date().toISOString(),
    };

    const quests = await kvGet<RpgQuest[]>(KV_QUESTS, []);
    quests.unshift(quest);
    await kvSet(KV_QUESTS, quests);
    await logAppend({ source: "rpg", type: "log", text: `Новый квест: ${quest.title} (+${quest.xp} XP)` });

    return Response.json({ ok: true, quest });
  }

  if (action === "complete_quest") {
    const { quest_id, query } = body;
    const quests = await kvGet<RpgQuest[]>(KV_QUESTS, []);
    let player = await kvGet<PlayerState>(KV_PLAYER, DEFAULT_PLAYER);

    let found: RpgQuest | undefined;
    if (quest_id) found = quests.find((q) => q.id === quest_id && !q.done);
    else if (query) {
      const lower = query.toLowerCase();
      found = quests.find((q) => !q.done && q.title.toLowerCase().includes(lower));
    }
    if (!found) return Response.json({ error: "Quest not found" }, { status: 404 });

    found.done = true;
    found.progress = 100;
    found.completed = new Date().toISOString();

    player.xp += found.xp;
    player.quests_completed += 1;
    const { player: up, leveled } = processLevelUp(player);
    player = up;
    player.updated = new Date().toISOString();

    await kvSet(KV_QUESTS, quests);
    await kvSet(KV_PLAYER, player);

    const logText = leveled
      ? `Квест выполнен: ${found.title} (+${found.xp} XP) УРОВЕНЬ ${player.level}!`
      : `Квест выполнен: ${found.title} (+${found.xp} XP)`;
    await logAppend({ source: "rpg", type: leveled ? "achievement" : "xp", text: logText });

    return Response.json({ ok: true, quest: found, xp_gained: found.xp, leveled_up: leveled, player });
  }

  if (action === "update_progress") {
    const { quest_id, progress } = body;
    const quests = await kvGet<RpgQuest[]>(KV_QUESTS, []);
    const found = quests.find((q) => q.id === quest_id);
    if (!found) return Response.json({ error: "Quest not found" }, { status: 404 });
    found.progress = Math.min(100, Math.max(0, progress));
    await kvSet(KV_QUESTS, quests);
    return Response.json({ ok: true, quest: found });
  }

  if (action === "update_player") {
    const { gold, mana } = body;
    const player = await kvGet<PlayerState>(KV_PLAYER, DEFAULT_PLAYER);
    if (gold !== undefined) player.gold = gold;
    if (mana !== undefined) player.mana = mana;
    player.updated = new Date().toISOString();
    await kvSet(KV_PLAYER, player);
    return Response.json({ ok: true, player });
  }

  if (action === "add_achievement") {
    const { achievement_id, name } = body;
    const player = await kvGet<PlayerState>(KV_PLAYER, DEFAULT_PLAYER);
    if (!player.achievements.includes(achievement_id)) {
      player.achievements.push(achievement_id);
      player.updated = new Date().toISOString();
      await kvSet(KV_PLAYER, player);
      await logAppend({ source: "rpg", type: "achievement", text: `Достижение: ${name || achievement_id}` });
    }
    return Response.json({ ok: true, player });
  }

  if (action === "morning_report") {
    const quests = await kvGet<RpgQuest[]>(KV_QUESTS, []);
    const player = await kvGet<PlayerState>(KV_PLAYER, DEFAULT_PLAYER);
    const active = quests.filter((q) => !q.done);
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const completedYesterday = quests.filter((q) => q.done && q.completed?.startsWith(yesterday));

    return Response.json({
      player,
      summary: {
        active_quests: active.length,
        boss_quests: active.filter((q) => q.priority === "boss").map((q) => q.title),
        critical_quests: active.filter((q) => q.priority === "critical").map((q) => q.title),
        completed_yesterday: completedYesterday.length,
        xp_yesterday: completedYesterday.reduce((s, q) => s + q.xp, 0),
        level: player.level,
        gold: player.gold,
        mana: player.mana,
      },
    });
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}
