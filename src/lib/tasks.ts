export type TaskStatus = "pending" | "in_progress" | "done" | "cancelled";
export type TaskPriority = "boss" | "critical" | "high" | "normal" | "low";
export type TaskAgent = "cursor" | "moltbot" | "human" | "any";

export interface CursorTask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  project: string;
  agent: TaskAgent;
  description: string;
  context?: string;
  files?: string[];
  acceptance?: string[];
  result?: string;
  quest_id?: string;
  created: string;
  updated: string;
}

export const STATUS_LABELS: Record<TaskStatus, { label: string; color: string; emoji: string }> = {
  pending: { label: "Ожидает", color: "text-gold", emoji: "⏳" },
  in_progress: { label: "В работе", color: "text-mana", emoji: "⚡" },
  done: { label: "Готово", color: "text-xp", emoji: "✅" },
  cancelled: { label: "Отменено", color: "text-text-dim", emoji: "❌" },
};

export const PRIORITY_LABELS: Record<TaskPriority, { label: string; color: string }> = {
  boss: { label: "БОСС", color: "text-gold" },
  critical: { label: "Критический", color: "text-hp" },
  high: { label: "Высокий", color: "text-orange-400" },
  normal: { label: "Обычный", color: "text-text" },
  low: { label: "Низкий", color: "text-text-dim" },
};

export const AGENT_LABELS: Record<TaskAgent, { label: string; color: string }> = {
  cursor: { label: "Cursor AI", color: "text-accent" },
  moltbot: { label: "Moltbot", color: "text-violet-400" },
  human: { label: "Архитектор", color: "text-xp" },
  any: { label: "Любой", color: "text-text-dim" },
};

export function taskToMarkdown(task: CursorTask): string {
  const lines = [
    `# ${task.id}: ${task.title}`,
    "",
    `**Статус:** ${task.status}`,
    `**Приоритет:** ${task.priority}`,
    `**Проект:** ${task.project}`,
    `**Исполнитель:** ${task.agent}`,
    `**Создано:** ${task.created}`,
    `**Обновлено:** ${task.updated}`,
    task.quest_id ? `**Квест:** ${task.quest_id}` : "",
    "",
    "## Описание",
    "",
    task.description,
  ];

  if (task.context) {
    lines.push("", "## Контекст", "", task.context);
  }

  if (task.files?.length) {
    lines.push("", "## Файлы", "");
    for (const f of task.files) lines.push(`- \`${f}\``);
  }

  if (task.acceptance?.length) {
    lines.push("", "## Критерии готовности", "");
    for (const a of task.acceptance) {
      const checked = task.status === "done" ? "x" : " ";
      lines.push(`- [${checked}] ${a}`);
    }
  }

  if (task.result) {
    lines.push("", "## Результат", "", task.result);
  }

  return lines.filter((l) => l !== undefined).join("\n") + "\n";
}

export function parseTaskFromMarkdown(content: string): Partial<CursorTask> {
  const task: Partial<CursorTask> = {};

  const titleMatch = content.match(/^# (\S+): (.+)$/m);
  if (titleMatch) {
    task.id = titleMatch[1];
    task.title = titleMatch[2];
  }

  const fieldMap: Record<string, keyof CursorTask> = {
    "Статус": "status",
    "Приоритет": "priority",
    "Проект": "project",
    "Исполнитель": "agent",
    "Создано": "created",
    "Обновлено": "updated",
    "Квест": "quest_id",
  };

  for (const [label, key] of Object.entries(fieldMap)) {
    const match = content.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*(.+)`));
    if (match) (task as Record<string, unknown>)[key] = match[1].trim();
  }

  const descMatch = content.match(/## Описание\n\n([\s\S]*?)(?=\n## |$)/);
  if (descMatch) task.description = descMatch[1].trim();

  const ctxMatch = content.match(/## Контекст\n\n([\s\S]*?)(?=\n## |$)/);
  if (ctxMatch) task.context = ctxMatch[1].trim();

  const filesMatch = content.match(/## Файлы\n\n([\s\S]*?)(?=\n## |$)/);
  if (filesMatch) {
    task.files = filesMatch[1]
      .split("\n")
      .map((l) => l.replace(/^- `/, "").replace(/`$/, "").trim())
      .filter(Boolean);
  }

  const accMatch = content.match(/## Критерии готовности\n\n([\s\S]*?)(?=\n## |$)/);
  if (accMatch) {
    task.acceptance = accMatch[1]
      .split("\n")
      .map((l) => l.replace(/^- \[[ x]\] /, "").trim())
      .filter(Boolean);
  }

  const resMatch = content.match(/## Результат\n\n([\s\S]*?)(?=\n## |$)/);
  if (resMatch) task.result = resMatch[1].trim();

  return task;
}

export function generateTaskId(): string {
  const now = new Date();
  const num = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `TASK-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${num}`;
}
