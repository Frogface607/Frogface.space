"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ListTodo,
  RefreshCw,
  Filter,
  ChevronDown,
  CheckCircle2,
  Circle,
  Clock,
  XCircle,
  Zap,
  Crown,
  Flame,
  ArrowUpRight,
  Terminal,
  Bot,
  User,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type CursorTask,
  type TaskStatus,
  type TaskPriority,
  type TaskAgent,
  STATUS_LABELS,
  PRIORITY_LABELS,
  AGENT_LABELS,
} from "@/lib/tasks";

const STATUS_ICONS: Record<TaskStatus, typeof Circle> = {
  pending: Clock,
  in_progress: Zap,
  done: CheckCircle2,
  cancelled: XCircle,
};

const AGENT_ICONS: Record<TaskAgent, typeof Bot> = {
  cursor: Terminal,
  moltbot: Bot,
  human: User,
  any: ListTodo,
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<CursorTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [filterAgent, setFilterAgent] = useState<TaskAgent | "all">("all");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch {
      // fallback: use empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filtered = tasks.filter((t) => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterAgent !== "all" && t.agent !== filterAgent) return false;
    return true;
  });

  const statusCounts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
    cancelled: tasks.filter((t) => t.status === "cancelled").length,
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) fetchTasks();
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-bright">Очередь задач</h1>
          <p className="mt-1 text-sm text-text-dim">
            Moltbot → Cursor Bridge · Задачи для AI-агентов
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-1.5 rounded-lg bg-accent/20 px-3 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent/30"
          >
            <Plus className="h-3.5 w-3.5" />
            Создать
          </button>
          <button
            onClick={fetchTasks}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-bg-card px-3 py-2 text-xs text-text-dim transition-colors hover:text-text"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Обновить
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["pending", "in_progress", "done", "cancelled"] as TaskStatus[]).map((s) => {
          const cfg = STATUS_LABELS[s];
          const Icon = STATUS_ICONS[s];
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
              className={cn(
                "rounded-xl border bg-bg-card p-3 text-left transition-all",
                filterStatus === s ? "border-accent" : "border-border hover:border-border/80",
              )}
            >
              <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4", cfg.color)} />
                <span className="text-xs text-text-dim">{cfg.label}</span>
              </div>
              <p className={cn("mt-1 text-lg font-bold", cfg.color)}>{statusCounts[s]}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-text-dim" />
        <div className="flex gap-1.5">
          {(["all", "cursor", "moltbot", "human"] as const).map((a) => (
            <button
              key={a}
              onClick={() => setFilterAgent(filterAgent === a ? "all" : a)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs transition-colors",
                filterAgent === a
                  ? "bg-accent/20 text-accent"
                  : "text-text-dim hover:bg-bg-hover hover:text-text",
              )}
            >
              {a === "all" ? "Все" : AGENT_LABELS[a].label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-text-dim">
          {filtered.length} из {tasks.length}
        </span>
      </div>

      {/* Create form */}
      {showCreate && <CreateTaskForm onCreated={() => { setShowCreate(false); fetchTasks(); }} />}

      {/* Task list */}
      <div className="space-y-2">
        {loading && tasks.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-5 w-5 animate-spin text-text-dim" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-bg-card p-8 text-center">
            <ListTodo className="mx-auto h-8 w-8 text-text-dim/30" />
            <p className="mt-2 text-sm text-text-dim">Нет задач</p>
            <p className="mt-1 text-xs text-text-dim/60">
              Moltbot или API могут создать задачи через POST /api/tasks
            </p>
          </div>
        ) : (
          filtered.map((task) => {
            const isExpanded = expandedTask === task.id;
            const StatusIcon = STATUS_ICONS[task.status];
            const AgentIcon = AGENT_ICONS[task.agent];
            const statusCfg = STATUS_LABELS[task.status];
            const priorityCfg = PRIORITY_LABELS[task.priority];
            const agentCfg = AGENT_LABELS[task.agent];

            return (
              <div
                key={task.id}
                className="rounded-xl border border-border bg-bg-card transition-all hover:border-border/80"
              >
                <button
                  onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <StatusIcon className={cn("h-5 w-5 shrink-0", statusCfg.color)} />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-text-bright">{task.title}</span>
                      {task.priority === "boss" && (
                        <span className="flex items-center gap-0.5 rounded bg-gold/20 px-1.5 py-0.5 text-[10px] font-bold text-gold">
                          <Crown className="h-2.5 w-2.5" /> БОСС
                        </span>
                      )}
                      {task.priority === "critical" && (
                        <span className="flex items-center gap-0.5 rounded bg-hp/20 px-1.5 py-0.5 text-[10px] font-medium text-hp">
                          <Flame className="h-2.5 w-2.5" /> крит
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-text-dim">
                      <span className="font-mono">{task.id}</span>
                      <span>{task.project}</span>
                      <span className="flex items-center gap-1">
                        <AgentIcon className="h-2.5 w-2.5" />
                        {agentCfg.label}
                      </span>
                    </div>
                  </div>

                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-text-dim transition-transform",
                      isExpanded && "rotate-180",
                    )}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-4 pb-4 pt-3">
                    <p className="text-sm leading-relaxed text-text">{task.description}</p>

                    {task.context && (
                      <div className="mt-3">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-text-dim">
                          Контекст
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-text-dim">{task.context}</p>
                      </div>
                    )}

                    {task.files && task.files.length > 0 && (
                      <div className="mt-3">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-text-dim">
                          Файлы
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {task.files.map((f) => (
                            <span key={f} className="rounded bg-bg-deep px-2 py-0.5 font-mono text-[10px] text-accent">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {task.acceptance && task.acceptance.length > 0 && (
                      <div className="mt-3">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-text-dim">
                          Критерии готовности
                        </p>
                        <ul className="mt-1 space-y-1">
                          {task.acceptance.map((a, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs text-text-dim">
                              {task.status === "done" ? (
                                <CheckCircle2 className="h-3 w-3 text-xp" />
                              ) : (
                                <Circle className="h-3 w-3 text-text-dim/30" />
                              )}
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {task.result && (
                      <div className="mt-3 rounded-lg bg-xp/5 p-3">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-xp">
                          Результат
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-text">{task.result}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex gap-2">
                      {task.status === "pending" && (
                        <button
                          onClick={() => updateTaskStatus(task.id, "in_progress")}
                          className="flex items-center gap-1.5 rounded-lg bg-mana/20 px-3 py-1.5 text-xs font-medium text-mana transition-colors hover:bg-mana/30"
                        >
                          <Zap className="h-3 w-3" />
                          Взять в работу
                        </button>
                      )}
                      {task.status === "in_progress" && (
                        <button
                          onClick={() => updateTaskStatus(task.id, "done")}
                          className="flex items-center gap-1.5 rounded-lg bg-xp/20 px-3 py-1.5 text-xs font-medium text-xp transition-colors hover:bg-xp/30"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Завершить
                        </button>
                      )}
                      {(task.status === "pending" || task.status === "in_progress") && (
                        <button
                          onClick={() => updateTaskStatus(task.id, "cancelled")}
                          className="flex items-center gap-1.5 rounded-lg bg-hp/10 px-3 py-1.5 text-xs text-hp/60 transition-colors hover:bg-hp/20 hover:text-hp"
                        >
                          <XCircle className="h-3 w-3" />
                          Отменить
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* API hint */}
      <div className="rounded-xl border border-border/50 bg-bg-deep p-4">
        <div className="flex items-center gap-2">
          <ArrowUpRight className="h-4 w-4 text-accent" />
          <p className="text-xs font-medium text-text-bright">API для ботов</p>
        </div>
        <div className="mt-2 space-y-1 font-mono text-[10px] text-text-dim">
          <p>GET  /api/tasks?status=pending&agent=cursor</p>
          <p>POST /api/tasks {`{title, description, priority, project, agent, files, acceptance}`}</p>
          <p>PATCH /api/tasks {`{id, status, result}`}</p>
        </div>
      </div>
    </div>
  );
}

function CreateTaskForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [project, setProject] = useState("frogface");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [agent, setAgent] = useState<TaskAgent>("cursor");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!title.trim() || !description.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, project, priority, agent }),
      });
      if (res.ok) onCreated();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-accent/30 bg-bg-card p-4 space-y-3">
      <p className="text-xs font-medium text-accent">Новая задача</p>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Название задачи"
        className="w-full rounded-lg border border-border bg-bg-deep px-3 py-2 text-sm text-text-bright placeholder:text-text-dim/40 focus:border-accent focus:outline-none"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Описание — что нужно сделать"
        rows={3}
        className="w-full rounded-lg border border-border bg-bg-deep px-3 py-2 text-sm text-text-bright placeholder:text-text-dim/40 focus:border-accent focus:outline-none"
      />
      <div className="flex flex-wrap gap-3">
        <select
          value={project}
          onChange={(e) => setProject(e.target.value)}
          className="rounded-lg border border-border bg-bg-deep px-2 py-1.5 text-xs text-text"
        >
          <option value="frogface">Frogface</option>
          <option value="myreply">MyReply</option>
          <option value="edison">Edison</option>
          <option value="video">Видео</option>
          <option value="content">Контент</option>
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
          className="rounded-lg border border-border bg-bg-deep px-2 py-1.5 text-xs text-text"
        >
          <option value="boss">БОСС</option>
          <option value="critical">Критический</option>
          <option value="high">Высокий</option>
          <option value="normal">Обычный</option>
          <option value="low">Низкий</option>
        </select>
        <select
          value={agent}
          onChange={(e) => setAgent(e.target.value as TaskAgent)}
          className="rounded-lg border border-border bg-bg-deep px-2 py-1.5 text-xs text-text"
        >
          <option value="cursor">Cursor AI</option>
          <option value="moltbot">Moltbot</option>
          <option value="human">Архитектор</option>
          <option value="any">Любой</option>
        </select>
      </div>
      <button
        onClick={submit}
        disabled={saving || !title.trim() || !description.trim()}
        className="rounded-lg bg-accent px-4 py-2 text-xs font-medium text-bg-deep transition-colors hover:bg-accent/80 disabled:opacity-40"
      >
        {saving ? "Создаю..." : "Создать задачу"}
      </button>
    </div>
  );
}
