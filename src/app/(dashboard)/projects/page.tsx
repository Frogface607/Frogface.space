import {
  MessageSquareReply,
  Music,
  Video,
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
    tagline: "AI-ответы на отзывы. 2Gis, Яндекс.Карты. 490₽/мес.",
    icon: MessageSquareReply,
    color: "from-blue-500 to-cyan-400",
    borderColor: "border-blue-500/30",
    status: "launching",
    phase: "Soft Launch",
    mrr: "0.5K",
    mrrTarget: "500K",
    users: 1,
    usersTarget: 10,
    progress: 85,
    quests: [
      { text: "Первые 10 платящих клиентов", done: false, priority: "boss" },
      { text: "Промокоды 7 дней — раздать своим", done: false, priority: "critical" },
      { text: "Пост soft launch от Frogface-бота", done: false },
      { text: "UGC-конкурс «трешовый отзыв»", done: false },
      { text: "Платёжная система работает", done: true },
      { text: "Telegram-канал активен", done: true },
      { text: "SEO + оптимизация лендинга", done: false },
    ],
    metrics: [
      { label: "MRR", value: "178K₽", trend: "→ 500K" },
      { label: "Клиенты", value: "1", trend: "цель: 10" },
      { label: "AI/ответ", value: "~3₽", trend: "оптимально" },
      { label: "Чек", value: "490₽", trend: "/мес" },
    ],
  },
  {
    id: "edison",
    name: "Edison Bar",
    tagline: "Ресторан-бар Иркутск. Цель — полная автономия от Сергея.",
    icon: Music,
    color: "from-amber-500 to-orange-400",
    borderColor: "border-amber-500/30",
    status: "active",
    phase: "11 дней до сайта",
    mrr: "80K",
    mrrTarget: "150K",
    users: null,
    usersTarget: null,
    progress: 55,
    quests: [
      { text: "Запуск сайта — 11 дней", done: false, priority: "critical" },
      { text: "Планёрка с Машей (стратегия)", done: false, priority: "critical" },
      { text: "Фотосессия еды + интерьера", done: false },
      { text: "Batch вывесок через Freepik", done: false },
      { text: "Контент-фабрика для соцсетей", done: false },
      { text: "Ребрендинг завершён", done: true },
      { text: "Автоматизация меню", done: false },
    ],
    metrics: [
      { label: "Выручка", value: "~80K₽/мес", trend: "стабильно" },
      { label: "Дедлайн", value: "11 дней", trend: "тикает" },
      { label: "Автономия", value: "30%", trend: "растёт" },
    ],
  },
  {
    id: "youtube",
    name: "Идущий к руке",
    tagline: "YouTube-проект. Честно, без инфоцыганства.",
    icon: Video,
    color: "from-red-500 to-rose-400",
    borderColor: "border-red-500/30",
    status: "building",
    phase: "Подготовка съёмок",
    mrr: "0",
    mrrTarget: "—",
    users: null,
    usersTarget: null,
    progress: 20,
    quests: [
      { text: "Съёмки ср-чт-пт", done: false, priority: "critical" },
      { text: "Стартовая фраза: «Я устал бежать»", done: true },
      { text: "Сценарий первого выпуска", done: false },
      { text: "Монтаж + публикация", done: false },
    ],
    metrics: [
      { label: "Формат", value: "влог", trend: "честный" },
      { label: "Статус", value: "пре-продакшн", trend: "активно" },
    ],
  },
  {
    id: "frogface",
    name: "Frogface.space",
    tagline: "Life OS дашборд. PWA. Агенты. RPG-система.",
    icon: Palette,
    color: "from-green-500 to-emerald-400",
    borderColor: "border-green-500/30",
    status: "building",
    phase: "Глава 1: Фундамент",
    mrr: "0",
    mrrTarget: "—",
    users: null,
    usersTarget: null,
    progress: 45,
    quests: [
      { text: "PWA установка", done: true },
      { text: "Живые AI-агенты через OpenRouter", done: true },
      { text: "API для Custom GPT Actions", done: true },
      { text: "Персистентность данных", done: false },
      { text: "Freepik Pipeline: batch-генерация", done: false },
      { text: "Ритуал закрытия дня", done: false },
    ],
    metrics: [
      { label: "Агенты", value: "8", trend: "на связи" },
      { label: "Стек", value: "Next.js", trend: "Vercel" },
      { label: "PWA", value: "✓", trend: "готово" },
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
          <h1 className="text-2xl font-bold text-text-bright">Доска миссий</h1>
          <p className="mt-1 text-sm text-text-dim">
            Проекты — боссы. Задачи — квесты. Делай или умри.
          </p>
        </div>
        <div className="flex gap-3">
          <MiniStat icon={<DollarSign className="h-4 w-4 text-gold" />} label="Общий MRR" value="~178K ₽" />
          <MiniStat icon={<TrendingUp className="h-4 w-4 text-xp" />} label="Цель" value="500K ₽" />
        </div>
      </div>

      {/* Project cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
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
                <span>Общий прогресс</span>
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
            <div className="mt-3 flex flex-wrap gap-2 lg:gap-3">
              {p.metrics.map((m) => (
                <div key={m.label} className="rounded-md bg-bg-deep px-2 py-1.5 lg:px-2.5">
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
