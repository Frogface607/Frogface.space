import {
  MessageSquareReply,
  Music,
  Cpu,
  Palette,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle2,
  Circle,
  AlertCircle,
} from "lucide-react";

const PROJECTS = [
  {
    id: "myreply",
    name: "MyReply",
    tagline: "AI-ответы на отзывы для маркетплейсов",
    icon: MessageSquareReply,
    color: "from-blue-500 to-cyan-400",
    borderColor: "border-blue-500/30",
    status: "launching",
    phase: "Launch Sprint",
    mrr: "0.5K",
    mrrTarget: "100K",
    users: 1,
    usersTarget: 200,
    progress: 85,
    quests: [
      { text: "First 10 paying users", done: false, priority: "boss" },
      { text: "Content strategy live", done: true },
      { text: "Telegram channel active", done: true },
      { text: "Payment system working", done: true },
      { text: "Promo code system", done: true },
      { text: "SEO + landing optimization", done: false },
      { text: "Chrome extension submission", done: false },
    ],
    metrics: [
      { label: "MRR", value: "490₽", trend: "+100%" },
      { label: "Users", value: "1", trend: "first!" },
      { label: "AI Cost/Response", value: "~3₽", trend: "optimal" },
    ],
  },
  {
    id: "edison",
    name: "Edison Bar",
    tagline: "Легендарный бар — 9 лет. Автономность через автоматизацию.",
    icon: Music,
    color: "from-amber-500 to-orange-400",
    borderColor: "border-amber-500/30",
    status: "active",
    phase: "Autonomy Quest",
    mrr: "150K",
    mrrTarget: "200K",
    users: null,
    usersTarget: null,
    progress: 60,
    quests: [
      { text: "Website launch — close the gestalt", done: false, priority: "critical" },
      { text: "Automated announcements", done: false },
      { text: "Rebrand finalized", done: true },
      { text: "Menu automation", done: false },
      { text: "Social media on autopilot", done: false },
    ],
    metrics: [
      { label: "Monthly Rev", value: "~150K₽", trend: "stable" },
      { label: "Manual Work", value: "high", trend: "reducing" },
      { label: "Automation", value: "30%", trend: "growing" },
    ],
  },
  {
    id: "receptor",
    name: "Receptor",
    tagline: "AI-powered platform. Pre-production analysis.",
    icon: Cpu,
    color: "from-purple-500 to-pink-400",
    borderColor: "border-purple-500/30",
    status: "research",
    phase: "Research & Analysis",
    mrr: "0",
    mrrTarget: "TBD",
    users: null,
    usersTarget: null,
    progress: 30,
    quests: [
      { text: "Market analysis complete", done: true },
      { text: "Technical feasibility study", done: false },
      { text: "MVP scope definition", done: false },
      { text: "First prototype", done: false },
    ],
    metrics: [
      { label: "Phase", value: "Research", trend: "active" },
      { label: "Blockers", value: "2", trend: "resolving" },
    ],
  },
  {
    id: "frogface",
    name: "Frogface Studio",
    tagline: "AI-студия. Агенты вместо команды. Личный бренд.",
    icon: Palette,
    color: "from-green-500 to-emerald-400",
    borderColor: "border-green-500/30",
    status: "building",
    phase: "Infrastructure Build",
    mrr: "0",
    mrrTarget: "B2B",
    users: null,
    usersTarget: null,
    progress: 15,
    quests: [
      { text: "Life OS dashboard (this!)", done: false, priority: "critical" },
      { text: "Agent office setup", done: false },
      { text: "Portfolio showcase", done: false },
      { text: "B2B case studies", done: false },
    ],
    metrics: [
      { label: "Agents", value: "12+", trend: "configured" },
      { label: "Tools", value: "8", trend: "active" },
    ],
  },
];

const statusColors: Record<string, string> = {
  launching: "bg-xp/20 text-xp",
  active: "bg-gold/20 text-gold",
  research: "bg-mana/20 text-mana",
  building: "bg-accent/20 text-accent",
};

export default function ProjectsPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-bright">Mission Board</h1>
          <p className="mt-1 text-sm text-text-dim">
            Projects are bosses. Tasks are quests. Ship or die.
          </p>
        </div>
        <div className="flex gap-3">
          <MiniStat icon={<DollarSign className="h-4 w-4 text-gold" />} label="Total MRR" value="~178K ₽" />
          <MiniStat icon={<TrendingUp className="h-4 w-4 text-xp" />} label="Target" value="500K ₽" />
        </div>
      </div>

      {/* Project cards */}
      <div className="grid grid-cols-2 gap-5">
        {PROJECTS.map((p) => (
          <div
            key={p.id}
            className={`rounded-xl border ${p.borderColor} bg-bg-card p-5 transition-all hover:border-opacity-60`}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${p.color}`}>
                  <p.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-bright">{p.name}</h3>
                  <p className="text-[10px] text-text-dim">{p.tagline}</p>
                </div>
              </div>
              <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${statusColors[p.status]}`}>
                {p.phase}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-[10px] text-text-dim">
                <span>Overall progress</span>
                <span>{p.progress}%</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-bg-deep">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${p.color}`}
                  style={{ width: `${p.progress}%` }}
                />
              </div>
            </div>

            {/* Metrics */}
            <div className="mt-3 flex gap-3">
              {p.metrics.map((m) => (
                <div key={m.label} className="rounded-md bg-bg-deep px-2.5 py-1.5">
                  <p className="text-[10px] text-text-dim">{m.label}</p>
                  <p className="text-xs font-medium text-text-bright">{m.value}</p>
                  <p className="text-[9px] text-xp">{m.trend}</p>
                </div>
              ))}
            </div>

            {/* Quests */}
            <div className="mt-3 space-y-1.5">
              {p.quests.map((q, i) => (
                <div key={i} className="flex items-center gap-2">
                  {q.done ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-xp" />
                  ) : q.priority === "boss" ? (
                    <AlertCircle className="h-3.5 w-3.5 text-gold" />
                  ) : q.priority === "critical" ? (
                    <AlertCircle className="h-3.5 w-3.5 text-hp" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-text-dim/30" />
                  )}
                  <span
                    className={`text-xs ${
                      q.done ? "text-text-dim line-through" : "text-text"
                    }`}
                  >
                    {q.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-card px-3 py-2">
      {icon}
      <div>
        <p className="text-[10px] text-text-dim">{label}</p>
        <p className="text-xs font-semibold text-text-bright">{value}</p>
      </div>
    </div>
  );
}
