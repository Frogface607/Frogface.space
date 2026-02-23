"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  Sparkles,
  Volume2,
  VolumeX,
  Loader2,
  Zap,
  Target,
  TrendingUp,
  Flame,
  ListTodo,
  CheckCircle2,
  Circle,
  Crown,
  ChevronDown,
  ChevronUp,
  Radio,
  SkipForward,
  Copy,
  X,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatHistory, type ChatMsg } from "@/lib/use-chat-history";
import { usePersistedState } from "@/lib/use-persisted-state";
import { speak, stopSpeaking, preloadVoices } from "@/lib/tts";
import { parseActions, executeActions, listActiveQuests } from "@/lib/quest-store";

function now() {
  return new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

const MANA_LABELS = ["", "Пустой", "Тяжело", "Норм", "Хорошо", "Огонь"];
const MANA_COLORS = ["", "text-hp", "text-hp", "text-gold", "text-xp", "text-xp"];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return "Ночная смена";
  if (h < 12) return "Доброе утро";
  if (h < 18) return "Добрый день";
  return "Добрый вечер";
}

const INITIAL_MESSAGES: ChatMsg[] = [
  {
    id: "greeting",
    role: "assistant",
    text: `${getGreeting()}, Архитектор. Moltbot на связи. Все системы активны.\n\nЧто делаем?`,
    time: now(),
  },
];

const SYSTEM_PROMPT = [
  "Ты — Moltbot, операционный директор Frogface Studio.",
  "Координируешь 8 агентов, управляешь приоритетами.",
  "",
  "Архитектор — Сергей. Креативный директор. Ценности: свобода + комфорт. Сейчас в Таиланде.",
  "Workflow: гулять → наговаривать потоки → структурировать → задачи агентам.",
  "",
  "Проекты:",
  "- MyReply: AI-ответы на отзывы, MRR 178K₽→500K, soft launch. Чек 490₽/мес.",
  "- Edison Bar: ресторан Иркутск, автономия. Сайт почти готов.",
  "- «Идущий к руке»: YouTube, съёмки ср-чт-пт.",
  "- Frogface.space: этот дашборд, PWA, RPG-система.",
  "",
  "Глава 1: Фундамент, 30-дневный спринт.",
  "Стиль: дружелюбный, лаконичный, с RPG-нарративом. Русский.",
  "",
  "ВАЖНО: Если голосовой режим — отвечай коротко, 2-4 предложения.",
  "",
  "=== КОМАНДЫ ===",
  "Создать квест: [QUEST:CREATE|название|проект|приоритет|xp]",
  "Завершить: [QUEST:COMPLETE|часть названия]",
  "Список: [QUEST:LIST]",
  "Задача для Cursor: [TASK:CREATE|название|описание|проект|приоритет|cursor]",
  "",
  "=== RPG ===",
  "XP, уровни, ачивки — всё живое, хранится на сервере.",
  "При завершении квеста начисляется XP и может быть level up.",
].join("\n");

export default function HQPage() {
  const [messages, setMessages, clearChat] = useChatHistory("hq", INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [recording, setRecording] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [mana, setMana] = usePersistedState("ff_mana", 0);
  const [manaDate, setManaDate] = usePersistedState("ff_mana_date", "");
  const [showPanel, setShowPanel] = useState(true);
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const manaCheckedToday = manaDate === today;

  const hasSpeechApi =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => { preloadVoices(); }, []);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    fetch("/api/report").then((r) => r.json()).then(setReport).catch(() => {});
  }, []);

  const speakText = useCallback((text: string) => {
    if (!autoSpeak || !voiceMode) return;
    setSpeaking(true);
    speak(text, () => setSpeaking(false));
  }, [autoSpeak, voiceMode]);

  const checkMana = (val: number) => {
    setMana(val);
    setManaDate(today);
  };

  const sendMessage = useCallback(async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isTyping) return;

    const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", text: msg, time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const botMsgId = (Date.now() + 1).toString();

    try {
      const history = messages
        .filter((m) => m.role !== "system")
        .slice(-20)
        .map((m) => ({
          role: m.role === "user" ? "user" as const : "assistant" as const,
          content: m.text,
        }));
      history.push({ role: "user", content: msg });

      const activeQuests = listActiveQuests();
      const questCtx = activeQuests.length > 0
        ? "\n\nАктивные квесты:\n" + activeQuests.map((q, i) => `${i + 1}. [${q.priority}] ${q.title} (+${q.xp} XP)`).join("\n")
        : "";

      const systemContent = voiceMode
        ? SYSTEM_PROMPT + questCtx + "\n\n[Голосовой режим. Коротко, без маркдаун.]"
        : SYSTEM_PROMPT + questCtx;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "system", content: systemContent }, ...history],
          model: "Claude Sonnet 4",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error([err.error, err.details].filter(Boolean).join(" | "));
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";

      setMessages((prev) => [...prev, { id: botMsgId, role: "assistant", text: "", time: now() }]);
      setIsTyping(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        const snapshot = full;
        setMessages((prev) => prev.map((m) => (m.id === botMsgId ? { ...m, text: snapshot } : m)));
      }

      const actions = parseActions(full);
      if (actions.length > 0) {
        const results = await executeActions(actions);
        const cleaned = full.replace(/\[QUEST:.*?\]/g, "").replace(/\[TASK:CREATE\|.*?\]/g, "").trim();
        const final = cleaned + (results.length ? "\n\n" + results.join("\n") : "");
        setMessages((prev) => prev.map((m) => (m.id === botMsgId ? { ...m, text: final } : m)));
        if (final) speakText(cleaned);
      } else {
        if (full) speakText(full);
      }
    } catch (err) {
      const errorText = err instanceof Error ? err.message : "Ошибка";
      setMessages((prev) => [
        ...prev,
        { id: botMsgId, role: "assistant", text: `⚠️ ${errorText}`, time: now() },
      ]);
      setIsTyping(false);
    }
  }, [input, isTyping, messages, setMessages, voiceMode, speakText]);

  const toggleRecording = useCallback(() => {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }
    if (!hasSpeechApi) return;
    stopSpeaking(); setSpeaking(false);

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = "ru-RU";
    recognition.interimResults = true;
    recognition.continuous = true;
    let fullText = "";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let current = "";
      for (let i = 0; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) fullText += t + " ";
        else current = t;
      }
      setInput(fullText + current);
    };
    recognition.onend = () => {
      setRecording(false);
      if (fullText.trim()) { setInput(""); sendMessage(fullText.trim()); }
    };
    recognition.onerror = () => setRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setRecording(true);
  }, [recording, hasSpeechApi, sendMessage]);

  const rp = report as { player?: { level?: number; xp?: number; gold?: number; mana?: number }; quests?: { active?: number }; content?: { pending_review?: number }; cursor_tasks?: { pending?: number } } | null;

  return (
    <div className="animate-fade-in flex h-[calc(100vh-5rem)] flex-col lg:h-[calc(100vh-3rem)]">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border bg-bg-card px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", voiceMode ? "bg-xp/20" : "bg-accent/20")}>
            {voiceMode ? <Radio className="h-4 w-4 text-xp" /> : <Bot className="h-4 w-4 text-accent" />}
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text-bright">
              {getGreeting()}, Архитектор
            </h1>
            <div className="flex items-center gap-3 text-[10px] text-text-dim">
              <span className="text-xp">● Moltbot</span>
              {rp?.player && <span>Ур.{rp.player.level}</span>}
              {rp?.player && <span className="text-gold">{rp.player.gold}K₽</span>}
              {rp?.quests && <span>{rp.quests.active} квестов</span>}
              {rp?.content?.pending_review ? <span className="text-gold">{rp.content.pending_review} постов на проверку</span> : null}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {!manaCheckedToday && (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((v) => (
                <button key={v} onClick={() => checkMana(v)} className={cn("h-6 w-6 rounded text-[10px] font-bold transition-all hover:scale-110", v <= 2 ? "text-hp hover:bg-hp/10" : v <= 3 ? "text-gold hover:bg-gold/10" : "text-xp hover:bg-xp/10")}>{v}</button>
              ))}
            </div>
          )}
          {manaCheckedToday && <span className={cn("text-xs font-medium", MANA_COLORS[mana])}>⚡{mana}/5</span>}
          {voiceMode && (
            <button onClick={() => setAutoSpeak((v) => !v)} className={cn("rounded p-1", autoSpeak ? "text-xp" : "text-text-dim/40")} title="TTS">
              {autoSpeak ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            </button>
          )}
          <button onClick={() => setVoiceMode(!voiceMode)} className={cn("rounded-lg px-2 py-1 text-[10px] font-medium", voiceMode ? "bg-xp/20 text-xp" : "text-text-dim hover:text-accent")}>
            {voiceMode ? "🎙 Голос" : "Голос"}
          </button>
          <button onClick={() => setShowPanel(!showPanel)} className="rounded p-1 text-text-dim hover:text-text lg:hidden">
            {showPanel ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat */}
        <div className="flex flex-1 flex-col">
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-bg-deep/30 p-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} onSpeak={voiceMode ? (t) => { stopSpeaking(); speakText(t); } : undefined} />
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-sm text-text-dim">
                <Bot className="h-4 w-4 animate-pulse text-accent" />
                <span className="animate-pulse">Moltbot думает...</span>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border bg-bg-card p-3">
            {voiceMode && speaking && (
              <div className="mb-2 flex items-center justify-center gap-2 text-xs text-xp">
                <Volume2 className="h-3 w-3 animate-pulse" /> Moltbot говорит...
                <button onClick={() => { stopSpeaking(); setSpeaking(false); }} className="text-text-dim hover:text-text">стоп</button>
              </div>
            )}
            <div className="flex items-center gap-2">
              {hasSpeechApi && (
                <button onClick={toggleRecording} className={cn("rounded-lg p-2.5 transition-colors", recording ? "bg-hp/20 text-hp animate-pulse" : "text-text-dim hover:bg-bg-hover hover:text-accent")}>
                  {recording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
              )}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={recording ? "Говори..." : "Написать Moltbot..."}
                className="flex-1 rounded-lg border border-border bg-bg-deep px-4 py-2.5 text-sm text-text placeholder:text-text-dim/40 focus:border-accent/50 focus:outline-none"
              />
              <button onClick={() => sendMessage()} disabled={!input.trim() || isTyping} className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-dim disabled:opacity-30">
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["/status", "/quests", "/report", "/tasks", "генерируй контент"].map((cmd) => (
                <button key={cmd} onClick={() => setInput(cmd)} className="rounded-md border border-border px-2 py-1 text-[10px] text-text-dim hover:border-accent/50 hover:text-accent">{cmd}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Side panel — stats & quick actions */}
        <div className={cn("w-72 shrink-0 overflow-y-auto border-l border-border bg-bg-card p-4 space-y-4", showPanel ? "block" : "hidden lg:block")}>
          {/* Player stats */}
          {rp?.player && (
            <div className="space-y-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-text-dim">Игрок</p>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-mana">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-bright">Ур. {rp.player.level}</p>
                  <p className="text-[10px] text-text-dim">{rp.player.xp} XP</p>
                </div>
              </div>
              <MiniBar label="Gold" value={rp.player.gold || 0} max={500} color="bg-gold" />
              <MiniBar label="Mana" value={manaCheckedToday ? mana : (rp.player.mana || 0)} max={100} color="bg-mana" />
            </div>
          )}

          {/* Quick actions */}
          <div className="space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-text-dim">Быстрые действия</p>
            <QuickBtn icon={<Sparkles className="h-3.5 w-3.5" />} label="Контент-конвейер" href="/pipeline" count={rp?.content?.pending_review} color="text-gold" />
            <QuickBtn icon={<ListTodo className="h-3.5 w-3.5" />} label="Задачи Cursor" href="/tasks" count={rp?.cursor_tasks?.pending} color="text-accent" />
            <QuickBtn icon={<Target className="h-3.5 w-3.5" />} label="Квесты" href="/quests" count={rp?.quests?.active} color="text-xp" />
            <QuickBtn icon={<TrendingUp className="h-3.5 w-3.5" />} label="Игрок" href="/player" color="text-mana" />
          </div>

          {/* Active quests mini */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-text-dim">Топ квесты</p>
            <QuestsMini />
          </div>

          {/* System status */}
          <SystemMini />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, onSpeak }: { message: ChatMsg; onSpeak?: (text: string) => void }) {
  const [copied, setCopied] = useState(false);
  if (message.role === "system") {
    return (
      <div className="flex justify-center">
        <span className="rounded-full bg-accent/10 px-4 py-1.5 text-[10px] text-accent">{message.text}</span>
      </div>
    );
  }
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", isUser ? "bg-mana/20" : "bg-accent/20")}>
        {isUser ? <User className="h-3.5 w-3.5 text-mana" /> : <Sparkles className="h-3.5 w-3.5 text-accent" />}
      </div>
      <div className={cn("group max-w-[80%] rounded-xl px-3.5 py-2.5", isUser ? "bg-mana/10 text-text" : "border border-border/50 bg-bg-card text-text")}>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>
        <div className="mt-1 flex items-center gap-2">
          {message.time && <p className="text-[10px] text-text-dim">{message.time}</p>}
          {!isUser && message.text && (
            <div className="invisible flex items-center gap-1 group-hover:visible">
              {onSpeak && (
                <button onClick={() => onSpeak(message.text)} className="text-text-dim/30 hover:text-accent"><Volume2 className="h-3 w-3" /></button>
              )}
              <button onClick={() => { navigator.clipboard.writeText(message.text); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="text-text-dim/30 hover:text-accent">
                {copied ? <Check className="h-3 w-3 text-xp" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-10 text-[10px] text-text-dim">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-bg-deep">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${Math.min((value / max) * 100, 100)}%` }} />
      </div>
      <span className="w-10 text-right text-[10px] text-text-dim">{value}</span>
    </div>
  );
}

function QuickBtn({ icon, label, href, count, color = "text-text-dim" }: { icon: React.ReactNode; label: string; href: string; count?: number; color?: string }) {
  return (
    <a href={href} className="flex items-center gap-2 rounded-lg border border-border/50 px-3 py-2 text-xs text-text-dim transition-colors hover:border-accent/30 hover:text-text">
      <span className={color}>{icon}</span>
      <span className="flex-1">{label}</span>
      {count !== undefined && count > 0 && (
        <span className={cn("rounded-full bg-bg-deep px-1.5 py-0.5 text-[10px] font-bold", color)}>{count}</span>
      )}
    </a>
  );
}

function QuestsMini() {
  const [quests, setQuests] = useState<{ title: string; priority: string; xp: number }[]>([]);
  useEffect(() => {
    try {
      const active = listActiveQuests();
      setQuests(active.slice(0, 4).map((q) => ({ title: q.title, priority: q.priority, xp: q.xp })));
    } catch {}
  }, []);

  if (quests.length === 0) return <p className="text-[10px] text-text-dim/50">Нет квестов</p>;

  return (
    <div className="space-y-1">
      {quests.map((q, i) => (
        <div key={i} className="flex items-center gap-1.5 rounded px-2 py-1 text-[10px]">
          <span className={cn("font-bold", q.priority === "boss" ? "text-gold" : q.priority === "critical" ? "text-hp" : "text-text-dim")}>
            {q.priority === "boss" ? "👑" : q.priority === "critical" ? "🔥" : "○"}
          </span>
          <span className="flex-1 truncate text-text-dim">{q.title}</span>
          <span className="text-xp/50">+{q.xp}</span>
        </div>
      ))}
    </div>
  );
}

function SystemMini() {
  const [status, setStatus] = useState<{ mode?: string; openclaw?: boolean }>({});
  useEffect(() => {
    fetch("/api/chat").then((r) => r.json()).then(setStatus).catch(() => {});
  }, []);

  return (
    <div className="space-y-1">
      <p className="text-[10px] font-medium uppercase tracking-wider text-text-dim">Система</p>
      <div className="flex items-center gap-1.5">
        <div className={cn("h-1.5 w-1.5 rounded-full", status.openclaw ? "bg-xp" : "bg-text-dim/20")} />
        <span className="text-[10px] text-text-dim">{status.mode === "openclaw" ? "OpenClaw VPS" : status.mode || "..."}</span>
      </div>
    </div>
  );
}
