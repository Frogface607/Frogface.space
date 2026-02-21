import {
  Zap,
  TrendingUp,
  Target,
  Clock,
  Flame,
  Trophy,
} from "lucide-react";

export default function HQPage() {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-bright">
          Добро пожаловать в игру
        </h1>
        <p className="mt-1 text-sm text-text-dim">
          Chapter 1 — &quot;Foundation&quot; · Day 1 · February 2026
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-gold" />}
          label="Gold (MRR)"
          value="178K ₽"
          delta="+12% from last month"
          accent="border-gold/30"
        />
        <StatCard
          icon={<Zap className="h-5 w-5 text-mana" />}
          label="Mana (Energy)"
          value="72/100"
          delta="Good — keep moving"
          accent="border-mana/30"
        />
        <StatCard
          icon={<Flame className="h-5 w-5 text-xp" />}
          label="XP Today"
          value="+340"
          delta="3 quests completed"
          accent="border-xp/30"
        />
        <StatCard
          icon={<Target className="h-5 w-5 text-accent" />}
          label="Active Quests"
          value="7"
          delta="2 critical, 5 normal"
          accent="border-accent/30"
        />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-3 gap-6">
        {/* Active quests */}
        <div className="col-span-2 rounded-xl border border-border bg-bg-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-bright">
            <Target className="h-4 w-4 text-accent" />
            Active Quests
          </h2>
          <div className="space-y-3">
            <QuestRow
              title="Launch MyReply v1"
              project="MyReply"
              xp={500}
              priority="critical"
              progress={85}
            />
            <QuestRow
              title="Edison Bar website — close the gestalt"
              project="Edison"
              xp={300}
              priority="critical"
              progress={60}
            />
            <QuestRow
              title="Setup Frogface.space dashboard"
              project="Frogface"
              xp={200}
              priority="normal"
              progress={15}
            />
            <QuestRow
              title="Receptor pre-production analysis"
              project="Receptor"
              xp={150}
              priority="normal"
              progress={30}
            />
            <QuestRow
              title="First 10 paying users on MyReply"
              project="MyReply"
              xp={800}
              priority="boss"
              progress={10}
            />
          </div>
        </div>

        {/* Recent activity / Game Master log */}
        <div className="rounded-xl border border-border bg-bg-card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-bright">
            <Trophy className="h-4 w-4 text-gold" />
            Game Master Log
          </h2>
          <div className="space-y-3">
            <LogEntry
              time="just now"
              text="Chapter 1 begins. The Architect enters the command center."
              type="story"
            />
            <LogEntry
              time="2h ago"
              text="Moltbot proxy deployed. Voice transcription unlocked."
              type="achievement"
            />
            <LogEntry
              time="yesterday"
              text="First payment received: 490₽. Gold +0.5K."
              type="gold"
            />
            <LogEntry
              time="2 days ago"
              text="AI Proxy route created. Geo-blocking bypassed."
              type="achievement"
            />
            <LogEntry
              time="3 days ago"
              text="Workspace optimized. Token cost reduced 4x."
              type="xp"
            />
          </div>
        </div>
      </div>

      {/* Chapter progress */}
      <div className="rounded-xl border border-border bg-bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-text-bright">
              <Clock className="h-4 w-4 text-mana" />
              Chapter 1: Foundation
            </h2>
            <p className="mt-1 text-xs text-text-dim">
              30-day sprint · Build the base, launch products, reach 500K Gold
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-accent">Day 1</p>
            <p className="text-[10px] text-text-dim">29 days remaining</p>
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

function QuestRow({
  title,
  project,
  xp,
  priority,
  progress,
}: {
  title: string;
  project: string;
  xp: number;
  priority: "normal" | "critical" | "boss";
  progress: number;
}) {
  const priorityColors = {
    normal: "bg-mana/20 text-mana",
    critical: "bg-hp/20 text-hp",
    boss: "bg-gold/20 text-gold",
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-bg-deep/50 px-4 py-3">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-bright">{title}</span>
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${priorityColors[priority]}`}>
            {priority === "boss" ? "BOSS" : priority}
          </span>
        </div>
        <div className="mt-1.5 flex items-center gap-3">
          <span className="text-[10px] text-text-dim">{project}</span>
          <span className="text-[10px] text-xp">+{xp} XP</span>
          <div className="h-1 w-24 rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] text-text-dim">{progress}%</span>
        </div>
      </div>
    </div>
  );
}

function LogEntry({
  time,
  text,
  type,
}: {
  time: string;
  text: string;
  type: "story" | "achievement" | "gold" | "xp";
}) {
  const colors = {
    story: "border-l-accent",
    achievement: "border-l-xp",
    gold: "border-l-gold",
    xp: "border-l-mana",
  };

  return (
    <div className={`border-l-2 ${colors[type]} pl-3`}>
      <p className="text-xs text-text">{text}</p>
      <p className="mt-0.5 text-[10px] text-text-dim">{time}</p>
    </div>
  );
}
