"use client";

import Link from "next/link";
import { Bot, Zap, Activity, Clock } from "lucide-react";
import { AGENTS, STATUS_CONFIG } from "@/lib/agents";
import { cn } from "@/lib/utils";

export default function StudioPage() {
  const activeCount = AGENTS.filter((a) => a.status === "active").length;
  const totalTasks = AGENTS.reduce((s, a) => s + a.tasks.filter((t) => !t.done).length, 0);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-bright">Frogface Studio</h1>
          <p className="mt-1 text-sm text-text-dim">
            Кликни на агента — откроется его кабинет с чатом.
          </p>
        </div>
        <div className="flex gap-3">
          <Badge icon={<Zap className="h-4 w-4 text-xp" />} label="Активные" value={`${activeCount}/${AGENTS.length}`} />
          <Badge icon={<Activity className="h-4 w-4 text-accent" />} label="Задачи" value={String(totalTasks)} />
          <Badge icon={<Clock className="h-4 w-4 text-gold" />} label="API сегодня" value="~$2.40" />
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

      <div className="grid grid-cols-2 gap-4">
        {AGENTS.map((agent) => {
          const st = STATUS_CONFIG[agent.status];
          const pendingTasks = agent.tasks.filter((t) => !t.done).length;

          return (
            <Link
              key={agent.id}
              href={`/studio/${agent.id}`}
              className={cn(
                "group rounded-xl border bg-bg-card p-5 transition-all hover:scale-[1.01] hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5",
                agent.status === "active" ? "border-xp/20" : "border-border"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn("relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br transition-transform group-hover:scale-110", agent.color)}>
                  <agent.icon className="h-6 w-6 text-white" />
                  {agent.status === "active" && (
                    <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-xp ring-2 ring-bg-card" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-text-bright group-hover:text-accent transition-colors">{agent.name}</h3>
                    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", st.bg, st.color)}>
                      {st.label}
                    </span>
                  </div>
                  <p className="text-xs text-text-dim">{agent.role}</p>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-text-dim/70 line-clamp-2">{agent.desc}</p>

                  <div className="mt-3 flex items-center gap-4">
                    {pendingTasks > 0 && (
                      <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] text-accent">
                        {pendingTasks} задач
                      </span>
                    )}
                    <span className="text-[10px] text-text-dim">
                      {agent.model}
                    </span>
                    <span className="ml-auto text-[10px] text-text-dim/40 transition-colors group-hover:text-accent">
                      Открыть →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
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

function Badge({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
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
