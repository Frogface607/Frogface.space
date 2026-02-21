"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Zap,
  TrendingUp,
  Target,
  Clock,
  Flame,
  Trophy,
  CheckCircle2,
  Circle,
  Plus,
  Mic,
  MicOff,
  Loader2,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Bot,
  Database,
  Smartphone,
  SkipForward,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePersistedState } from "@/lib/use-persisted-state";

interface Quest {
  id: string;
  title: string;
  project: string;
  xp: number;
  priority: "normal" | "critical" | "boss";
  progress: number;
  done: boolean;
}

interface LogItem {
  id: string;
  time: string;
  text: string;
  type: "story" | "achievement" | "gold" | "xp" | "log" | "voice";
}

const INITIAL_QUESTS: Quest[] = [
  { id: "q1", title: "Первые 10 платящих на MyReply", project: "MyReply", xp: 800, priority: "boss", progress: 10, done: false },
  { id: "q2", title: "Запуск сайта Edison Bar — 10 дней", project: "Edison", xp: 500, priority: "boss", progress: 30, done: false },
  { id: "q3", title: "Съёмки «Идущий к руке» (ср-чт-пт)", project: "YouTube", xp: 300, priority: "critical", progress: 0, done: false },
  { id: "q4", title: "Промокоды MyReply 7 дней — раздать своим", project: "MyReply", xp: 200, priority: "critical", progress: 0, done: false },
  { id: "q5", title: "Планёрка с Машей (стратегия Edison)", project: "Edison", xp: 150, priority: "critical", progress: 0, done: false },
  { id: "q6", title: "Пост soft launch MyReply от Frogface-бота", project: "MyReply", xp: 150, priority: "critical", progress: 0, done: false },
  { id: "q7", title: "Допилить HTTP-мост OpenClaw → frogface.space", project: "Frogface", xp: 200, priority: "critical", progress: 80, done: false },
  { id: "q8", title: "UGC-конкурс «самый трешовый отзыв»", project: "MyReply", xp: 150, priority: "normal", progress: 0, done: false },
  { id: "q9", title: "Freepik Pipeline: batch вывесок Edison", project: "Edison", xp: 100, priority: "normal", progress: 0, done: false },
  { id: "q10", title: "Добавить OPENCLAW_URL + TOKEN в Vercel", project: "Frogface", xp: 100, priority: "critical", progress: 0, done: false },
];

const INITIAL_LOG: LogItem[] = [
  { id: "d2a", time: "29 янв, вечер", text: "OpenClaw Gateway запущен на VPS Jino. Probe: OK. HTTP-мост создан.", type: "achievement" },
  { id: "d2b", time: "29 янв, вечер", text: "Moltbot управляет квестами из чата — создаёт, завершает, показывает голосом.", type: "achievement" },
  { id: "d2c", time: "29 янв, день", text: "Полноценный голосовой режим: микрофон + TTS ответы. Замена ChatGPT Voice.", type: "achievement" },
  { id: "d2d", time: "29 янв, день", text: "Интерактивная Летопись: Game Master ведёт ритуал закрытия дня.", type: "achievement" },
  { id: "d2e", time: "29 янв, день", text: "Zen Mode: фокус на одном квесте, минимум отвлечений.", type: "achievement" },
  { id: "d2f", time: "29 янв, день", text: "Мана чек-ин: ежедневная проверка энергии 1-5, влияет на нагрузку.", type: "xp" },
  { id: "d2g", time: "29 янв, день", text: "Голосовой Поток: наговариваешь → AI структурирует → в лог.", type: "xp" },
  { id: "d2h", time: "29 янв, утро", text: "День 2 начинается. Архитектор прокачивает систему.", type: "story" },
  { id: "d1a", time: "28 янв, вечер", text: "Frogface.space построен с нуля. Дашборд, агенты, командный центр — всё живое.", type: "achievement" },
  { id: "d1b", time: "28 янв, вечер", text: "OpenClaw код интегрирован — готов к подключению VPS.", type: "achievement" },
  { id: "d1c", time: "28 янв, день", text: "8 AI-агентов получили персональные промпты с полным контекстом Архитектора.", type: "xp" },
  { id: "d1d", time: "28 янв, день", text: "PWA установка готова. Frogface.space теперь нативное приложение.", type: "achievement" },
  { id: "d1e", time: "28 янв, день", text: "OpenRouter интеграция: живые AI-ответы вместо заглушек.", type: "achievement" },
  { id: "d1f", time: "28 янв, утро", text: "Глава 1 начинается. Архитектор входит в командный центр.", type: "story" },
];

const MANA_LABELS = ["", "Пустой", "Тяжело", "Норм", "Хорошо", "Огонь"];
const MANA_COLORS = ["", "text-hp", "text-hp", "text-gold", "text-xp", "text-xp"];

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 6) return "night";
  if (h < 12) return "morning";
  if (h < 18) return "day";
  return "evening";
}

function getGreeting() {
  const tod = getTimeOfDay();
  if (tod === "morning") return "Доброе утро, Архитектор";
  if (tod === "day") return "Добрый день, Архитектор";
  if (tod === "evening") return "Добрый вечер, Архитектор";
  return "Ночная смена, Архитектор";
}

export default function HQPage() {
  const [quests, setQuests] = usePersistedState("ff_hq_quests", INITIAL_QUESTS);
  const [log, setLog] = usePersistedState("ff_hq_log", INITIAL_LOG);
  const [mana, setMana] = usePersistedState("ff_mana", 0);
  const [manaDate, setManaDate] = usePersistedState("ff_mana_date", "");
  const [zenMode, setZenMode] = usePersistedState("ff_zen", true);
  const [logInput, setLogInput] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const manaCheckedToday = manaDate === today;

  const activeQuests = quests.filter((q) => !q.done);
  const topQuest = activeQuests.sort((a, b) => {
    const p = { boss: 0, critical: 1, normal: 2 };
    return p[a.priority] - p[b.priority];
  })[0];
  const nextQuests = activeQuests.filter((q) => q.id !== topQuest?.id).slice(0, 2);

  const toggleQuest = (id: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const done = !q.done;
        if (done) {
          setLog((l) => [
            { id: Date.now().toString(), time: "сейчас", text: `Квест выполнен: ${q.title} (+${q.xp} XP)`, type: "xp" },
            ...l,
          ]);
        }
        return { ...q, done, progress: done ? 100 : q.progress };
      }),
    );
  };

  const checkMana = (val: number) => {
    setMana(val);
    setManaDate(today);
    setLog((prev) => [
      { id: Date.now().toString(), time: "сейчас", text: `Мана: ${val}/5 — ${MANA_LABELS[val]}`, type: "log" },
      ...prev,
    ]);
  };

  const addLogEntry = () => {
    if (!logInput.trim()) return;
    setLog((prev) => [
      { id: Date.now().toString(), time: "сейчас", text: logInput, type: "log" },
      ...prev,
    ]);
    setLogInput("");
  };

  const completedXp = quests.filter((q) => q.done).reduce((s, q) => s + q.xp, 0);

  // ─── ZEN MODE ─────────────────────────────────────────────
  if (zenMode) {
    return (
      <div className="animate-fade-in flex min-h-[80vh] flex-col items-center justify-center px-4">
        <p className="mb-1 text-sm text-text-dim">{getGreeting()}</p>

        {!manaCheckedToday ? (
          <ManaCheckIn onCheck={checkMana} />
        ) : (
          <>
            <div className="mb-6 flex items-center gap-2">
              <Zap className={cn("h-4 w-4", MANA_COLORS[mana])} />
              <span className={cn("text-sm font-medium", MANA_COLORS[mana])}>
                Мана {mana}/5 — {MANA_LABELS[mana]}
              </span>
            </div>

            {topQuest ? (
              <div className="w-full max-w-md">
                <p className="mb-2 text-center text-[10px] font-medium uppercase tracking-widest text-text-dim">
                  Сейчас
                </p>
                <div className="rounded-2xl border border-accent/30 bg-bg-card p-6 text-center">
                  <div className={cn(
                    "mx-auto mb-3 inline-flex rounded-full px-3 py-1 text-[10px] font-medium",
                    topQuest.priority === "boss" ? "bg-gold/20 text-gold" :
                    topQuest.priority === "critical" ? "bg-hp/20 text-hp" : "bg-mana/20 text-mana",
                  )}>
                    {topQuest.priority === "boss" ? "БОСС" : topQuest.priority === "critical" ? "КРИТ" : "обычный"}
                    {" · "}{topQuest.project}
                  </div>
                  <h2 className="text-lg font-bold text-text-bright">{topQuest.title}</h2>
                  <p className="mt-1 text-xs text-xp">+{topQuest.xp} XP</p>

                  {topQuest.progress > 0 && (
                    <div className="mx-auto mt-4 h-1.5 w-48 rounded-full bg-bg-deep">
                      <div
                        className="h-full rounded-full bg-accent transition-all"
                        style={{ width: `${topQuest.progress}%` }}
                      />
                    </div>
                  )}

                  <div className="mt-5 flex items-center justify-center gap-3">
                    <button
                      onClick={() => toggleQuest(topQuest.id)}
                      className="rounded-xl bg-xp/20 px-6 py-2.5 text-sm font-medium text-xp transition-colors hover:bg-xp/30"
                    >
                      <CheckCircle2 className="mr-1.5 inline h-4 w-4" />
                      Готово
                    </button>
                    <button
                      onClick={() => {
                        const idx = quests.findIndex((q) => q.id === topQuest.id);
                        if (idx >= 0) {
                          setQuests((prev) => {
                            const arr = [...prev];
                            arr.push(arr.splice(idx, 1)[0]);
                            return arr;
                          });
                        }
                      }}
                      className="rounded-xl bg-bg-deep px-4 py-2.5 text-sm text-text-dim transition-colors hover:bg-bg-hover hover:text-text"
                    >
                      <SkipForward className="mr-1 inline h-4 w-4" />
                      Потом
                    </button>
                  </div>
                </div>

                {nextQuests.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-center text-[10px] font-medium uppercase tracking-widest text-text-dim">Далее</p>
                    {nextQuests.map((q) => (
                      <div key={q.id} className="flex items-center gap-2 rounded-lg border border-border/30 bg-bg-deep/30 px-3 py-2">
                        <Circle className="h-3.5 w-3.5 shrink-0 text-text-dim/30" />
                        <span className="text-xs text-text-dim">{q.title}</span>
                        <span className="ml-auto text-[10px] text-text-dim/50">{q.project}</span>
                      </div>
                    ))}
                  </div>
                )}

                <VoiceStream
                  onResult={(text) => {
                    setLog((prev) => [
                      { id: Date.now().toString(), time: "сейчас", text, type: "voice" },
                      ...prev,
                    ]);
                  }}
                />
              </div>
            ) : (
              <div className="text-center">
                <Trophy className="mx-auto h-12 w-12 text-gold" />
                <p className="mt-3 text-lg font-bold text-text-bright">Все квесты выполнены!</p>
                <p className="text-sm text-text-dim">+{completedXp} XP за сегодня. Ты — легенда.</p>
              </div>
            )}
          </>
        )}

        <button
          onClick={() => setZenMode(false)}
          className="mt-8 flex items-center gap-1.5 text-[10px] text-text-dim/50 transition-colors hover:text-text-dim"
        >
          <Maximize2 className="h-3 w-3" />
          Полный дашборд
        </button>
      </div>
    );
  }

  // ─── FULL DASHBOARD ───────────────────────────────────────
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-bright">{getGreeting()}</h1>
          <p className="mt-1 text-sm text-text-dim">
            Глава 1 — &quot;Фундамент&quot; · Февраль 2026
          </p>
        </div>
        <button
          onClick={() => setZenMode(true)}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[10px] text-text-dim transition-colors hover:border-accent/50 hover:text-accent"
        >
          <Minimize2 className="h-3 w-3" />
          Zen
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-gold" />}
          label="Золото (MRR)"
          value="178K ₽"
          delta="+12% за месяц"
          accent="border-gold/30"
        />
        <div
          className="cursor-pointer rounded-xl border border-mana/30 bg-bg-card p-4 transition-colors hover:border-mana/50"
          onClick={() => { setManaDate(""); }}
        >
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-mana" />
            <span className="text-xs text-text-dim">Мана</span>
          </div>
          <p className="mt-2 text-xl font-bold text-text-bright">
            {manaCheckedToday ? `${mana}/5` : "—"}
          </p>
          <p className="mt-1 text-[10px] text-text-dim">
            {manaCheckedToday ? MANA_LABELS[mana] : "Нажми для чек-ина"}
          </p>
        </div>
        <StatCard
          icon={<Flame className="h-5 w-5 text-xp" />}
          label="XP сегодня"
          value={`+${completedXp}`}
          delta={`${quests.filter((q) => q.done).length} завершено`}
          accent="border-xp/30"
        />
        <StatCard
          icon={<Target className="h-5 w-5 text-accent" />}
          label="Активные"
          value={String(activeQuests.length)}
          delta={`из ${quests.length} квестов`}
          accent="border-accent/30"
        />
      </div>

      <VoiceStream
        onResult={(text) => {
          setLog((prev) => [
            { id: Date.now().toString(), time: "сейчас", text, type: "voice" },
            ...prev,
          ]);
        }}
      />

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="lg:col-span-2 rounded-xl border border-border bg-bg-card p-4 lg:p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-bright">
            <Target className="h-4 w-4 text-accent" />
            Активные квесты
          </h2>
          <div className="space-y-3">
            {quests.map((q) => (
              <QuestRow key={q.id} quest={q} onToggle={toggleQuest} />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-bg-card p-4 lg:p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-bright">
            <Trophy className="h-4 w-4 text-gold" />
            Летопись
          </h2>

          <div className="mb-3 flex gap-2">
            <input
              type="text"
              value={logInput}
              onChange={(e) => setLogInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addLogEntry()}
              placeholder="Записать в лог..."
              className="flex-1 rounded-lg border border-border bg-bg-deep px-3 py-1.5 text-xs text-text placeholder:text-text-dim/40 focus:border-accent/50 focus:outline-none"
            />
            <button
              onClick={addLogEntry}
              disabled={!logInput.trim()}
              className="rounded-lg bg-accent/20 px-2 text-accent transition-colors hover:bg-accent/30 disabled:opacity-30"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
            {log.map((entry) => (
              <LogEntry key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-bg-card p-4 lg:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-text-bright">
              <Clock className="h-4 w-4 text-mana" />
              Глава 1: Фундамент
            </h2>
            <p className="mt-1 text-xs text-text-dim">
              30-дневный спринт · Построить базу, запустить продукты, достичь 500K Gold
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-2xl font-bold text-accent">День 2</p>
            <p className="text-[10px] text-text-dim">осталось 28 дней</p>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-bg-deep">
          <div className="h-full w-[7%] rounded-full bg-gradient-to-r from-accent to-mana" />
        </div>
      </div>

      <SystemStatus />
    </div>
  );
}

// ─── MANA CHECK-IN ────────────────────────────────────────
function ManaCheckIn({ onCheck }: { onCheck: (val: number) => void }) {
  return (
    <div className="my-8 text-center">
      <Zap className="mx-auto mb-3 h-8 w-8 text-mana" />
      <p className="mb-1 text-sm font-medium text-text-bright">Как энергия сейчас?</p>
      <p className="mb-5 text-xs text-text-dim">Нажми — и система подстроит нагрузку</p>
      <div className="flex items-center justify-center gap-3">
        {[1, 2, 3, 4, 5].map((val) => (
          <button
            key={val}
            onClick={() => onCheck(val)}
            className={cn(
              "flex h-14 w-14 flex-col items-center justify-center rounded-xl border transition-all hover:scale-105",
              val <= 2
                ? "border-hp/30 hover:border-hp/60 hover:bg-hp/10"
                : val <= 3
                ? "border-gold/30 hover:border-gold/60 hover:bg-gold/10"
                : "border-xp/30 hover:border-xp/60 hover:bg-xp/10",
            )}
          >
            <span className="text-lg font-bold text-text-bright">{val}</span>
            <span className="text-[8px] text-text-dim">{MANA_LABELS[val]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── VOICE STREAM ─────────────────────────────────────────
function VoiceStream({ onResult }: { onResult: (text: string) => void }) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const hasSpeechApi = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startRecording = useCallback(() => {
    if (!hasSpeechApi) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = "ru-RU";
    recognition.interimResults = true;
    recognition.continuous = true;

    let fullText = "";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          fullText += t + " ";
        } else {
          interim = t;
        }
      }
      setTranscript(fullText + interim);
    };

    recognition.onerror = () => setRecording(false);
    recognition.onend = () => {
      setRecording(false);
      if (fullText.trim()) {
        setProcessing(true);
        processVoiceStream(fullText.trim()).then((result) => {
          onResult(result || fullText.trim());
          setProcessing(false);
          setTranscript("");
        });
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setRecording(true);
    setTranscript("");
  }, [hasSpeechApi, onResult]);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  if (!hasSpeechApi) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      {transcript && (
        <div className="w-full max-w-md rounded-lg border border-border/30 bg-bg-deep/30 px-4 py-2">
          <p className="text-xs text-text-dim/70">{transcript}</p>
        </div>
      )}
      <button
        onClick={recording ? stopRecording : startRecording}
        disabled={processing}
        className={cn(
          "flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all",
          recording
            ? "bg-hp/20 text-hp animate-pulse"
            : processing
            ? "bg-bg-deep text-text-dim"
            : "bg-accent/10 text-accent hover:bg-accent/20",
        )}
      >
        {processing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Обрабатываю...
          </>
        ) : recording ? (
          <>
            <MicOff className="h-4 w-4" />
            Остановить
          </>
        ) : (
          <>
            <Mic className="h-4 w-4" />
            Поток
          </>
        )}
      </button>
    </div>
  );
}

async function processVoiceStream(text: string): Promise<string> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "Claude Haiku",
        messages: [
          {
            role: "system",
            content:
              "Ты — Moltbot, ассистент Архитектора. Тебе приходит голосовой поток (транскрипция). Кратко структурируй: выдели задачи (если есть), идеи, решения. Формат: одно-два предложения итога. Если это просто мысль — перефразируй кратко. Русский язык.",
          },
          { role: "user", content: `Голосовой поток: "${text}"` },
        ],
      }),
    });
    if (!res.ok) return text;
    return await res.text() || text;
  } catch {
    return text;
  }
}

// ─── SHARED COMPONENTS ──────────────────────────────────────

function StatCard({
  icon, label, value, delta, accent,
}: {
  icon: React.ReactNode; label: string; value: string; delta: string; accent: string;
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

function QuestRow({ quest, onToggle }: { quest: Quest; onToggle: (id: string) => void }) {
  const priorityColors = {
    normal: "bg-mana/20 text-mana",
    critical: "bg-hp/20 text-hp",
    boss: "bg-gold/20 text-gold",
  };
  const priorityLabels = { normal: "обычный", critical: "крит", boss: "БОСС" };

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border/50 bg-bg-deep/50 px-3 py-2.5 lg:gap-3 lg:px-4 lg:py-3 transition-all",
        quest.done && "opacity-50",
      )}
    >
      <button onClick={() => onToggle(quest.id)} className="shrink-0">
        {quest.done ? (
          <CheckCircle2 className="h-5 w-5 text-xp" />
        ) : (
          <Circle className="h-5 w-5 text-text-dim/40 transition-colors hover:text-accent" />
        )}
      </button>
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-1.5 lg:gap-2">
          <span className={cn("text-xs lg:text-sm text-text-bright", quest.done && "line-through")}>
            {quest.title}
          </span>
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${priorityColors[quest.priority]}`}>
            {priorityLabels[quest.priority]}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 lg:mt-1.5 lg:gap-3">
          <span className="text-[10px] text-text-dim">{quest.project}</span>
          <span className="text-[10px] text-xp">+{quest.xp} XP</span>
          <div className="hidden h-1 w-24 rounded-full bg-border sm:block">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${quest.progress}%` }} />
          </div>
          <span className="hidden text-[10px] text-text-dim sm:inline">{quest.progress}%</span>
        </div>
      </div>
    </div>
  );
}

function LogEntry({ entry }: { entry: LogItem }) {
  const colors: Record<string, string> = {
    story: "border-l-accent",
    achievement: "border-l-xp",
    gold: "border-l-gold",
    xp: "border-l-mana",
    log: "border-l-text-dim",
    voice: "border-l-accent",
  };
  const icons: Record<string, string> = {
    story: "📖",
    achievement: "🏆",
    gold: "💰",
    xp: "✨",
    log: "📝",
    voice: "🎤",
  };

  return (
    <div className={`border-l-2 ${colors[entry.type]} pl-3`}>
      <p className="text-xs text-text">
        <span className="mr-1">{icons[entry.type]}</span>
        {entry.text}
      </p>
      <p className="mt-0.5 text-[10px] text-text-dim">{entry.time}</p>
    </div>
  );
}

function SystemStatus() {
  const [status, setStatus] = useState<{
    ai: boolean; openclaw: boolean; mode: string; pwa: boolean;
  }>({ ai: false, openclaw: false, mode: "...", pwa: false });

  useEffect(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((d) =>
        setStatus((s) => ({
          ...s,
          ai: d.hasKey || d.openclaw,
          openclaw: !!d.openclaw,
          mode: d.mode === "openclaw" ? "OpenClaw VPS" : d.hasKey ? "OpenRouter" : "offline",
        })),
      )
      .catch(() => {});
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        setStatus((s) => ({ ...s, pwa: !!reg }));
      });
    }
  }, []);

  const items = [
    { label: status.mode, ok: status.ai, icon: Bot },
    { label: "OpenClaw RAG", ok: status.openclaw, icon: Database },
    { label: "PWA", ok: status.pwa, icon: Smartphone },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/50 bg-bg-card/50 px-4 py-2.5">
      <span className="text-[10px] font-medium text-text-dim">Системы:</span>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <item.icon className={cn("h-3 w-3", item.ok ? "text-xp" : "text-text-dim/30")} />
          <span className={cn("text-[10px]", item.ok ? "text-text" : "text-text-dim/40")}>{item.label}</span>
          <div className={cn("h-1.5 w-1.5 rounded-full", item.ok ? "bg-xp" : "bg-text-dim/20")} />
        </div>
      ))}
    </div>
  );
}
