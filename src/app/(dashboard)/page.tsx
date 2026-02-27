"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Target,
  TrendingUp,
  ListTodo,
  ScrollText,
  Crown,
  Flame,
  CheckCircle2,
  Circle,
  ExternalLink,
  Zap,
  Trophy,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerData {
  level: number;
  xp: number;
  xp_to_next: number;
  gold: number;
  mana: number;
  chapter_name: string;
  day: number;
  quests_completed: number;
}

interface Quest {
  id: string;
  title: string;
  project: string;
  xp: number;
  priority: string;
  done: boolean;
}

interface DashboardData {
  greeting: string;
  player: PlayerData;
  quests: { active: Quest[]; completed: number; total: number };
  lastDay: { date: string; title: string; entries: string[]; xp_earned: number } | null;
}

const PROJECT_COLORS: Record<string, string> = {
  myreply: "text-blue-400",
  edison: "text-amber-400",
  frogface: "text-violet-400",
  video: "text-red-400",
  content: "text-pink-400",
};

export default function HQPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Sparkles className="h-6 w-6 animate-pulse text-accent" />
      </div>
    );
  }

  const { greeting, player, quests, lastDay } = data;
  const xpPct = player.xp_to_next ? Math.min((player.xp / player.xp_to_next) * 100, 100) : 50;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-bright">{greeting}, Архитектор</h1>
          <p className="mt-1 text-sm text-text-dim">
            {player.chapter_name || "Глава 1"} · День {player.day || 2}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-gradient-to-br from-accent to-mana px-3 py-1.5">
            <span className="text-sm font-bold text-white">Ур. {player.level}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<TrendingUp className="h-5 w-5 text-gold" />} label="Gold (MRR)" value={`${player.gold}K ₽`} sub="цель: 500K" border="border-gold/20" />
        <StatCard icon={<Zap className="h-5 w-5 text-xp" />} label="XP" value={String(player.xp)} sub={`до ур.${player.level + 1}: ${player.xp_to_next || "?"}`} border="border-xp/20" />
        <StatCard icon={<Target className="h-5 w-5 text-accent" />} label="Квесты" value={`${quests.active.length} активных`} sub={`${quests.completed} завершено`} border="border-accent/20" />
        <StatCard icon={<Trophy className="h-5 w-5 text-gold" />} label="Выполнено" value={String(player.quests_completed || quests.completed)} sub="квестов всего" border="border-gold/20" />
      </div>

      {/* XP Bar */}
      <div className="rounded-xl border border-border bg-bg-card p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-dim">Прогресс до уровня {player.level + 1}</span>
          <span className="font-mono text-accent">{Math.round(xpPct)}%</span>
        </div>
        <div className="mt-2 h-3 rounded-full bg-bg-deep">
          <div className="h-full rounded-full bg-gradient-to-r from-accent via-mana to-xp transition-all" style={{ width: `${xpPct}%` }} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Active Quests */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-bg-card p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-bright">
            <ScrollText className="h-4 w-4 text-accent" />
            Активные квесты
          </h2>
          <div className="space-y-2">
            {quests.active.map((q) => (
              <div key={q.id} className="flex items-center gap-3 rounded-lg border border-border/30 bg-bg-deep/30 px-3 py-2.5">
                <Circle className="h-4 w-4 shrink-0 text-text-dim/30" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-bright">{q.title}</span>
                    {q.priority === "boss" && (
                      <span className="flex items-center gap-0.5 rounded bg-gold/20 px-1.5 py-0.5 text-[10px] font-bold text-gold">
                        <Crown className="h-2.5 w-2.5" /> БОСС
                      </span>
                    )}
                    {q.priority === "critical" && (
                      <span className="flex items-center gap-0.5 rounded bg-hp/20 px-1.5 py-0.5 text-[10px] text-hp">
                        <Flame className="h-2.5 w-2.5" /> крит
                      </span>
                    )}
                  </div>
                  <span className={cn("text-[10px]", PROJECT_COLORS[q.project] || "text-text-dim")}>{q.project}</span>
                </div>
                <span className="text-[10px] text-xp">+{q.xp} XP</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold text-text-bright">Быстрые действия</h2>
            <div className="space-y-2">
              <ActionLink href="/pipeline" icon={<Sparkles className="h-4 w-4" />} label="Контент-конвейер" color="text-gold" />
              <ActionLink href="/tasks" icon={<ListTodo className="h-4 w-4" />} label="Задачи Cursor" color="text-accent" />
              <ActionLink href="/quests" icon={<ScrollText className="h-4 w-4" />} label="Журнал квестов" color="text-xp" />
              <ActionLink href="/player" icon={<Trophy className="h-4 w-4" />} label="Статы игрока" color="text-mana" />
              <ActionLink href="/test" icon={<Zap className="h-4 w-4" />} label="Тест систем" color="text-text-dim" />
            </div>
          </div>

          {/* Last Chronicle Entry */}
          {lastDay && (
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
              <h3 className="text-xs font-semibold text-accent">{lastDay.title}</h3>
              <p className="mt-1 text-[10px] text-text-dim">{lastDay.date} · +{lastDay.xp_earned} XP</p>
              <ul className="mt-2 space-y-1">
                {lastDay.entries.slice(0, 4).map((e, i) => (
                  <li key={i} className="text-[10px] text-text-dim">· {e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, border }: { icon: React.ReactNode; label: string; value: string; sub: string; border: string }) {
  return (
    <div className={cn("rounded-xl border bg-bg-card p-4", border)}>
      <div className="flex items-center gap-2">{icon}<span className="text-xs text-text-dim">{label}</span></div>
      <p className="mt-2 text-xl font-bold text-text-bright">{value}</p>
      <p className="mt-0.5 text-[10px] text-text-dim">{sub}</p>
    </div>
  );
}

function ActionLink({ href, icon, label, color }: { href: string; icon: React.ReactNode; label: string; color: string }) {
  return (
    <a href={href} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-dim transition-colors hover:bg-bg-hover hover:text-text">
      <span className={color}>{icon}</span>
      <span className="flex-1">{label}</span>
      <ChevronRight className="h-3.5 w-3.5 text-text-dim/30" />
    </a>
  );
}
