"use client";

import { useState } from "react";
import {
  Zap,
  TrendingUp,
  Target,
  Clock,
  Flame,
  Trophy,
  CheckCircle2,
  Circle,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/lib/use-local-storage";

interface Quest {
  id: string;
  title: string;
  project: string;
  xp: number;
  priority: "normal" | "critical" | "boss";
  progress: number;
  done: boolean;
}

interface LogItem {
  id: string;
  time: string;
  text: string;
  type: "story" | "achievement" | "gold" | "xp" | "log";
}

const INITIAL_QUESTS: Quest[] = [
  { id: "q1", title: "Записать первое видео «Идущий к руке»", project: "Съёмка", xp: 300, priority: "boss", progress: 0, done: false },
  { id: "q2", title: "Soft Launch MyReply: чаты + личные контакты", project: "MyReply", xp: 200, priority: "critical", progress: 0, done: false },
  { id: "q3", title: "Загрузить меню Edison + пост о каталоге", project: "Edison", xp: 140, priority: "critical", progress: 0, done: false },
  { id: "q4", title: "Настроить AI-копирайтера анонсов Edison", project: "Edison", xp: 150, priority: "critical", progress: 0, done: false },
  { id: "q5", title: "UGC-челлендж MyReply: крутик-отзывы", project: "Воронка", xp: 150, priority: "critical", progress: 0, done: false },
  { id: "q6", title: "Демо-видео MyReply (30-45 сек)", project: "MyReply", xp: 100, priority: "normal", progress: 0, done: false },
  { id: "q7", title: "Первые 10 платящих на MyReply", project: "MyReply", xp: 800, priority: "boss", progress: 10, done: false },
];

const INITIAL_LOG: LogItem[] = [
  { id: "l1", time: "только что", text: "Глава 1 начинается. Архитектор входит в командный центр.", type: "story" },
  { id: "l2", time: "2ч назад", text: "Прокси Moltbot развёрнут. Голосовые разблокированы.", type: "achievement" },
  { id: "l3", time: "вчера", text: "Первый платёж: 490₽. Золото +0.5K.", type: "gold" },
  { id: "l4", time: "2 дня назад", text: "AI Proxy создан. Геоблокировка обойдена.", type: "achievement" },
  { id: "l5", time: "3 дня назад", text: "Воркспейс оптимизирован. Расход токенов снижен в 4 раза.", type: "xp" },
];

export default function HQPage() {
  const [quests, setQuests] = useLocalStorage("ff_hq_quests", INITIAL_QUESTS);
  const [log, setLog] = useLocalStorage("ff_hq_log", INITIAL_LOG);
  const [logInput, setLogInput] = useState("");

  const toggleQuest = (id: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const done = !q.done;
        if (done) {
          setLog((l) => [
            { id: Date.now().toString(), time: "сейчас", text: `Квест выполнен: ${q.title} (+${q.xp} XP)`, type: "xp" },
            ...l,
          ]);
        }
        return { ...q, done, progress: done ? 100 : q.progress };
      })
    );
  };

  const addLogEntry = () => {
    if (!logInput.trim()) return;
    setLog((prev) => [
      { id: Date.now().toString(), time: "сейчас", text: logInput, type: "log" },
      ...prev,
    ]);
    setLogInput("");
  };

  const completedXp = quests.filter((q) => q.done).reduce((s, q) => s + q.xp, 0);
  const activeCount = quests.filter((q) => !q.done).length;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-bright">
          Добро пожаловать в игру
        </h1>
        <p className="mt-1 text-sm text-text-dim">
          Глава 1 — &quot;Фундамент&quot; · День 1 · Февраль 2026
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-gold" />}
          label="Золото (MRR)"
          value="178K ₽"
          delta="+12% за месяц"
          accent="border-gold/30"
        />
        <StatCard
          icon={<Zap className="h-5 w-5 text-mana" />}
          label="Мана (Энергия)"
          value="72/100"
          delta="В норме — двигаемся"
          accent="border-mana/30"
        />
        <StatCard
          icon={<Flame className="h-5 w-5 text-xp" />}
          label="Опыт сегодня"
          value={`+${340 + completedXp}`}
          delta={`${3 + quests.filter((q) => q.done).length} квестов выполнено`}
          accent="border-xp/30"
        />
        <StatCard
          icon={<Target className="h-5 w-5 text-accent" />}
          label="Активные квесты"
          value={String(activeCount)}
          delta={`${quests.filter((q) => q.done).length} завершено`}
          accent="border-accent/30"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="lg:col-span-2 rounded-xl border border-border bg-bg-card p-4 lg:p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-bright">
            <Target className="h-4 w-4 text-accent" />
            Активные квесты
          </h2>
          <div className="space-y-3">
            {quests.map((q) => (
              <QuestRow key={q.id} quest={q} onToggle={toggleQuest} />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-bg-card p-4 lg:p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-bright">
            <Trophy className="h-4 w-4 text-gold" />
            Летопись
          </h2>

          <div className="mb-3 flex gap-2">
            <input
              type="text"
              value={logInput}
              onChange={(e) => setLogInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addLogEntry()}
              placeholder="Записать в лог..."
              className="flex-1 rounded-lg border border-border bg-bg-deep px-3 py-1.5 text-xs text-text placeholder:text-text-dim/40 focus:border-accent/50 focus:outline-none"
            />
            <button
              onClick={addLogEntry}
              disabled={!logInput.trim()}
              className="rounded-lg bg-accent/20 px-2 text-accent transition-colors hover:bg-accent/30 disabled:opacity-30"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {log.map((entry) => (
              <LogEntry key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-bg-card p-4 lg:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-text-bright">
              <Clock className="h-4 w-4 text-mana" />
              Глава 1: Фундамент
            </h2>
            <p className="mt-1 text-xs text-text-dim">
              30-дневный спринт · Построить базу, запустить продукты, достичь 500K Gold
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-2xl font-bold text-accent">День 1</p>
            <p className="text-[10px] text-text-dim">осталось 29 дней</p>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-bg-deep">
          <div className="h-full w-[3%] rounded-full bg-gradient-to-r from-accent to-mana" />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  delta,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
  accent: string;
}) {
  return (
    <div className={`rounded-xl border ${accent} bg-bg-card p-4`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-text-dim">{label}</span>
      </div>
      <p className="mt-2 text-xl font-bold text-text-bright">{value}</p>
      <p className="mt-1 text-[10px] text-text-dim">{delta}</p>
    </div>
  );
}

function QuestRow({ quest, onToggle }: { quest: Quest; onToggle: (id: string) => void }) {
  const priorityColors = {
    normal: "bg-mana/20 text-mana",
    critical: "bg-hp/20 text-hp",
    boss: "bg-gold/20 text-gold",
  };
  const priorityLabels = { normal: "обычный", critical: "крит", boss: "БОСС" };

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border/50 bg-bg-deep/50 px-3 py-2.5 lg:gap-3 lg:px-4 lg:py-3 transition-all",
        quest.done && "opacity-50"
      )}
    >
      <button onClick={() => onToggle(quest.id)} className="shrink-0">
        {quest.done ? (
          <CheckCircle2 className="h-5 w-5 text-xp" />
        ) : (
          <Circle className="h-5 w-5 text-text-dim/40 transition-colors hover:text-accent" />
        )}
      </button>
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-1.5 lg:gap-2">
          <span className={cn("text-xs lg:text-sm text-text-bright", quest.done && "line-through")}>{quest.title}</span>
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${priorityColors[quest.priority]}`}>
            {priorityLabels[quest.priority]}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 lg:mt-1.5 lg:gap-3">
          <span className="text-[10px] text-text-dim">{quest.project}</span>
          <span className="text-[10px] text-xp">+{quest.xp} XP</span>
          <div className="hidden h-1 w-24 rounded-full bg-border sm:block">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${quest.progress}%` }}
            />
          </div>
          <span className="hidden text-[10px] text-text-dim sm:inline">{quest.progress}%</span>
        </div>
      </div>
    </div>
  );
}

function LogEntry({ entry }: { entry: LogItem }) {
  const colors: Record<string, string> = {
    story: "border-l-accent",
    achievement: "border-l-xp",
    gold: "border-l-gold",
    xp: "border-l-mana",
    log: "border-l-text-dim",
  };
  const icons: Record<string, string> = {
    story: "📖",
    achievement: "🏆",
    gold: "💰",
    xp: "✨",
    log: "📝",
  };

  return (
    <div className={`border-l-2 ${colors[entry.type]} pl-3`}>
      <p className="text-xs text-text">
        <span className="mr-1">{icons[entry.type]}</span>
        {entry.text}
      </p>
      <p className="mt-0.5 text-[10px] text-text-dim">{entry.time}</p>
    </div>
  );
}
