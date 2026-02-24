"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Flame,
  Brain,
  Eye,
  Mic,
  Code,
  Palette,
  TrendingUp,
  Star,
  Trophy,
  Sparkles,
  Music,
  RefreshCw,
  Swords,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerState {
  level: number;
  xp: number;
  xp_to_next: number;
  gold: number;
  mana: number;
  mana_max: number;
  quests_completed: number;
  achievements: string[];
}

interface RpgQuest {
  id: string;
  title: string;
  project: string;
  xp: number;
  priority: "normal" | "critical" | "boss";
  progress: number;
  done: boolean;
}

const FALLBACK_PLAYER: PlayerState = {
  level: 7, xp: 2847, xp_to_next: 5000, gold: 178, mana: 72, mana_max: 100,
  quests_completed: 8, achievements: ["first_blood", "architect", "voice_master", "solo_preneur"],
};

const CORE_STATS = [
  { name: "Видение", value: 92, icon: Eye, color: "text-accent", bg: "bg-accent" },
  { name: "Архитектура", value: 88, icon: Brain, color: "text-mana", bg: "bg-mana" },
  { name: "Голос", value: 85, icon: Mic, color: "text-gold", bg: "bg-gold" },
  { name: "Созидание", value: 90, icon: Palette, color: "text-xp", bg: "bg-xp" },
  { name: "Код", value: 65, icon: Code, color: "text-mana-dim", bg: "bg-mana-dim" },
  { name: "Продажи", value: 45, icon: TrendingUp, color: "text-hp", bg: "bg-hp" },
];

const SKILLS = [
  { name: "AI-архитектура", level: 7, xp: 2847, maxXp: 5000 },
  { name: "Продуктовый дизайн", level: 6, xp: 3200, maxXp: 4000 },
  { name: "Музыка", level: 8, xp: 7500, maxXp: 8000 },
  { name: "Бренд-билдинг", level: 5, xp: 2100, maxXp: 3500 },
  { name: "Контент-стратегия", level: 4, xp: 1800, maxXp: 3000 },
  { name: "Продажи", level: 3, xp: 900, maxXp: 2500 },
  { name: "Фронтенд", level: 4, xp: 1600, maxXp: 3000 },
  { name: "Системное мышление", level: 7, xp: 4200, maxXp: 5000 },
];

const ALL_ACHIEVEMENTS = [
  { id: "first_blood", name: "Первая кровь", desc: "Первый платящий пользователь", icon: "💰" },
  { id: "architect", name: "Архитектор", desc: "Построил полную AI-агентную систему", icon: "🏗️" },
  { id: "voice_master", name: "Голос разума", desc: "100 голосовых обработано", icon: "🎙️" },
  { id: "solo_preneur", name: "Соло-пренёр", desc: "Запустил продукт без команды", icon: "🐺" },
  { id: "pipeline_master", name: "Конвейер", desc: "Сгенерировал 100 единиц контента", icon: "⚡" },
  { id: "gold_rush", name: "Золотая лихорадка", desc: "Достичь 500K MRR", icon: "🏆" },
  { id: "game_master", name: "Гейм-мастер", desc: "Завершить Главу 1", icon: "🎮" },
  { id: "freedom", name: "Свобода", desc: "3 месяца пассивного дохода", icon: "🌊" },
  { id: "wanderer", name: "Странник", desc: "Работать из 5 стран", icon: "✈️" },
  { id: "cursor_bridge", name: "Мостостроитель", desc: "Настроить Moltbot ↔ Cursor мост", icon: "🌉" },
];

export default function PlayerPage() {
  const [player, setPlayer] = useState<PlayerState>(FALLBACK_PLAYER);
  const [quests, setQuests] = useState<RpgQuest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/rpg");
      if (res.ok) {
        const data = await res.json();
        if (data.player) setPlayer(data.player);
        if (data.quests) setQuests(data.quests);
      }
    } catch { /* use fallback */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const xpPct = Math.min((player.xp / player.xp_to_next) * 100, 100);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Character header */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-bg-card p-4 sm:flex-row sm:items-start sm:gap-6 lg:p-6">
        <div className="flex items-center gap-4 sm:block">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent via-mana to-xp sm:h-24 sm:w-24">
              <Shield className="h-8 w-8 text-white sm:h-12 sm:w-12" />
            </div>
            <div className="absolute -bottom-1 -right-1 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-bg-deep">
              Ур.{player.level}
            </div>
          </div>
          <div className="sm:hidden">
            <h1 className="text-lg font-bold text-text-bright">Sergey Orlov</h1>
            <p className="text-xs text-accent">Архитектор · Соло-создатель</p>
          </div>
        </div>
        <div className="flex-1">
          <div className="hidden sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-bright">Sergey Orlov</h1>
              <p className="text-sm text-accent">Архитектор · Соло-создатель · Строитель систем</p>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[10px] text-text-dim hover:text-text"
            >
              <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
              Sync
            </button>
          </div>
          <p className="text-xs text-text-dim italic">
            &quot;Я не хочу спасать. Я не хочу тушить. Я хочу строить.&quot;
          </p>

          {/* XP progress to next level */}
          <div className="mt-3 rounded-lg border border-accent/20 bg-accent/5 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-dim">До уровня {player.level + 1}</span>
              <span className="font-mono text-accent">{player.xp} / {player.xp_to_next} XP</span>
            </div>
            <div className="mt-1.5 h-2.5 rounded-full bg-bg-deep">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-xp transition-all"
                style={{ width: `${xpPct}%` }}
              />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <ResourceBar label="Gold (MRR)" value={player.gold} max={500} suffix="K ₽" color="bg-gold" icon="💰" />
            <ResourceBar label="Mana" value={player.mana} max={player.mana_max} color="bg-mana" icon="⚡" />
            <ResourceBar label="Квесты" value={player.quests_completed} max={50} color="bg-xp" icon="⚔️" />
          </div>
        </div>
        <div className="rounded-lg border border-accent/20 bg-accent/5 p-3 sm:w-56 sm:p-4">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold text-accent">
            <Sparkles className="h-3 w-3" />
            Кредо
          </h3>
          <div className="mt-2 flex gap-3 sm:block sm:space-y-1">
            <p className="text-xs text-text">🗡️ Свобода</p>
            <p className="text-xs text-text">🛡️ Уверенность</p>
            <p className="text-xs text-text">👑 Уважение</p>
          </div>
        </div>
      </div>

      {/* Active quests from RPG API */}
      {quests.length > 0 && (
        <div className="rounded-xl border border-border bg-bg-card p-4 lg:p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-bright">
            <Swords className="h-4 w-4 text-accent" />
            Активные квесты ({quests.length})
          </h2>
          <div className="space-y-2">
            {quests.slice(0, 5).map((q) => (
              <div key={q.id} className="flex items-center gap-3 rounded-lg border border-border/30 bg-bg-deep/30 px-3 py-2">
                <span className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-medium",
                  q.priority === "boss" ? "bg-gold/20 text-gold" :
                  q.priority === "critical" ? "bg-hp/20 text-hp" : "bg-mana/20 text-mana",
                )}>
                  {q.priority === "boss" ? "БОСС" : q.priority === "critical" ? "КРИТ" : q.project}
                </span>
                <span className="flex-1 text-xs text-text">{q.title}</span>
                <span className="text-[10px] text-xp">+{q.xp} XP</span>
                {q.progress > 0 && (
                  <div className="h-1 w-16 rounded-full bg-bg-deep">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${q.progress}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="rounded-xl border border-border bg-bg-card p-4 lg:p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-bright">
            <Flame className="h-4 w-4 text-hp" />
            Основные статы
          </h2>
          <div className="space-y-3">
            {CORE_STATS.map((stat) => (
              <div key={stat.name} className="flex items-center gap-3">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="w-24 text-xs text-text-dim">{stat.name}</span>
                <div className="h-2 flex-1 rounded-full bg-bg-deep">
                  <div className={`h-full rounded-full ${stat.bg}`} style={{ width: `${stat.value}%` }} />
                </div>
                <span className="w-8 text-right text-xs font-mono text-text-dim">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-bg-card p-4 lg:p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-bright">
            <Star className="h-4 w-4 text-gold" />
            Навыки
          </h2>
          <div className="space-y-2.5">
            {SKILLS.map((skill) => (
              <div key={skill.name}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text">{skill.name}</span>
                  <span className="text-[10px] text-accent">Ур.{skill.level}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-bg-deep">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-mana"
                    style={{ width: `${(skill.xp / skill.maxXp) * 100}%` }}
                  />
                </div>
                <p className="mt-0.5 text-right text-[9px] text-text-dim">{skill.xp}/{skill.maxXp} XP</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-bg-card p-4 lg:p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-bright">
            <Trophy className="h-4 w-4 text-gold" />
            Достижения
          </h2>
          <div className="space-y-2">
            {ALL_ACHIEVEMENTS.map((ach) => {
              const unlocked = player.achievements.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-3 py-2",
                    unlocked ? "border-gold/30 bg-gold/5" : "border-border/30 bg-bg-deep/30 opacity-50",
                  )}
                >
                  <span className="text-lg">{ach.icon}</span>
                  <div>
                    <p className={cn("text-xs font-medium", unlocked ? "text-text-bright" : "text-text-dim")}>
                      {ach.name}
                    </p>
                    <p className="text-[10px] text-text-dim">{ach.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-bg-card p-4 lg:p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-bright">
          <Music className="h-4 w-4 text-mana" />
          Стиль игры
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <PlaystyleTag label="Архитектор" desc="Видит систему целиком" />
          <PlaystyleTag label="Соло-пренёр" desc="AI вместо команды" />
          <PlaystyleTag label="Голос" desc="Думает голосом в движении" />
          <PlaystyleTag label="Спринтер" desc="Главы по 30 дней, не марафоны" />
        </div>
      </div>
    </div>
  );
}

function ResourceBar({
  label, value, max, suffix = "", color, icon,
}: {
  label: string; value: number; max: number; suffix?: string; color: string; icon: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-text-dim">{icon} {label}</span>
        <span className="font-mono text-text-bright">{value}{suffix} / {max}{suffix}</span>
      </div>
      <div className="mt-1.5 h-2.5 rounded-full bg-bg-deep">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}

function PlaystyleTag({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="rounded-lg border border-accent/30 bg-accent/5 p-3">
      <p className="text-xs font-medium text-text-bright">{label}</p>
      <p className="mt-0.5 text-[10px] text-text-dim">{desc}</p>
    </div>
  );
}
