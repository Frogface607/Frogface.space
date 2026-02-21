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
} from "lucide-react";

const AGENTS = [
  {
    name: "Moltbot",
    role: "Operations Director",
    desc: "Операционный мозг. Логирование, контекст, менеджмент задач и агентов.",
    icon: Brain,
    status: "active",
    model: "Claude Sonnet 4",
    tasks: 47,
    color: "from-violet-500 to-purple-400",
  },
  {
    name: "Game Master",
    role: "Narrative Engine",
    desc: "Нарратив, ачивки, weekly reports. Превращает прогресс в историю.",
    icon: Gamepad2,
    status: "active",
    model: "Claude Opus",
    tasks: 12,
    color: "from-amber-500 to-yellow-400",
  },
  {
    name: "Analyst",
    role: "Data & Strategy",
    desc: "Анализ метрик, воронок, прогноз успеха, приоритизация задач.",
    icon: BarChart3,
    status: "active",
    model: "Claude Sonnet 4",
    tasks: 23,
    color: "from-blue-500 to-cyan-400",
  },
  {
    name: "Marketer",
    role: "Growth & Research",
    desc: "Исследования рынка, гипотезы, стратегии роста, конкурентный анализ.",
    icon: Megaphone,
    status: "idle",
    model: "Claude Sonnet 4",
    tasks: 8,
    color: "from-green-500 to-emerald-400",
  },
  {
    name: "Content Creator",
    role: "SMM & Copy",
    desc: "Постинг, копирайт, соцсети. Автономный контент-конвейер.",
    icon: PenTool,
    status: "idle",
    model: "Claude Haiku",
    tasks: 34,
    color: "from-pink-500 to-rose-400",
  },
  {
    name: "Designer",
    role: "Visual Production",
    desc: "Генерация изображений, баннеров, креативов. FreePik + AI.",
    icon: Palette,
    status: "idle",
    model: "FreePik API",
    tasks: 15,
    color: "from-orange-500 to-red-400",
  },
  {
    name: "Sales Agent",
    role: "Revenue & Conversion",
    desc: "Автоматизированные воронки, B2B-outreach, конверсия лидов.",
    icon: ShoppingCart,
    status: "standby",
    model: "Claude Sonnet 4",
    tasks: 3,
    color: "from-emerald-500 to-teal-400",
  },
  {
    name: "Guardian",
    role: "Anti-Chaos Shield",
    desc: "Pre-mortem анализ, пожарные сценарии, защита от распыления.",
    icon: Shield,
    status: "active",
    model: "Claude Opus",
    tasks: 6,
    color: "from-red-500 to-pink-400",
  },
];

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  active: { label: "Active", color: "text-xp", dot: "bg-xp" },
  idle: { label: "Idle", color: "text-gold", dot: "bg-gold" },
  standby: { label: "Standby", color: "text-text-dim", dot: "bg-text-dim" },
};

export default function StudioPage() {
  const activeCount = AGENTS.filter((a) => a.status === "active").length;
  const totalTasks = AGENTS.reduce((s, a) => s + a.tasks, 0);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-bright">Frogface Studio</h1>
          <p className="mt-1 text-sm text-text-dim">
            AI-студия. Агенты вместо команды. Платишь API — не зарплаты.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-lg border border-border bg-bg-card px-3 py-2">
            <p className="text-[10px] text-text-dim">Active Agents</p>
            <p className="text-lg font-bold text-xp">{activeCount}/{AGENTS.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-bg-card px-3 py-2">
            <p className="text-[10px] text-text-dim">Total Tasks</p>
            <p className="text-lg font-bold text-accent">{totalTasks}</p>
          </div>
          <div className="rounded-lg border border-border bg-bg-card px-3 py-2">
            <p className="text-[10px] text-text-dim">API Cost Today</p>
            <p className="text-lg font-bold text-gold">~$2.40</p>
          </div>
        </div>
      </div>

      {/* Org chart visual */}
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
        <div className="flex items-center justify-center gap-2 text-xs text-accent">
          <Bot className="h-4 w-4" />
          <span className="font-medium">Hierarchy:</span>
          <span className="text-text-dim">
            You (Architect) → Moltbot (Director) → Department Agents → Tasks
          </span>
        </div>
      </div>

      {/* Agent grid */}
      <div className="grid grid-cols-2 gap-4">
        {AGENTS.map((agent) => {
          const st = statusConfig[agent.status];
          return (
            <div
              key={agent.name}
              className="group rounded-xl border border-border bg-bg-card p-5 transition-all hover:border-accent/30"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${agent.color}`}
                >
                  <agent.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-text-bright">{agent.name}</h3>
                    <div className="flex items-center gap-1">
                      <div className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                      <span className={`text-[10px] ${st.color}`}>{st.label}</span>
                    </div>
                  </div>
                  <p className="text-xs text-accent">{agent.role}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-text-dim">{agent.desc}</p>

                  <div className="mt-3 flex items-center gap-4">
                    <span className="flex items-center gap-1 text-[10px] text-text-dim">
                      <Activity className="h-3 w-3" />
                      {agent.tasks} tasks
                    </span>
                    <span className="text-[10px] text-text-dim">
                      Model: <span className="text-text">{agent.model}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Philosophy */}
      <div className="rounded-xl border border-border bg-bg-card p-5">
        <p className="text-center text-xs italic text-text-dim">
          &quot;Никаких людей, но множество агентов. Они сильно умнее, сильно лучше,
          сильно прокачаннее в плане знаний.&quot;
          <span className="ml-2 text-accent">— Sergey</span>
        </p>
      </div>
    </div>
  );
}
