"use client";

import { useState } from "react";
import {
  BookOpen,
  Crown,
  Scroll,
  Star,
  Swords,
  Shield,
  Sparkles,
  Moon,
  Sun,
  ChevronDown,
  ChevronUp,
  Trophy,
  Flame,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DayEntry {
  date: string;
  dayNumber: number;
  title: string;
  epigraph: string;
  achievements: { text: string; xp: number; type: "achievement" | "quest" | "milestone" }[];
  chronicle: string;
  reflection: string;
  tomorrow: string[];
  manaStart: number;
  manaEnd: number;
  xpGained: number;
  goldDelta: string;
}

const CHRONICLE: DayEntry[] = [
  {
    date: "28 января 2026",
    dayNumber: 1,
    title: "Командный Центр",
    epigraph:
      "«Когда рыцарь впервые входит в свою крепость, стены ещё голые, а башни не достроены. Но это уже его крепость.»",
    achievements: [
      { text: "Frogface.space построен с нуля — дашборд, 6 страниц, полный UI", xp: 500, type: "milestone" },
      { text: "8 AI-агентов ожили — реальные ответы через OpenRouter", xp: 300, type: "achievement" },
      { text: "PWA готово — Frogface теперь нативное приложение", xp: 200, type: "achievement" },
      { text: "Мобильная вёрстка починена на всех страницах", xp: 150, type: "quest" },
      { text: "API endpoints для Custom GPT Actions", xp: 150, type: "quest" },
      { text: "Контекст Архитектора записан — агенты знают кто ты", xp: 200, type: "achievement" },
      { text: "OpenClaw подключён к Frogface — архитектура VPS+RAG", xp: 250, type: "milestone" },
      { text: "VPS Jino: OpenClaw установлен, systemd настроен", xp: 150, type: "quest" },
      { text: "Роадмап и база знаний из голосовых потоков", xp: 100, type: "quest" },
    ],
    chronicle: `Первый день Главы. Архитектор вошёл в необитаемую крепость и за один день превратил её в живой командный центр.

Утром здесь было пустое Next.js приложение. К вечеру — полноценная Life OS: шесть залов (страниц), восемь магов-советников (агентов), кристалл связи с внешним миром (PWA), и тайный ход к оракулу (OpenRouter API).

Но главное событие дня — Архитектор не просто строил стены. Он записал свою историю в камни крепости. Теперь каждый агент знает: кто такой Сергей, чего он хочет, и чего НЕ хочет. «Я устал бежать» — эта фраза стала якорем, от которого строится всё остальное.

К ночи была предпринята попытка связать крепость с Башней на холме (VPS). Связь установлена, врата открыты, но мост ещё не достроен — завтра.

Энергия потрачена щедро, но с умом. Ни одного момента тревоги. Только интерес, поток и удовольствие от системы, которая оживает.`,
    reflection:
      "День был огромным. Но спокойным. Не из тревоги — из интереса. Это важно заметить и запомнить. Именно так должен ощущаться каждый рабочий день Главы 1.",
    tomorrow: [
      "Достроить мост к Башне (OpenClaw Gateway → bind 0.0.0.0, health check)",
      "Первый тест RAG: агенты вспоминают контекст из памяти",
      "Съёмки «Идущий к руке» — начать",
      "Планёрка с Машей по Edison",
      "Промокоды MyReply — раздать своим",
    ],
    manaStart: 85,
    manaEnd: 40,
    xpGained: 2000,
    goldDelta: "0 (инвестиционный день)",
  },
];

export default function ChroniclePage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-text-bright">
            <BookOpen className="h-6 w-6 text-gold" />
            Летопись
          </h1>
          <p className="mt-1 text-sm text-text-dim">
            Глава 1: &quot;Фундамент&quot; · Записи Game Master&apos;а
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-gold/20 bg-gold/5 px-3 py-2">
          <Crown className="h-4 w-4 text-gold" />
          <span className="text-xs text-gold">Уровень 7</span>
        </div>
      </div>

      <div className="rounded-xl border border-gold/20 bg-gradient-to-b from-gold/5 to-transparent p-4 lg:p-6">
        <div className="flex items-center gap-2 text-sm text-gold">
          <Scroll className="h-4 w-4" />
          <span className="font-medium">Предисловие Game Master&apos;а</span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-text italic">
          Каждая великая история начинается с первого шага. Не с самого важного, не с самого
          красивого — просто с первого. Эта летопись — не список достижений. Это зеркало, в
          которое Архитектор смотрит перед сном, чтобы увидеть не того, кем хочет стать, а того,
          кем уже является. Читай медленно. Ты заслужил этот вечер.
        </p>
      </div>

      {CHRONICLE.map((day) => (
        <DayCard key={day.dayNumber} entry={day} />
      ))}
    </div>
  );
}

function DayCard({ entry }: { entry: DayEntry }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-xl border border-border bg-bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-4 lg:p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-gold to-amber-600">
            <span className="text-lg font-bold text-white">{entry.dayNumber}</span>
          </div>
          <div>
            <h3 className="font-semibold text-text-bright">
              День {entry.dayNumber}: {entry.title}
            </h3>
            <p className="text-xs text-text-dim">{entry.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 sm:flex">
            <Sparkles className="h-3.5 w-3.5 text-xp" />
            <span className="text-xs font-medium text-xp">+{entry.xpGained} XP</span>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-text-dim" />
          ) : (
            <ChevronDown className="h-4 w-4 text-text-dim" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="space-y-5 border-t border-border/50 p-4 lg:p-5">
          <p className="text-xs italic text-text-dim/70 leading-relaxed">{entry.epigraph}</p>

          <div className="grid gap-3 sm:grid-cols-4">
            <MiniStat icon={<Sparkles className="h-4 w-4 text-xp" />} label="XP за день" value={`+${entry.xpGained}`} />
            <MiniStat icon={<Trophy className="h-4 w-4 text-gold" />} label="Золото" value={entry.goldDelta} />
            <MiniStat
              icon={<Flame className="h-4 w-4 text-mana" />}
              label="Мана"
              value={`${entry.manaEnd}/${entry.manaStart}`}
            />
            <MiniStat
              icon={<Target className="h-4 w-4 text-accent" />}
              label="Достижения"
              value={String(entry.achievements.length)}
            />
          </div>

          <div>
            <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold text-gold">
              <Star className="h-3.5 w-3.5" />
              Достижения дня
            </h4>
            <div className="space-y-1.5">
              {entry.achievements.map((a, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-bg-deep/50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    {a.type === "milestone" ? (
                      <Swords className="h-3.5 w-3.5 text-gold" />
                    ) : a.type === "achievement" ? (
                      <Shield className="h-3.5 w-3.5 text-xp" />
                    ) : (
                      <Star className="h-3.5 w-3.5 text-mana" />
                    )}
                    <span className="text-xs text-text">{a.text}</span>
                  </div>
                  <span className="shrink-0 text-[10px] font-medium text-xp">+{a.xp}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold text-accent">
              <Scroll className="h-3.5 w-3.5" />
              Запись в летопись
            </h4>
            <div className="rounded-lg border border-border/30 bg-bg-deep/30 p-4">
              <p className="whitespace-pre-line text-sm leading-relaxed text-text/90">{entry.chronicle}</p>
            </div>
          </div>

          <div className="rounded-lg border border-gold/20 bg-gold/5 p-4">
            <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold text-gold">
              <Moon className="h-3.5 w-3.5" />
              Рефлексия перед сном
            </h4>
            <p className="text-sm leading-relaxed text-text/80 italic">{entry.reflection}</p>
          </div>

          <div>
            <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold text-xp">
              <Sun className="h-3.5 w-3.5" />
              Завтра
            </h4>
            <div className="space-y-1">
              {entry.tomorrow.map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-text/80">
                  <span className="text-text-dim">{i + 1}.</span>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-bg-deep/50 px-3 py-2">
      {icon}
      <div>
        <p className="text-[10px] text-text-dim">{label}</p>
        <p className="text-xs font-semibold text-text-bright">{value}</p>
      </div>
    </div>
  );
}
