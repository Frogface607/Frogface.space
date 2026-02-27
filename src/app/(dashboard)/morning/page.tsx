"use client";

import { useState, useEffect } from "react";
import {
  Sun,
  CheckCircle2,
  XCircle,
  Pencil,
  Crown,
  Flame,
  ChevronRight,
  Sparkles,
  Zap,
  Coffee,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PixelHero } from "@/components/pixel-hero";

interface Quest {
  id: string;
  title: string;
  project: string;
  xp: number;
  priority: string;
  done: boolean;
}

interface QuestPlan {
  quest: Quest;
  suggestion: string;
  agent: string;
  status: "pending" | "approved" | "rejected" | "edited";
  editedPlan?: string;
}

const SUGGESTIONS: Record<string, string> = {
  "myreply": "Через MaxClaw: написать 5 владельцам в ЛС с персональным оффером. Шаблон готов.",
  "edison": "Cursor-агент Edison: сгенерировать контент + промпт для афиши. MaxClaw опубликует.",
  "frogface": "Cursor-агент Frogface: доработка дашборда, новые фичи.",
  "video": "Подготовить скрипт через Cursor-агента. Съёмка — на тебе.",
  "content": "MaxClaw: batch-генерация 5 постов. Ты одобряешь в /pipeline.",
};

const AGENTS: Record<string, string> = {
  "myreply": "MaxClaw + ты",
  "edison": "Cursor Edison + MaxClaw",
  "frogface": "Cursor Frogface",
  "video": "Cursor Video + ты",
  "content": "MaxClaw",
};

export default function MorningPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [plans, setPlans] = useState<QuestPlan[]>([]);
  const [player, setPlayer] = useState<{ level: number; mana: number; xp: number }>({ level: 7, mana: 72, xp: 2847 });
  const [manaCheck, setManaCheck] = useState(0);
  const [phase, setPhase] = useState<"checkin" | "planning" | "done">("checkin");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        setPlayer(data.player);
        const active = data.quests.active as Quest[];
        setQuests(active);
        setPlans(
          active
            .sort((a: Quest, b: Quest) => {
              const p: Record<string, number> = { boss: 0, critical: 1, high: 2, normal: 3 };
              return (p[a.priority] ?? 3) - (p[b.priority] ?? 3);
            })
            .map((q: Quest) => ({
              quest: q,
              suggestion: SUGGESTIONS[q.project] || "Обсудить с Архитектором стратегию выполнения.",
              agent: AGENTS[q.project] || "Cursor",
              status: "pending" as const,
            }))
        );
      })
      .catch(() => {});
  }, []);

  const approvedCount = plans.filter((p) => p.status === "approved" || p.status === "edited").length;
  const rejectedCount = plans.filter((p) => p.status === "rejected").length;
  const totalXp = plans
    .filter((p) => p.status === "approved" || p.status === "edited")
    .reduce((s, p) => s + p.quest.xp, 0);

  if (phase === "checkin") {
    return (
      <div className="animate-fade-in flex min-h-[70vh] flex-col items-center justify-center px-4">
        <PixelHero level={player.level} mana={manaCheck || player.mana} manaMax={100} streak={2} className="mb-6" />
        <Sun className="h-8 w-8 text-gold mb-3" />
        <h1 className="text-xl font-bold text-text-bright">Доброе утро, Архитектор</h1>
        <p className="mt-1 text-sm text-text-dim">Как энергия сегодня?</p>

        <div className="mt-6 flex items-center gap-3">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              onClick={() => { setManaCheck(v * 20); setTimeout(() => setPhase("planning"), 500); }}
              className={cn(
                "flex h-16 w-16 flex-col items-center justify-center rounded-2xl border transition-all hover:scale-110",
                v <= 2 ? "border-hp/30 hover:border-hp hover:bg-hp/10" :
                v <= 3 ? "border-gold/30 hover:border-gold hover:bg-gold/10" :
                "border-xp/30 hover:border-xp hover:bg-xp/10",
              )}
            >
              <span className="text-xl font-bold text-text-bright">{v}</span>
              <span className="text-[8px] text-text-dim">
                {["", "пустой", "тяжело", "норм", "хорошо", "огонь"][v]}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="animate-fade-in flex min-h-[70vh] flex-col items-center justify-center px-4">
        <PixelHero level={player.level} mana={manaCheck} manaMax={100} streak={2} buffs={["workout"]} className="mb-6" />
        <Trophy className="h-10 w-10 text-gold mb-3" />
        <h1 className="text-xl font-bold text-text-bright">Планёрка завершена!</h1>
        <p className="mt-2 text-sm text-text-dim">
          {approvedCount} квестов одобрено · {rejectedCount} отклонено · ~{totalXp} XP в работе
        </p>
        <div className="mt-6 flex gap-3">
          <a href="/" className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-dim">
            В штаб
          </a>
          <a href="/pipeline" className="rounded-xl border border-border px-5 py-2.5 text-sm text-text-dim hover:text-text">
            Контент
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <PixelHero level={player.level} mana={manaCheck} manaMax={100} streak={2} className="scale-75" />
          <div>
            <h1 className="text-xl font-bold text-text-bright">Утренняя планёрка</h1>
            <p className="text-sm text-text-dim">
              {plans.length} квестов · Мана: {manaCheck / 20}/5 · Одобрено: {approvedCount}
            </p>
          </div>
        </div>
        <button
          onClick={() => setPhase("done")}
          disabled={approvedCount === 0}
          className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-medium text-white hover:bg-accent-dim disabled:opacity-30"
        >
          <Zap className="h-3.5 w-3.5" />
          Запустить ({approvedCount})
        </button>
      </div>

      {/* Quest cards */}
      <div className="space-y-3">
        {plans.map((plan, idx) => (
          <PlanCard
            key={plan.quest.id}
            plan={plan}
            onApprove={() => {
              const next = [...plans];
              next[idx] = { ...plan, status: "approved" };
              setPlans(next);
            }}
            onReject={() => {
              const next = [...plans];
              next[idx] = { ...plan, status: "rejected" };
              setPlans(next);
            }}
            onEdit={(text) => {
              const next = [...plans];
              next[idx] = { ...plan, status: "edited", editedPlan: text };
              setPlans(next);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  onApprove,
  onReject,
  onEdit,
}: {
  plan: QuestPlan;
  onApprove: () => void;
  onReject: () => void;
  onEdit: (text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(plan.suggestion);
  const q = plan.quest;
  const decided = plan.status !== "pending";

  return (
    <div className={cn(
      "rounded-2xl border bg-bg-card transition-all",
      plan.status === "approved" || plan.status === "edited" ? "border-xp/30 bg-xp/5" :
      plan.status === "rejected" ? "border-hp/20 bg-hp/5 opacity-50" :
      "border-border",
    )}>
      {/* Quest header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        {plan.status === "approved" || plan.status === "edited" ? (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-xp" />
        ) : plan.status === "rejected" ? (
          <XCircle className="h-5 w-5 shrink-0 text-hp/50" />
        ) : (
          <Coffee className="h-5 w-5 shrink-0 text-text-dim/30" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-bright">{q.title}</span>
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
          <p className="text-[10px] text-text-dim">{q.project} · +{q.xp} XP · Исполнитель: {plan.agent}</p>
        </div>
      </div>

      {/* Plan suggestion */}
      <div className="px-4 pb-2">
        {editing ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-accent/30 bg-bg-deep px-3 py-2 text-xs text-text focus:border-accent focus:outline-none"
            />
            <button
              onClick={() => { onEdit(editText); setEditing(false); }}
              className="rounded-lg bg-accent/20 px-3 py-1 text-xs text-accent hover:bg-accent/30"
            >
              Сохранить план
            </button>
          </div>
        ) : (
          <div className="rounded-lg bg-bg-deep/50 px-3 py-2">
            <p className="text-xs text-text-dim leading-relaxed">
              <Sparkles className="mr-1 inline h-3 w-3 text-accent" />
              {plan.editedPlan || plan.suggestion}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      {!decided && (
        <div className="flex items-center gap-2 border-t border-border/30 px-4 py-3">
          <button onClick={onApprove} className="flex items-center gap-1.5 rounded-xl bg-xp/20 px-4 py-2 text-xs font-medium text-xp hover:bg-xp/30">
            <CheckCircle2 className="h-3.5 w-3.5" /> Одобрить
          </button>
          <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 rounded-xl bg-gold/20 px-4 py-2 text-xs text-gold hover:bg-gold/30">
            <Pencil className="h-3.5 w-3.5" /> Исправить
          </button>
          <button onClick={onReject} className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs text-text-dim hover:bg-hp/10 hover:text-hp">
            <XCircle className="h-3.5 w-3.5" /> Не сейчас
          </button>
        </div>
      )}
    </div>
  );
}
