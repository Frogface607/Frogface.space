"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Power,
  CheckCircle2,
  Circle,
  Plus,
  Settings2,
  Sparkles,
  User,
  Activity,
} from "lucide-react";
import { AGENTS, STATUS_CONFIG, STATUS_CYCLE, type AgentData, type AgentTask, type AgentStatus } from "@/lib/agents";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/lib/use-local-storage";

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  time: string;
}

export default function AgentPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const baseAgent = AGENTS.find((a) => a.id === agentId);

  if (!baseAgent) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-text-dim">Агент не найден</p>
          <Link href="/studio" className="mt-2 text-sm text-accent hover:underline">
            ← Назад в Студию
          </Link>
        </div>
      </div>
    );
  }

  return <AgentDashboard agent={baseAgent} />;
}

function AgentDashboard({ agent: initialAgent }: { agent: AgentData }) {
  const [status, setStatus] = useLocalStorage<AgentStatus>(`ff_agent_${initialAgent.id}_status`, initialAgent.status);
  const [tasks, setTasks] = useLocalStorage<AgentTask[]>(`ff_agent_${initialAgent.id}_tasks`, initialAgent.tasks);
  const [taskInput, setTaskInput] = useState("");
  const [log, setLog] = useLocalStorage<string[]>(`ff_agent_${initialAgent.id}_log`, initialAgent.log);
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>(`ff_agent_${initialAgent.id}_chat`, [
    { id: "greeting", role: "agent", text: initialAgent.greeting, time: now() },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const st = STATUS_CONFIG[status];

  const cycleStatus = () => {
    const idx = STATUS_CYCLE.indexOf(status);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    setStatus(next);
    addLog(`Статус → ${STATUS_CONFIG[next].label}`);
  };

  const addLog = (text: string) => {
    setLog((prev) => [text, ...prev.slice(0, 19)]);
  };

  const addTask = () => {
    const text = taskInput.trim();
    if (!text) return;
    setTasks((prev) => [...prev, { id: Date.now().toString(), text, time: "сейчас", done: false }]);
    addLog(`Новая задача: ${text}`);
    setTaskInput("");
  };

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const done = !t.done;
        if (done) addLog(`Задача выполнена: ${t.text}`);
        return { ...t, done };
      })
    );
  };

  const sendMessage = async () => {
    const text = chatInput.trim();
    if (!text || typing) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", text, time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setTyping(true);

    const agentMsgId = (Date.now() + 1).toString();

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        content: m.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "system", content: initialAgent.systemPrompt }, ...history],
          model: initialAgent.model,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error([err.error, err.details, err.model].filter(Boolean).join(" | "));
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";

      setMessages((prev) => [...prev, { id: agentMsgId, role: "agent", text: "", time: now() }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        const snapshot = full;
        setMessages((prev) =>
          prev.map((m) => (m.id === agentMsgId ? { ...m, text: snapshot } : m))
        );
      }

      addLog(`Ответил на: "${text.slice(0, 30)}..."`);
    } catch (err) {
      const errorText = err instanceof Error ? err.message : "Неизвестная ошибка";
      const fallback = simulateResponse(initialAgent, text);
      setMessages((prev) => {
        const without = prev.filter((m) => m.id !== agentMsgId);
        return [...without, { id: agentMsgId, role: "agent" as const, text: `⚠️ API: ${errorText}\n\n(Фоллбек) ${fallback}`, time: now() }];
      });
      addLog(`Оффлайн-ответ: ${errorText}`);
    } finally {
      setTyping(false);
    }
  };

  const pendingTasks = tasks.filter((t) => !t.done).length;

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/studio"
          className="rounded-lg bg-bg-hover p-2 text-text-dim transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className={cn("relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br", initialAgent.color)}>
          <initialAgent.icon className="h-6 w-6 text-white" />
          {status === "active" && (
            <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-xp ring-2 ring-bg-deep" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-text-bright">{initialAgent.name}</h1>
            <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", st.bg, st.color)}>
              {st.label}
            </span>
            {pendingTasks > 0 && (
              <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] text-accent">
                {pendingTasks} задач
              </span>
            )}
          </div>
          <p className="text-xs text-text-dim">{initialAgent.role} · {initialAgent.model}</p>
        </div>

        <button
          onClick={cycleStatus}
          className={cn(
            "rounded-lg p-2.5 transition-colors",
            status === "active" ? "bg-xp/10 text-xp hover:bg-xp/20"
              : status === "off" ? "bg-hp/10 text-hp/50 hover:bg-hp/20"
                : "bg-bg-hover text-text-dim hover:text-text"
          )}
          title="Переключить статус"
        >
          <Power className="h-5 w-5" />
        </button>
      </div>

      {/* Description */}
      <p className="text-xs leading-relaxed text-text-dim">{initialAgent.desc}</p>

      {/* Main layout: Chat + Sidebar */}
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3" style={{ minHeight: "min(60vh, 500px)" }}>
        <div className="flex flex-col rounded-xl border border-border bg-bg-card lg:col-span-2" style={{ minHeight: "350px" }}>
          {/* Chat header */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-xs font-medium text-text-bright">Чат с {initialAgent.name}</span>
            <span className="ml-auto text-[10px] text-text-dim">{initialAgent.model}</span>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-3", msg.role === "user" && "flex-row-reverse")}>
                <div className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                  msg.role === "user" ? "bg-mana/20" : "bg-accent/20"
                )}>
                  {msg.role === "user" ? (
                    <User className="h-3.5 w-3.5 text-mana" />
                  ) : (
                    <initialAgent.icon className="h-3.5 w-3.5 text-accent" />
                  )}
                </div>
                <div className={cn(
                  "max-w-[75%] rounded-xl px-3.5 py-2.5",
                  msg.role === "user"
                    ? "bg-mana/10 text-text"
                    : "border border-border/50 bg-bg-deep text-text"
                )}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                  <p className="mt-1 text-[9px] text-text-dim/50">{msg.time}</p>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex items-center gap-2 text-xs text-text-dim">
                <initialAgent.icon className="h-3.5 w-3.5 animate-pulse text-accent" />
                <span className="animate-pulse">{initialAgent.name} думает...</span>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={`Написать ${initialAgent.name}...`}
                className="flex-1 rounded-lg border border-border bg-bg-deep px-4 py-2.5 text-sm text-text placeholder:text-text-dim/40 focus:border-accent/50 focus:outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={!chatInput.trim()}
                className="rounded-lg bg-accent px-4 py-2.5 text-white transition-all hover:bg-accent-dim disabled:opacity-30"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right sidebar — Tasks + Log */}
        <div className="flex flex-col gap-4 overflow-hidden">
          {/* Tasks */}
          <div className="flex-1 overflow-hidden rounded-xl border border-border bg-bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <span className="text-xs font-medium text-text-bright">Задачи</span>
              <span className="text-[10px] text-text-dim">{pendingTasks} активных</span>
            </div>

            <div className="p-3">
              <div className="mb-2 flex gap-1.5">
                <input
                  type="text"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  placeholder="Новая задача..."
                  className="flex-1 rounded-lg border border-border bg-bg-deep px-3 py-1.5 text-xs text-text placeholder:text-text-dim/40 focus:border-accent/50 focus:outline-none"
                />
                <button
                  onClick={addTask}
                  disabled={!taskInput.trim()}
                  className="rounded-lg bg-accent/20 px-2 text-accent transition-colors hover:bg-accent/30 disabled:opacity-30"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="max-h-48 space-y-0.5 overflow-y-auto">
                {tasks.length === 0 && (
                  <p className="py-2 text-center text-[10px] italic text-text-dim/50">Нет задач</p>
                )}
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-bg-hover"
                  >
                    {task.done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-xp" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 shrink-0 text-text-dim/30" />
                    )}
                    <span className={cn("flex-1 text-xs", task.done ? "text-text-dim line-through" : "text-text")}>
                      {task.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Activity log */}
          <div className="flex-1 overflow-hidden rounded-xl border border-border bg-bg-card">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <Activity className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-medium text-text-bright">Лог</span>
            </div>
            <div className="max-h-48 space-y-1.5 overflow-y-auto p-3">
              {log.map((entry, i) => (
                <p key={i} className="text-[10px] text-text-dim">
                  <span className="mr-1 text-accent">›</span>
                  {entry}
                </p>
              ))}
            </div>
          </div>

          {/* Agent info */}
          <div className="rounded-xl border border-border bg-bg-card p-3">
            <div className="flex items-center gap-2 text-[10px] text-text-dim">
              <Settings2 className="h-3 w-3" />
              <span>Модель: <span className="text-text">{initialAgent.model}</span></span>
            </div>
            <p className="mt-1 text-[10px] text-text-dim/60 leading-relaxed">
              {initialAgent.systemPrompt}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function now(): string {
  return new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function simulateResponse(agent: AgentData, input: string): string {
  const lower = input.toLowerCase();

  const responses: Record<string, Record<string, string>> = {
    moltbot: {
      status: `📊 Статус системы:\n\n✅ Активные агенты: 4/8\n📋 Задач в работе: ${agent.tasks.filter(t => !t.done).length}\n⚡ Все системы онлайн\n\nЧто координируем дальше?`,
      default: `Принял, Архитектор. Записал в контекст: «${input}».\n\nМогу:\n1. Передать задачу нужному агенту\n2. Создать квест из этого\n3. Добавить в приоритеты\n\nТвой ход.`,
    },
    gm: {
      status: `📖 Летопись Главы 1:\n\n🎮 День 1 — Фундамент заложен\n🏆 Ачивки: 4 разблокированы\n✨ XP: 2847/5000\n📊 Прогресс главы: ~15%\n\nПродолжаем писать историю?`,
      default: `*записывает в летопись*\n\n«${input}»\n\nЭто станет частью истории Главы 1. ${Math.random() > 0.5 ? "Чувствую, это важный поворот сюжета." : "Архитектор продвигается вперёд."}\n\n+50 XP за действие.`,
    },
    analyst: {
      status: `📈 Аналитика:\n\n💰 MRR: 178K ₽ (цель 500K)\n📊 Рост: +12% за месяц\n🎯 MyReply: 1 платящий (цель 10)\n💡 Точка роста: soft launch + outreach`,
      default: `Анализирую «${input}»...\n\n📊 Предварительная оценка:\n- Impact: ${Math.random() > 0.5 ? "высокий" : "средний"}\n- Effort: ${Math.random() > 0.5 ? "низкий" : "средний"}\n- Приоритет: ${Math.random() > 0.5 ? "делать сейчас" : "добавить в бэклог"}\n\nНужен детальный разбор?`,
    },
    content: {
      default: `Контент по теме «${input}»:\n\n🔥 Вариант поста:\n«${input.slice(0, 50)}... — и вот почему это важно для каждого предпринимателя.»\n\nМогу:\n1. Развернуть в полный пост\n2. Адаптировать под разные площадки\n3. Добавить визуал`,
    },
    guardian: {
      default: `🛡️ Проверка на риски: «${input}»\n\n${Math.random() > 0.5 ? "⚠️ Вижу потенциальное распыление. Это соответствует текущему фокусу?" : "✅ Вписывается в текущую стратегию. Без рисков."}\n\nРекомендация: ${Math.random() > 0.5 ? "уточни приоритет перед стартом" : "можно начинать, не вижу угроз"}`,
    },
  };

  const agentResponses = responses[agent.id] || {};

  if (lower.includes("статус") || lower.includes("status") || lower.includes("отчёт")) {
    return agentResponses.status || agentResponses.default || genericResponse(agent, input);
  }

  return agentResponses.default || genericResponse(agent, input);
}

function genericResponse(agent: AgentData, input: string): string {
  return `Принял задачу: «${input}».\n\nКак ${agent.role}, ${Math.random() > 0.5 ? "начинаю работу" : "анализирую"}. Результат будет в ближайшее время.\n\nЧто ещё?`;
}
