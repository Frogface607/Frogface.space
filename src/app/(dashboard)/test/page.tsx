"use client";

import { useState, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Play,
  Database,
  Bot,
  MessageSquare,
  Sparkles,
  ListTodo,
  Gamepad2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TestResult {
  name: string;
  status: "idle" | "running" | "pass" | "fail";
  message?: string;
  duration?: number;
}

const TESTS: { id: string; name: string; icon: typeof Bot; run: () => Promise<string> }[] = [
  {
    id: "status",
    name: "Статус системы",
    icon: Database,
    run: async () => {
      const res = await fetch("/api/status");
      const data = await res.json();
      return `Mode: ${data.mode} | OpenClaw: ${data.openclaw} | Storage: ${data.storage}`;
    },
  },
  {
    id: "chat_api",
    name: "AI Chat API (ping)",
    icon: Bot,
    run: async () => {
      const res = await fetch("/api/chat");
      const data = await res.json();
      if (!data.hasKey && !data.openclaw) throw new Error("Нет AI бэкенда (ни OpenClaw ни OpenRouter)");
      return `${data.mode} | Key: ${data.hasKey ? "✓" : "✗"} | OpenClaw: ${data.openclaw ? "✓" : "✗"}`;
    },
  },
  {
    id: "kv_write",
    name: "KV Store: запись",
    icon: Database,
    run: async () => {
      const testVal = { test: true, ts: Date.now() };
      const res = await fetch("/api/kv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "_test_probe", value: testVal }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return "Запись в KV store OK";
    },
  },
  {
    id: "kv_read",
    name: "KV Store: чтение",
    icon: Database,
    run: async () => {
      const res = await fetch("/api/kv?key=_test_probe");
      const data = await res.json();
      if (!data.value) throw new Error("Значение не найдено (OpenClaw/Supabase недоступны?)");
      return `Прочитано: ${JSON.stringify(data.value).slice(0, 50)}`;
    },
  },
  {
    id: "rpg",
    name: "RPG Engine",
    icon: Gamepad2,
    run: async () => {
      const res = await fetch("/api/rpg");
      const data = await res.json();
      if (!data.player) throw new Error("Player state не загрузился");
      return `Ур.${data.player.level} | ${data.player.xp} XP | ${data.quests?.length || 0} квестов`;
    },
  },
  {
    id: "tasks",
    name: "Task Queue",
    icon: ListTodo,
    run: async () => {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      return `${data.tasks?.length || 0} задач (total: ${data.total || 0})`;
    },
  },
  {
    id: "pipeline",
    name: "Content Pipeline",
    icon: Sparkles,
    run: async () => {
      const res = await fetch("/api/pipeline");
      const data = await res.json();
      return `${data.counts?.pending || 0} pending | ${data.counts?.approved || 0} approved | ${data.counts?.total || 0} total`;
    },
  },
  {
    id: "report",
    name: "Morning Report",
    icon: Zap,
    run: async () => {
      const res = await fetch("/api/report");
      const data = await res.json();
      return `${data.greeting} Storage: ${data.storage?.primary || "?"}`;
    },
  },
  {
    id: "notify",
    name: "Notify (Moltbot ping)",
    icon: MessageSquare,
    run: async () => {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Тест системы уведомлений", from: "test" }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed");
      return "Уведомление отправлено в Moltbot chat";
    },
  },
];

export default function TestPage() {
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [running, setRunning] = useState(false);

  const runTest = useCallback(async (test: typeof TESTS[0]) => {
    setResults((prev) => ({ ...prev, [test.id]: { name: test.name, status: "running" } }));
    const start = Date.now();
    try {
      const message = await test.run();
      setResults((prev) => ({
        ...prev,
        [test.id]: { name: test.name, status: "pass", message, duration: Date.now() - start },
      }));
    } catch (err) {
      setResults((prev) => ({
        ...prev,
        [test.id]: { name: test.name, status: "fail", message: String(err), duration: Date.now() - start },
      }));
    }
  }, []);

  const runAll = useCallback(async () => {
    setRunning(true);
    for (const test of TESTS) {
      await runTest(test);
    }
    setRunning(false);
  }, [runTest]);

  const passCount = Object.values(results).filter((r) => r.status === "pass").length;
  const failCount = Object.values(results).filter((r) => r.status === "fail").length;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-bright">Тестирование систем</h1>
          <p className="mt-1 text-sm text-text-dim">Проверка всех компонентов Frogface</p>
        </div>
        <button
          onClick={runAll}
          disabled={running}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-dim disabled:opacity-50"
        >
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Запустить все
        </button>
      </div>

      {Object.keys(results).length > 0 && (
        <div className="flex items-center gap-4 rounded-xl border border-border bg-bg-card p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-xp" />
            <span className="text-sm font-medium text-xp">{passCount} прошло</span>
          </div>
          {failCount > 0 && (
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-hp" />
              <span className="text-sm font-medium text-hp">{failCount} ошибок</span>
            </div>
          )}
          <span className="text-xs text-text-dim">из {TESTS.length} тестов</span>
        </div>
      )}

      <div className="space-y-2">
        {TESTS.map((test) => {
          const result = results[test.id];
          const Icon = test.icon;
          return (
            <div
              key={test.id}
              className={cn(
                "flex items-center gap-3 rounded-xl border bg-bg-card p-4 transition-all",
                result?.status === "pass" ? "border-xp/30" :
                result?.status === "fail" ? "border-hp/30" : "border-border",
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0",
                result?.status === "pass" ? "text-xp" :
                result?.status === "fail" ? "text-hp" :
                result?.status === "running" ? "text-accent animate-pulse" : "text-text-dim"
              )} />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-bright">{test.name}</p>
                {result?.message && (
                  <p className={cn("mt-0.5 text-xs truncate",
                    result.status === "fail" ? "text-hp/80" : "text-text-dim"
                  )}>
                    {result.message}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {result?.duration && (
                  <span className="text-[10px] text-text-dim">{result.duration}ms</span>
                )}
                {result?.status === "pass" && <CheckCircle2 className="h-4 w-4 text-xp" />}
                {result?.status === "fail" && <XCircle className="h-4 w-4 text-hp" />}
                {result?.status === "running" && <Loader2 className="h-4 w-4 animate-spin text-accent" />}
                {(!result || result.status === "idle") && (
                  <button onClick={() => runTest(test)} className="rounded-lg border border-border px-2 py-1 text-[10px] text-text-dim hover:text-accent">
                    Run
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border/50 bg-bg-deep p-4 space-y-2">
        <p className="text-xs font-medium text-text-bright">Нужны env-переменные:</p>
        <div className="font-mono text-[10px] text-text-dim space-y-1">
          <p><span className="text-accent">OPENCLAW_URL</span> — URL OpenClaw на VPS (обязательно)</p>
          <p><span className="text-accent">OPENCLAW_GATEWAY_TOKEN</span> — токен OpenClaw (обязательно)</p>
          <p><span className="text-text-dim/50">OPENROUTER_API_KEY</span> — для fallback AI (опционально)</p>
          <p><span className="text-text-dim/50">TASK_WEBHOOK_URL</span> — Telegram webhook (опционально)</p>
          <p><span className="text-text-dim/50">TELEGRAM_CHAT_ID</span> — ID чата (опционально)</p>
        </div>
      </div>
    </div>
  );
}
