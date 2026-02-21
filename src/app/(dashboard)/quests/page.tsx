"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Crown,
  Flame,
  Music,
  MessageSquareReply,
  Video,
  Megaphone,
  Palette,
  PenTool,
  Target,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/lib/use-local-storage";

type Priority = "normal" | "critical" | "boss";

interface Quest {
  id: string;
  text: string;
  xp: number;
  priority: Priority;
  done: boolean;
  note?: string;
}

interface QuestChain {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  quests: Quest[];
}

const INITIAL_CHAINS: QuestChain[] = [
  {
    id: "edison",
    title: "Edison Bar — Автономность",
    icon: <Music className="h-5 w-5 text-white" />,
    color: "from-amber-500 to-orange-400",
    borderColor: "border-amber-500/30",
    quests: [
      { id: "e1", text: "Загрузить меню Edison + пост о каталоге", xp: 140, priority: "critical", done: false, note: "Каталог артистов уже есть на сайте" },
      { id: "e2", text: "Настроить AI-копирайтера анонсов Edison", xp: 150, priority: "critical", done: false, note: "Автоматические анонсы выступлений из каталога" },
      { id: "e3", text: "Автоматизация афиш — AI генерация баннеров", xp: 200, priority: "normal", done: false },
      { id: "e4", text: "Винная карта на сайт + описания", xp: 100, priority: "normal", done: false },
      { id: "e5", text: "Соцсети Edison на автопилоте", xp: 180, priority: "normal", done: false, note: "Контент-конвейер: анонсы → посты → stories" },
      { id: "e6", text: "Система бронирования — автоответы", xp: 120, priority: "normal", done: false },
      { id: "e7", text: "Ребрендинг завершён", xp: 100, priority: "normal", done: true },
      { id: "e8", text: "Сайт Edison Bar — запустить", xp: 300, priority: "critical", done: false, note: "Закрыть гештальт. Сайт уже почти готов." },
      { id: "e9", text: "Полная автономность Edison (без ручного управления)", xp: 500, priority: "boss", done: false, note: "Босс цепочки: бар работает сам, ты не тушишь пожары" },
    ],
  },
  {
    id: "myreply",
    title: "MyReply — Первые деньги",
    icon: <MessageSquareReply className="h-5 w-5 text-white" />,
    color: "from-blue-500 to-cyan-400",
    borderColor: "border-blue-500/30",
    quests: [
      { id: "mr1", text: "YooKassa подключена", xp: 100, priority: "normal", done: true },
      { id: "mr2", text: "Тарифы настроены", xp: 80, priority: "normal", done: true },
      { id: "mr3", text: "Промокоды работают", xp: 80, priority: "normal", done: true },
      { id: "mr4", text: "Телеграм-канал активен", xp: 80, priority: "normal", done: true },
      { id: "mr5", text: "Первый платящий пользователь", xp: 200, priority: "normal", done: true },
      { id: "mr6", text: "Soft Launch: чаты + личные контакты", xp: 200, priority: "critical", done: false, note: "Написать 50 владельцам ВБ-магазинов лично" },
      { id: "mr7", text: "SEO + оптимизация лендинга", xp: 150, priority: "normal", done: false },
      { id: "mr8", text: "Chrome-расширение на публикацию", xp: 180, priority: "normal", done: false },
      { id: "mr9", text: "Демо-видео MyReply (30-45 сек)", xp: 100, priority: "normal", done: false, note: "Показать магию: отзыв → ответ за 3 секунды" },
      { id: "mr10", text: "Контент-стратегия — 30 постов", xp: 150, priority: "normal", done: false },
      { id: "mr11", text: "Партнёрская программа (реферал)", xp: 120, priority: "normal", done: false },
      { id: "mr12", text: "Первые 10 платящих на MyReply", xp: 800, priority: "boss", done: false, note: "БОСС цепочки. 10 платящих = product-market fit сигнал." },
    ],
  },
  {
    id: "video",
    title: "Съёмка — «Идущий к руке»",
    icon: <Video className="h-5 w-5 text-white" />,
    color: "from-red-500 to-pink-400",
    borderColor: "border-red-500/30",
    quests: [
      { id: "v1", text: "Записать первое видео «Идущий к руке»", xp: 300, priority: "boss", done: false, note: "Серия коротких видео о пути к свободе через AI и автоматизацию" },
      { id: "v2", text: "Видео: «Я 9 лет управлял баром, а потом...»", xp: 120, priority: "normal", done: false },
      { id: "v3", text: "Видео: «AI заменил мне 5 сотрудников»", xp: 120, priority: "normal", done: false },
      { id: "v4", text: "Видео: «Как я запустил SaaS за 2 недели»", xp: 120, priority: "normal", done: false },
      { id: "v5", text: "Видео: «Мой пульт управления жизнью»", xp: 120, priority: "normal", done: false, note: "Показать frogface.space" },
      { id: "v6", text: "Видео: «Почему я не нанимаю людей»", xp: 120, priority: "normal", done: false },
      { id: "v7", text: "Монтаж и публикация первых 3 видео", xp: 200, priority: "critical", done: false },
      { id: "v8", text: "Настроить конвейер: запись → монтаж → публикация", xp: 150, priority: "normal", done: false },
      { id: "v9", text: "10 видео опубликовано", xp: 500, priority: "boss", done: false, note: "Босс: серия запущена, зритель пошёл" },
    ],
  },
  {
    id: "funnel",
    title: "Воронка — Edison → MyReply",
    icon: <Megaphone className="h-5 w-5 text-white" />,
    color: "from-green-500 to-emerald-400",
    borderColor: "border-green-500/30",
    quests: [
      { id: "f1", text: "UGC-челлендж MyReply: крутик-отзывы", xp: 150, priority: "critical", done: false, note: "Реальные скриншоты: бизнес до/после MyReply" },
      { id: "f2", text: "Демо через негатив: «Вот что вам пишут...»", xp: 120, priority: "normal", done: false },
      { id: "f3", text: "Кейс Edison как первый клиент MyReply", xp: 150, priority: "normal", done: false, note: "Мягкий переход: аудитория Edison → MyReply" },
      { id: "f4", text: "Прогрев: серия постов о проблеме отзывов", xp: 100, priority: "normal", done: false },
      { id: "f5", text: "Landing page с A/B тестом", xp: 120, priority: "normal", done: false },
      { id: "f6", text: "Воронка приносит 5+ регистраций в неделю", xp: 400, priority: "boss", done: false, note: "Босс: органический поток пользователей пошёл" },
    ],
  },
  {
    id: "frogface",
    title: "Frogface Studio — Инфраструктура",
    icon: <Palette className="h-5 w-5 text-white" />,
    color: "from-violet-500 to-purple-400",
    borderColor: "border-violet-500/30",
    quests: [
      { id: "fs1", text: "Дашборд Life OS на frogface.space", xp: 200, priority: "critical", done: true, note: "Мы это сделали!" },
      { id: "fs2", text: "Авторизация и защита", xp: 100, priority: "normal", done: true },
      { id: "fs3", text: "Пульт управления агентами (Студия)", xp: 200, priority: "normal", done: true },
      { id: "fs4", text: "RPG-движок: квесты из реальных задач", xp: 200, priority: "critical", done: false, note: "Квесты из потоков сознания → система прогресса" },
      { id: "fs5", text: "Подключить бэкенд (сохранение данных)", xp: 300, priority: "normal", done: false },
      { id: "fs6", text: "B2B кейс: «Как AI-студия ведёт мой бизнес»", xp: 150, priority: "normal", done: false },
    ],
  },
  {
    id: "content",
    title: "Контент-фабрика",
    icon: <PenTool className="h-5 w-5 text-white" />,
    color: "from-pink-500 to-rose-400",
    borderColor: "border-pink-500/30",
    quests: [
      { id: "cf1", text: "Контент-план на месяц (все каналы)", xp: 150, priority: "critical", done: false },
      { id: "cf2", text: "Pipeline: идея → текст → картинка → пост", xp: 200, priority: "normal", done: false, note: "AI-конвейер автоматической генерации контента" },
      { id: "cf3", text: "AI-копирайтер Edison: автоанонсы", xp: 150, priority: "normal", done: false },
      { id: "cf4", text: "Автолетопись: лог действий → красивый дневник", xp: 120, priority: "normal", done: false, note: "Из лога событий frogface.space → контент" },
      { id: "cf5", text: "30 постов за месяц (все проекты)", xp: 400, priority: "boss", done: false, note: "Босс: регулярный контент на автопилоте" },
    ],
  },
];

export default function QuestsPage() {
  const [chains, setChains] = useLocalStorage("ff_quest_chains", INITIAL_CHAINS);
  const [expandedChains, setExpandedChains] = useState<Set<string>>(new Set(["edison", "myreply"]));

  const toggleChain = (chainId: string) => {
    setExpandedChains((prev) => {
      const next = new Set(prev);
      if (next.has(chainId)) next.delete(chainId);
      else next.add(chainId);
      return next;
    });
  };

  const toggleQuest = (chainId: string, questId: string) => {
    setChains((prev) =>
      prev.map((c) =>
        c.id === chainId
          ? { ...c, quests: c.quests.map((q) => (q.id === questId ? { ...q, done: !q.done } : q)) }
          : c
      )
    );
  };

  const totalQuests = chains.reduce((s, c) => s + c.quests.length, 0);
  const doneQuests = chains.reduce((s, c) => s + c.quests.filter((q) => q.done).length, 0);
  const totalXp = chains.reduce((s, c) => s + c.quests.reduce((ss, q) => ss + q.xp, 0), 0);
  const earnedXp = chains.reduce((s, c) => s + c.quests.filter((q) => q.done).reduce((ss, q) => ss + q.xp, 0), 0);
  const chapterProgress = Math.round((doneQuests / totalQuests) * 100);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-bright">Журнал квестов</h1>
          <p className="mt-1 text-sm text-text-dim">
            Глава 1: Фундамент · Все задачи из потоков сознания
          </p>
        </div>
        <div className="flex gap-3">
          <StatBadge label="Квесты" value={`${doneQuests}/${totalQuests}`} color="text-accent" />
          <StatBadge label="Опыт" value={`${earnedXp}/${totalXp} XP`} color="text-xp" />
          <StatBadge label="Глава" value={`${chapterProgress}%`} color="text-gold" />
        </div>
      </div>

      {/* Chapter progress bar */}
      <div className="rounded-xl border border-border bg-bg-card p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-dim">Прогресс Главы 1</span>
          <span className="font-mono text-accent">{chapterProgress}%</span>
        </div>
        <div className="mt-2 h-3 rounded-full bg-bg-deep">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent via-mana to-xp transition-all"
            style={{ width: `${chapterProgress}%` }}
          />
        </div>
      </div>

      {/* Quest chains */}
      <div className="space-y-3">
        {chains.map((chain) => {
          const isOpen = expandedChains.has(chain.id);
          const done = chain.quests.filter((q) => q.done).length;
          const total = chain.quests.length;
          const pct = Math.round((done / total) * 100);

          return (
            <div key={chain.id} className={cn("rounded-xl border bg-bg-card transition-all", chain.borderColor)}>
              {/* Chain header */}
              <button
                onClick={() => toggleChain(chain.id)}
                className="flex w-full items-center gap-4 p-4 text-left"
              >
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br", chain.color)}>
                  {chain.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-text-bright">{chain.title}</h3>
                    <span className="text-xs text-text-dim">{done}/{total}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full max-w-xs rounded-full bg-bg-deep">
                    <div
                      className={cn("h-full rounded-full bg-gradient-to-r transition-all", chain.color)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ProgressRing pct={pct} />
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-text-dim" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-text-dim" />
                  )}
                </div>
              </button>

              {/* Quests list */}
              {isOpen && (
                <div className="border-t border-border px-4 pb-4 pt-2">
                  <div className="space-y-1">
                    {chain.quests.map((quest) => (
                      <div
                        key={quest.id}
                        className={cn(
                          "group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-bg-hover",
                          quest.done && "opacity-50"
                        )}
                      >
                        <button
                          onClick={() => toggleQuest(chain.id, quest.id)}
                          className="mt-0.5 shrink-0"
                        >
                          {quest.done ? (
                            <CheckCircle2 className="h-4.5 w-4.5 text-xp" />
                          ) : (
                            <Circle className="h-4.5 w-4.5 text-text-dim/30 transition-colors group-hover:text-accent" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn("text-sm", quest.done ? "text-text-dim line-through" : "text-text-bright")}>
                              {quest.text}
                            </span>
                            <PriorityBadge priority={quest.priority} />
                          </div>
                          {quest.note && (
                            <p className="mt-0.5 text-[10px] leading-relaxed text-text-dim/60">
                              {quest.note}
                            </p>
                          )}
                        </div>

                        <span className="shrink-0 text-[10px] text-xp">+{quest.xp} XP</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  if (priority === "boss") {
    return (
      <span className="flex items-center gap-0.5 rounded bg-gold/20 px-1.5 py-0.5 text-[10px] font-bold text-gold">
        <Crown className="h-2.5 w-2.5" /> БОСС
      </span>
    );
  }
  if (priority === "critical") {
    return (
      <span className="flex items-center gap-0.5 rounded bg-hp/20 px-1.5 py-0.5 text-[10px] font-medium text-hp">
        <Flame className="h-2.5 w-2.5" /> крит
      </span>
    );
  }
  return null;
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 14;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative flex h-9 w-9 items-center justify-center">
      <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r={r} fill="none" stroke="currentColor" strokeWidth="2.5" className="text-bg-deep" />
        <circle
          cx="18" cy="18" r={r}
          fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-accent transition-all"
        />
      </svg>
      <span className="absolute text-[8px] font-bold text-text-dim">{pct}%</span>
    </div>
  );
}

function StatBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg-card px-3 py-2">
      <p className="text-[10px] text-text-dim">{label}</p>
      <p className={cn("text-xs font-bold", color)}>{value}</p>
    </div>
  );
}
