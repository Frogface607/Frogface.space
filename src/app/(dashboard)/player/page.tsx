"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Flame,
  Star,
  Trophy,
  Zap,
  TrendingUp,
  Swords,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string; name: string; icon: string; desc: string;
  condition: string; xp: number; rarity: string;
  unlocked: boolean; date?: string;
}

interface Buff {
  id: string; name: string; icon: string; effect: string;
  type: "buff" | "debuff"; duration: string; trigger: string;
}

interface PlayerData {
  level: number; xp: number; xp_to_next: number;
  gold: number; mana: number; mana_max: number;
  quests_completed: number; title: string; day: number;
  chapter_name: string;
}

const RARITY: Record<string, { label: string; color: string; bg: string; border: string }> = {
  common: { label: "Обычная", color: "text-text-dim", bg: "bg-text-dim/10", border: "border-text-dim/20" },
  rare: { label: "Редкая", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  epic: { label: "Эпическая", color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20" },
  legendary: { label: "Легендарная", color: "text-gold", bg: "bg-gold/10", border: "border-gold/20" },
};

export default function PlayerPage() {
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [buffs, setBuffs] = useState<Buff[]>([]);
  const [streaks, setStreaks] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<"achievements" | "buffs" | "streaks">("achievements");

  useEffect(() => {
    fetch("/api/player")
      .then((r) => r.json())
      .then((data) => {
        setPlayer(data.player);
        setAchievements(data.achievements || []);
        setBuffs(data.buffs || []);
        setStreaks(data.streaks || {});
      })
      .catch(() => {});
  }, []);

  if (!player) return <div className="flex min-h-[60vh] items-center justify-center"><Zap className="h-6 w-6 animate-pulse text-accent" /></div>;

  const xpPct = player.xp_to_next ? (player.xp / player.xp_to_next) * 100 : 50;
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalXpFromAch = achievements.filter((a) => a.unlocked).reduce((s, a) => s + a.xp, 0);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Character Card */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-bg-card p-5 sm:flex-row sm:items-center sm:gap-6">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-accent via-mana to-xp">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 rounded-full bg-gold px-2.5 py-0.5 text-xs font-bold text-bg-deep">
            {player.level}
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <h1 className="text-xl font-bold text-text-bright">Sergey Orlov</h1>
            <p className="text-sm text-accent">{player.title || "Архитектор"} · {player.chapter_name || "Глава 1"} · День {player.day || 2}</p>
          </div>

          {/* XP Bar */}
          <div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-text-dim">XP до уровня {player.level + 1}</span>
              <span className="font-mono text-accent">{player.xp} / {player.xp_to_next}</span>
            </div>
            <div className="mt-1 h-2.5 rounded-full bg-bg-deep">
              <div className="h-full rounded-full bg-gradient-to-r from-accent to-xp" style={{ width: `${xpPct}%` }} />
            </div>
          </div>

          {/* Resources */}
          <div className="grid grid-cols-3 gap-3">
            <ResourcePill icon="💰" label="Gold" value={`${player.gold}K₽`} color="text-gold" />
            <ResourcePill icon="⚡" label="Mana" value={`${player.mana}/${player.mana_max}`} color="text-mana" />
            <ResourcePill icon="⚔️" label="Квесты" value={String(player.quests_completed)} color="text-xp" />
          </div>
        </div>

        {/* Streaks */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-col sm:gap-2">
          <StreakBadge icon="🔥" label="Продуктивность" value={streaks.productive_days || 0} best={streaks.best_productive || 0} />
          <StreakBadge icon="🚭" label="Без сигарет" value={streaks.smoke_free || 0} best={streaks.best_smoke_free || 0} />
          <StreakBadge icon="💪" label="Тренировки" value={streaks.workout || 0} best={0} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-bg-deep p-1">
        {([
          { key: "achievements", label: `Ачивки (${unlockedCount}/${achievements.length})`, icon: Trophy },
          { key: "buffs", label: "Баффы и дебаффы", icon: Zap },
          { key: "streaks", label: "Стрики", icon: Flame },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors",
              tab === key ? "bg-bg-card text-text-bright shadow" : "text-text-dim hover:text-text",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Achievements */}
      {tab === "achievements" && (
        <div className="space-y-2">
          <p className="text-xs text-text-dim">+{totalXpFromAch} XP от ачивок</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {achievements.map((a) => {
              const r = RARITY[a.rarity] || RARITY.common;
              return (
                <div
                  key={a.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 transition-all",
                    a.unlocked ? `${r.border} ${r.bg}` : "border-border/20 bg-bg-deep/30 opacity-40 grayscale",
                  )}
                >
                  <span className="text-2xl">{a.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-medium", a.unlocked ? "text-text-bright" : "text-text-dim")}>{a.name}</span>
                      <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-medium", r.color, r.bg)}>{r.label}</span>
                    </div>
                    <p className="text-[10px] text-text-dim">{a.desc}</p>
                    {!a.unlocked && <p className="mt-0.5 text-[10px] text-text-dim/50 italic">{a.condition}</p>}
                    {a.unlocked && a.date && <p className="mt-0.5 text-[10px] text-xp">+{a.xp} XP · {a.date}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Buffs & Debuffs */}
      {tab === "buffs" && (
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-xp">
              <Star className="h-4 w-4" /> Баффы
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {buffs.filter((b) => b.type === "buff").map((b) => (
                <BuffCard key={b.id} buff={b} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-hp">
              <Heart className="h-4 w-4" /> Дебаффы
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {buffs.filter((b) => b.type === "debuff").map((b) => (
                <BuffCard key={b.id} buff={b} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Streaks */}
      {tab === "streaks" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-bg-card p-4">
            <h3 className="text-sm font-semibold text-text-bright">Как работают стрики</h3>
            <p className="mt-1 text-xs text-text-dim leading-relaxed">
              Каждый день когда ты продуктивен — стрик растёт. Стрик даёт +5% XP за каждый день.
              Пропустил день — стрик сбрасывается. Рекорд сохраняется навсегда.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <StreakCard icon="🔥" name="Продуктивность" current={streaks.productive_days || 0} best={streaks.best_productive || 0} desc="Дни с хотя бы 1 завершённой задачей" bonus="+5% XP за каждый день" />
            <StreakCard icon="🚭" name="Без сигарет" current={streaks.smoke_free || 0} best={streaks.best_smoke_free || 0} desc="Дни без единой сигареты" bonus="+1 Mana max за каждые 7 дней" />
            <StreakCard icon="💪" name="Тренировки" current={streaks.workout || 0} best={0} desc="Дни с физической активностью" bonus="+30% XP в день тренировки" />
          </div>
        </div>
      )}
    </div>
  );
}

function ResourcePill({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border/30 bg-bg-deep/30 px-2.5 py-1.5">
      <span className="text-sm">{icon}</span>
      <div>
        <p className="text-[10px] text-text-dim">{label}</p>
        <p className={cn("text-xs font-bold", color)}>{value}</p>
      </div>
    </div>
  );
}

function StreakBadge({ icon, label, value, best }: { icon: string; label: string; value: number; best: number }) {
  return (
    <div className="rounded-lg border border-border/30 bg-bg-deep/30 px-2.5 py-1.5 text-center">
      <span className="text-sm">{icon}</span>
      <p className="text-lg font-bold text-text-bright">{value}</p>
      <p className="text-[9px] text-text-dim">{label}</p>
      {best > 0 && <p className="text-[9px] text-text-dim/50">рекорд: {best}</p>}
    </div>
  );
}

function BuffCard({ buff }: { buff: Buff }) {
  const isBuff = buff.type === "buff";
  return (
    <div className={cn(
      "flex items-start gap-3 rounded-xl border p-3",
      isBuff ? "border-xp/20 bg-xp/5" : "border-hp/20 bg-hp/5",
    )}>
      <span className="text-xl">{buff.icon}</span>
      <div>
        <p className={cn("text-sm font-medium", isBuff ? "text-xp" : "text-hp")}>{buff.name}</p>
        <p className="text-[10px] text-text-dim">{buff.effect}</p>
        <p className="mt-1 text-[10px] text-text-dim/50">Триггер: {buff.trigger}</p>
        <p className="text-[10px] text-text-dim/30">Длительность: {buff.duration}</p>
      </div>
    </div>
  );
}

function StreakCard({ icon, name, current, best, desc, bonus }: { icon: string; name: string; current: number; best: number; desc: string; bonus: string }) {
  return (
    <div className="rounded-xl border border-border bg-bg-card p-4 text-center">
      <span className="text-2xl">{icon}</span>
      <p className="mt-1 text-sm font-semibold text-text-bright">{name}</p>
      <p className="mt-2 text-3xl font-bold text-accent">{current}</p>
      <p className="text-[10px] text-text-dim">дней подряд</p>
      {best > 0 && <p className="text-[10px] text-gold">рекорд: {best}</p>}
      <p className="mt-2 text-[10px] text-text-dim/70">{desc}</p>
      <p className="mt-1 text-[10px] text-xp">{bonus}</p>
    </div>
  );
}
