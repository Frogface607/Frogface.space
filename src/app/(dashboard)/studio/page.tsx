"use client";

import { useState } from "react";
import {
  Bot,
  Brain,
  Megaphone,
  BarChart3,
  Palette,
  ShoppingCart,
  PenTool,
  Shield,
  Gamepad2,
  Activity,
  Power,
  Send,
  ChevronDown,
  ChevronUp,
  Zap,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AgentStatus = "active" | "idle" | "standby" | "off";

interface AgentTask {
  id: string;
  text: string;
  time: string;
  done: boolean;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  desc: string;
  icon: LucideIcon;
  status: AgentStatus;
  model: string;
  tasks: AgentTask[];
  color: string;
  log: string[];
}

const INITIAL_AGENTS: Agent[] = [
  {
    id: "moltbot",
    name: "Moltbot",
    role: "Операционный директор",
    desc: "Операционный мозг. Логирование, контекст, менеджмент задач и агентов.",
    icon: Brain,
    status: "active",
    model: "Claude Sonnet 4",
    tasks: [
      { id: "m1", text: "Мониторить статус агентов", time: "постоянно", done: false },
      { id: "m2", text: "Обновить контекст проектов", time: "2ч назад", done: true },
    ],
    color: "from-violet-500 to-purple-400",
    log: ["Контекст загружен", "Все агенты на связи", "Голосовые готовы"],
  },
  {
    id: "gm",
    name: "Game Master",
    role: "Нарративный движок",
    desc: "Нарратив, ачивки, weekly reports. Превращает прогресс в историю.",
    icon: Gamepad2,
    status: "active",
    model: "Claude Opus",
    tasks: [
      { id: "g1", text: "Сгенерировать weekly report", time: "ожидает", done: false },
      { id: "g2", text: "Проверить ачивки за неделю", time: "ожидает", done: false },
    ],
    color: "from-amber-500 to-yellow-400",
    log: ["Глава 1 начата", "Ачивка 'Первая кровь' выдана"],
  },
  {
    id: "analyst",
    name: "Аналитик",
    role: "Данные и стратегия",
    desc: "Анализ метрик, воронок, прогноз успеха, приоритизация задач.",
    icon: BarChart3,
    status: "active",
    model: "Claude Sonnet 4",
    tasks: [
      { id: "a1", text: "Анализ воронки MyReply", time: "в работе", done: false },
      { id: "a2", text: "Прогноз MRR на месяц", time: "ожидает", done: false },
    ],
    color: "from-blue-500 to-cyan-400",
    log: ["Метрики MyReply загружены", "Воронка проанализирована"],
  },
  {
    id: "marketer",
    name: "Маркетолог",
    role: "Рост и исследования",
    desc: "Исследования рынка, гипотезы, стратегии роста, конкурентный анализ.",
    icon: Megaphone,
    status: "idle",
    model: "Claude Sonnet 4",
    tasks: [
      { id: "mk1", text: "Анализ конкурентов MyReply", time: "ожидает", done: false },
    ],
    color: "from-green-500 to-emerald-400",
    log: ["Ожидаю задач"],
  },
  {
    id: "content",
    name: "Контент-мейкер",
    role: "SMM и копирайт",
    desc: "Постинг, копирайт, соцсети. Автономный контент-конвейер.",
    icon: PenTool,
    status: "idle",
    model: "Claude Haiku",
    tasks: [
      { id: "c1", text: "Написать пост для TG-канала MyReply", time: "ожидает", done: false },
      { id: "c2", text: "Контент-план на неделю", time: "ожидает", done: false },
    ],
    color: "from-pink-500 to-rose-400",
    log: ["Ожидаю задач"],
  },
  {
    id: "designer",
    name: "Дизайнер",
    role: "Визуальное производство",
    desc: "Генерация изображений, баннеров, креативов. FreePik + AI.",
    icon: Palette,
    status: "idle",
    model: "FreePik API",
    tasks: [],
    color: "from-orange-500 to-red-400",
    log: ["Ожидаю задач"],
  },
  {
    id: "sales",
    name: "Сейлз-агент",
    role: "Выручка и конверсия",
    desc: "Автоматизированные воронки, B2B-outreach, конверсия лидов.",
    icon: ShoppingCart,
    status: "standby",
    model: "Claude Sonnet 4",
    tasks: [],
    color: "from-emerald-500 to-teal-400",
    log: ["В резерве"],
  },
  {
    id: "guardian",
    name: "Страж",
    role: "Щит от хаоса",
    desc: "Pre-mortem анализ, пожарные сценарии, защита от распыления.",
    icon: Shield,
    status: "active",
    model: "Claude Opus",
    tasks: [
      { id: "gu1", text: "Pre-mortem: запуск MyReply", time: "ожидает", done: false },
    ],
    color: "from-red-500 to-pink-400",
    log: ["Мониторю фокус", "Распыление не обнаружено"],
  },
];

const statusConfig: Record<AgentStatus, { label: string; color: string; dot: string; bg: string }> = {
  active: { label: "Активен", color: "text-xp", dot: "bg-xp", bg: "bg-xp/10" },
  idle: { label: "Ожидание", color: "text-gold", dot: "bg-gold", bg: "bg-gold/10" },
  standby: { label: "В резерве", color: "text-text-dim", dot: "bg-text-dim", bg: "bg-text-dim/10" },
  off: { label: "Выключен", color: "text-hp/50", dot: "bg-hp/50", bg: "bg-hp/5" },
};

const STATUS_CYCLE: AgentStatus[] = ["active", "idle", "standby", "off"];

export default function StudioPage() {
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});

  const cycleStatus = (agentId: string) => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id !== agentId) return a;
        const idx = STATUS_CYCLE.indexOf(a.status);
        const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
        return {
          ...a,
          status: next,
          log: [`Статус → ${statusConfig[next].label}`, ...a.log.slice(0, 9)],
        };
      })
    );
  };

  const addTask = (agentId: string) => {
    const text = taskInputs[agentId]?.trim();
    if (!text) return;
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id !== agentId) return a;
        return {
          ...a,
          tasks: [
            ...a.tasks,
            { id: Date.now().toString(), text, time: "сейчас", done: false },
          ],
          log: [`Новая задача: ${text}`, ...a.log.slice(0, 9)],
        };
      })
    );
    setTaskInputs((prev) => ({ ...prev, [agentId]: "" }));
  };

  const toggleTask = (agentId: string, taskId: string) => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id !== agentId) return a;
        return {
          ...a,
          tasks: a.tasks.map((t) =>
            t.id === taskId ? { ...t, done: !t.done } : t
          ),
        };
      })
    );
  };

  const activeCount = agents.filter((a) => a.status === "active").length;
  const totalTasks = agents.reduce((s, a) => s + a.tasks.filter((t) => !t.done).length, 0);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-bright">Frogface Studio</h1>
          <p className="mt-1 text-sm text-text-dim">
            Пульт управления агентами. Нажимай, давай задачи, контролируй.
          </p>
        </div>
        <div className="flex gap-3">
          <MetricBadge icon={<Zap className="h-4 w-4 text-xp" />} label="Активные" value={`${activeCount}/${agents.length}`} />
          <MetricBadge icon={<Activity className="h-4 w-4 text-accent" />} label="Задачи" value={String(totalTasks)} />
          <MetricBadge icon={<Clock className="h-4 w-4 text-gold" />} label="API сегодня" value="~$2.40" />
        </div>
      </div>

      <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
        <div className="flex items-center justify-center gap-2 text-xs text-accent">
          <Bot className="h-4 w-4" />
          <span className="font-medium">Иерархия:</span>
          <span className="text-text-dim">
            Ты (Архитектор) → Moltbot (Директор) → Агенты → Задачи
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {agents.map((agent) => {
          const st = statusConfig[agent.status];
          const isExpanded = expanded === agent.id;
          const pendingTasks = agent.tasks.filter((t) => !t.done).length;

          return (
            <div
              key={agent.id}
              className={cn(
                "rounded-xl border bg-bg-card transition-all",
                agent.status === "active" ? "border-xp/20" : "border-border",
                agent.status === "off" && "opacity-50"
              )}
            >
              {/* Agent header row */}
              <div className="flex items-center gap-4 p-4">
                <div className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${agent.color}`}>
                  <agent.icon className="h-5 w-5 text-white" />
                  {agent.status === "active" && (
                    <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-xp ring-2 ring-bg-card" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-text-bright">{agent.name}</h3>
                    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", st.bg, st.color)}>
                      {st.label}
                    </span>
                    {pendingTasks > 0 && (
                      <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[10px] text-accent">
                        {pendingTasks} задач
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-dim">{agent.role} · {agent.model}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => cycleStatus(agent.id)}
                    className={cn(
                      "rounded-lg p-2 transition-colors",
                      agent.status === "active"
                        ? "bg-xp/10 text-xp hover:bg-xp/20"
                        : agent.status === "off"
                          ? "bg-hp/10 text-hp/50 hover:bg-hp/20"
                          : "bg-bg-hover text-text-dim hover:text-text"
                    )}
                    title="Переключить статус"
                  >
                    <Power className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : agent.id)}
                    className="rounded-lg bg-bg-hover p-2 text-text-dim transition-colors hover:text-text"
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded panel */}
              {isExpanded && (
                <div className="border-t border-border px-4 pb-4 pt-3">
                  <p className="mb-3 text-[11px] leading-relaxed text-text-dim">{agent.desc}</p>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Tasks */}
                    <div>
                      <h4 className="mb-2 text-xs font-semibold text-text-bright">Задачи</h4>

                      <div className="mb-2 flex gap-1.5">
                        <input
                          type="text"
                          value={taskInputs[agent.id] || ""}
                          onChange={(e) =>
                            setTaskInputs((prev) => ({ ...prev, [agent.id]: e.target.value }))
                          }
                          onKeyDown={(e) => e.key === "Enter" && addTask(agent.id)}
                          placeholder="Новая задача..."
                          className="flex-1 rounded-lg border border-border bg-bg-deep px-3 py-1.5 text-xs text-text placeholder:text-text-dim/40 focus:border-accent/50 focus:outline-none"
                        />
                        <button
                          onClick={() => addTask(agent.id)}
                          disabled={!taskInputs[agent.id]?.trim()}
                          className="rounded-lg bg-accent/20 px-2 text-accent transition-colors hover:bg-accent/30 disabled:opacity-30"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="max-h-40 space-y-1 overflow-y-auto">
                        {agent.tasks.length === 0 && (
                          <p className="text-[10px] italic text-text-dim/50">Нет задач</p>
                        )}
                        {agent.tasks.map((task) => (
                          <label
                            key={task.id}
                            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-bg-hover"
                          >
                            <input
                              type="checkbox"
                              checked={task.done}
                              onChange={() => toggleTask(agent.id, task.id)}
                              className="accent-accent"
                            />
                            <span className={cn("text-xs", task.done ? "text-text-dim line-through" : "text-text")}>
                              {task.text}
                            </span>
                            <span className="ml-auto text-[9px] text-text-dim/50">{task.time}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Activity log */}
                    <div>
                      <h4 className="mb-2 text-xs font-semibold text-text-bright">Лог активности</h4>
                      <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-lg bg-bg-deep p-2.5">
                        {agent.log.map((entry, i) => (
                          <p key={i} className="text-[10px] text-text-dim">
                            <span className="mr-1 text-accent">›</span>
                            {entry}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-bg-card p-5">
        <p className="text-center text-xs italic text-text-dim">
          &quot;Никаких людей, но множество агентов. Они сильно умнее, сильно лучше,
          сильно прокачаннее в плане знаний.&quot;
          <span className="ml-2 text-accent">— Сергей</span>
        </p>
      </div>
    </div>
  );
}

function MetricBadge({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-card px-3 py-2">
      {icon}
      <div>
        <p className="text-[10px] text-text-dim">{label}</p>
        <p className="text-xs font-bold text-text-bright">{value}</p>
      </div>
    </div>
  );
}
