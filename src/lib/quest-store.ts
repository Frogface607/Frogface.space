"use client";

export interface Quest {
  id: string;
  title: string;
  project: string;
  xp: number;
  priority: "normal" | "critical" | "boss";
  progress: number;
  done: boolean;
}

const LS_KEY = "ff_hq_quests";

export function getQuests(): Quest[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQuests(quests: Quest[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(quests));
    window.dispatchEvent(new StorageEvent("storage", { key: LS_KEY }));
  } catch {}
}

export function createQuest(
  title: string,
  project = "General",
  priority: Quest["priority"] = "normal",
  xp = 100,
): Quest {
  const quests = getQuests();
  const quest: Quest = {
    id: `q_${Date.now()}`,
    title,
    project,
    xp,
    priority,
    progress: 0,
    done: false,
  };
  quests.unshift(quest);
  saveQuests(quests);
  return quest;
}

export function completeQuest(query: string): Quest | null {
  const quests = getQuests();
  const lower = query.toLowerCase();
  const found = quests.find(
    (q) => !q.done && (q.title.toLowerCase().includes(lower) || q.id === query),
  );
  if (!found) return null;
  found.done = true;
  found.progress = 100;
  saveQuests(quests);
  return found;
}

export function listActiveQuests(): Quest[] {
  return getQuests().filter((q) => !q.done);
}

export interface QuestAction {
  type: "create" | "complete" | "list";
  title?: string;
  project?: string;
  priority?: Quest["priority"];
  xp?: number;
  query?: string;
}

export function parseActions(text: string): QuestAction[] {
  const actions: QuestAction[] = [];
  const regex = /\[QUEST:(.*?)\]/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const raw = match[1].trim();
    const parts = raw.split("|").map((s) => s.trim());

    if (parts[0] === "CREATE" && parts[1]) {
      actions.push({
        type: "create",
        title: parts[1],
        project: parts[2] || "General",
        priority: (parts[3] as Quest["priority"]) || "normal",
        xp: parseInt(parts[4]) || 100,
      });
    } else if (parts[0] === "COMPLETE" && parts[1]) {
      actions.push({ type: "complete", query: parts[1] });
    } else if (parts[0] === "LIST") {
      actions.push({ type: "list" });
    }
  }

  return actions;
}

export function executeActions(actions: QuestAction[]): string[] {
  const results: string[] = [];

  for (const a of actions) {
    switch (a.type) {
      case "create": {
        const q = createQuest(a.title!, a.project, a.priority, a.xp);
        results.push(`✅ Квест создан: "${q.title}" (${q.project}, +${q.xp} XP)`);
        break;
      }
      case "complete": {
        const q = completeQuest(a.query!);
        if (q) results.push(`🏆 Квест выполнен: "${q.title}" (+${q.xp} XP)`);
        else results.push(`⚠️ Квест не найден: "${a.query}"`);
        break;
      }
      case "list": {
        const active = listActiveQuests();
        if (active.length === 0) {
          results.push("📭 Нет активных квестов");
        } else {
          const lines = active.map(
            (q, i) => `${i + 1}. ${q.title} (${q.project}, +${q.xp} XP)`,
          );
          results.push("🎯 Активные квесты:\n" + lines.join("\n"));
        }
        break;
      }
    }
  }

  return results;
}
