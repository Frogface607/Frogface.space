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
  ListTodo,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Phone,
  PhoneOff,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatHistory, type ChatMsg } from "@/lib/use-chat-history";
import { usePersistedState } from "@/lib/use-persisted-state";
import { speak, stopSpeaking, preloadVoices, isSpeaking } from "@/lib/tts";
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
    text: `${getGreeting()}, Архитектор. Moltbot на связи.\n\nГоворите голосом или пишите — я слушаю.`,
    time: now(),
  },
];

const SYSTEM_PROMPT = [
  "Ты — Moltbot, операционный директор Frogface Studio.",
  "Архитектор — Сергей. Креативный директор. Ценности: свобода + комфорт. Таиланд.",
  "Проекты: MyReply (AI-ответы на отзывы, MRR 178K₽→500K), Edison Bar (ресторан Иркутск), «Идущий к руке» (YouTube), Frogface.space.",
  "Глава 1: Фундамент, 30-дневный спринт.",
  "Стиль: дружелюбный, лаконичный, RPG-нарратив. Русский.",
  "",
  "КОМАНДЫ:",
  "[QUEST:CREATE|название|проект|приоритет|xp]",
  "[QUEST:COMPLETE|часть названия]",
  "[QUEST:LIST]",
  "[TASK:CREATE|название|описание|проект|приоритет|cursor]",
].join("\n");

type ConvoState = "idle" | "listening" | "processing" | "speaking";

export default function HQPage() {
  const [messages, setMessages, clearChat] = useChatHistory("hq", INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [convoMode, setConvoMode] = usePersistedState("ff_convo_mode", false);
  const [convoState, setConvoState] = useState<ConvoState>("idle");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [mana, setMana] = usePersistedState("ff_mana", 0);
  const [manaDate, setManaDate] = usePersistedState("ff_mana_date", "");
  const [showPanel, setShowPanel] = useState(false);
  const [report, setReport] = useState<Record<string, unknown> | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const convoModeRef = useRef(convoMode);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);

  const today = new Date().toISOString().split("T")[0];
  const manaCheckedToday = manaDate === today;

  const hasSpeechApi =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => { preloadVoices(); }, []);
  useEffect(() => { convoModeRef.current = convoMode; }, [convoMode]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, liveTranscript]);
  useEffect(() => {
    fetch("/api/report").then((r) => r.json()).then(setReport).catch(() => {});
  }, []);

  const startAudioAnalyser = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(Math.min(avg / 128, 1));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch { /* mic denied */ }
  }, []);

  const stopAudioAnalyser = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();
    setAudioLevel(0);
  }, []);

  const sendMessage = useCallback(async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isTyping) return;

    const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", text: msg, time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLiveTranscript("");
    setIsTyping(true);
    setConvoState("processing");

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

      const voiceSuffix = convoModeRef.current
        ? "\n\n[ГОЛОСОВОЙ РЕЖИМ. Отвечай коротко 2-4 предложения. Без маркдаун, без списков. Говори как друг.]"
        : "";

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "system", content: SYSTEM_PROMPT + questCtx + voiceSuffix }, ...history],
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
      let finalText = full;
      if (actions.length > 0) {
        const results = await executeActions(actions);
        const cleaned = full.replace(/\[QUEST:.*?\]/g, "").replace(/\[TASK:CREATE\|.*?\]/g, "").trim();
        finalText = cleaned + (results.length ? "\n\n" + results.join("\n") : "");
        setMessages((prev) => prev.map((m) => (m.id === botMsgId ? { ...m, text: finalText } : m)));
      }

      if (convoModeRef.current && finalText) {
        setConvoState("speaking");
        speak(finalText.replace(/\[.*?\]/g, ""), () => {
          setConvoState("idle");
          if (convoModeRef.current) {
            setTimeout(() => startListening(), 300);
          }
        });
      } else {
        setConvoState("idle");
      }
    } catch (err) {
      const errorText = err instanceof Error ? err.message : "Ошибка";
      setMessages((prev) => [
        ...prev,
        { id: botMsgId, role: "assistant", text: `⚠️ ${errorText}`, time: now() },
      ]);
      setIsTyping(false);
      setConvoState("idle");
    }
  }, [input, isTyping, messages, setMessages]);

  const startListening = useCallback(() => {
    if (!hasSpeechApi) return;
    stopSpeaking();

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = "ru-RU";
    recognition.interimResults = true;
    recognition.continuous = true;
    let fullText = "";
    let lastResultTime = Date.now();

    setConvoState("listening");
    setLiveTranscript("");
    startAudioAnalyser();

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let current = "";
      fullText = "";
      for (let i = 0; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) fullText += t + " ";
        else current = t;
      }
      setLiveTranscript(fullText + current);
      lastResultTime = Date.now();

      clearTimeout(silenceTimerRef.current);
      if (fullText.trim()) {
        silenceTimerRef.current = setTimeout(() => {
          if (Date.now() - lastResultTime >= 1500 && fullText.trim()) {
            recognition.stop();
          }
        }, 1800);
      }
    };

    recognition.onend = () => {
      stopAudioAnalyser();
      clearTimeout(silenceTimerRef.current);
      if (fullText.trim()) {
        setLiveTranscript("");
        sendMessage(fullText.trim());
      } else {
        setConvoState("idle");
      }
    };

    recognition.onerror = () => {
      stopAudioAnalyser();
      setConvoState("idle");
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [hasSpeechApi, sendMessage, startAudioAnalyser, stopAudioAnalyser]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    clearTimeout(silenceTimerRef.current);
    stopAudioAnalyser();
  }, [stopAudioAnalyser]);

  const toggleConvoMode = useCallback(() => {
    if (convoMode) {
      setConvoMode(false);
      stopListening();
      stopSpeaking();
      setConvoState("idle");
    } else {
      setConvoMode(true);
      startListening();
    }
  }, [convoMode, setConvoMode, startListening, stopListening]);

  const handleMicTap = useCallback(() => {
    if (convoState === "listening") {
      stopListening();
    } else if (convoState === "speaking") {
      stopSpeaking();
      setConvoState("idle");
      if (convoMode) setTimeout(() => startListening(), 300);
    } else {
      startListening();
    }
  }, [convoState, convoMode, startListening, stopListening]);

  const rp = report as { player?: { level?: number; xp?: number; gold?: number; mana?: number }; quests?: { active?: number }; content?: { pending_review?: number }; cursor_tasks?: { pending?: number } } | null;

  return (
    <div className="animate-fade-in flex h-[calc(100vh-5rem)] flex-col lg:h-[calc(100vh-3rem)]">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border bg-bg-card px-4 py-2">
        <div className="flex items-center gap-2.5">
          <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", convoMode ? "bg-xp/20" : "bg-accent/20")}>
            {convoMode ? <Radio className="h-3.5 w-3.5 text-xp" /> : <Bot className="h-3.5 w-3.5 text-accent" />}
          </div>
          <div>
            <h1 className="text-xs font-semibold text-text-bright">{getGreeting()}, Архитектор</h1>
            <div className="flex items-center gap-2 text-[10px] text-text-dim">
              {rp?.player && <span>Ур.{rp.player.level}</span>}
              {rp?.player && <span className="text-gold">{rp.player.gold}K₽</span>}
              {manaCheckedToday && <span className={MANA_COLORS[mana]}>⚡{mana}</span>}
              {rp?.quests?.active ? <span>{rp.quests.active} квестов</span> : null}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {!manaCheckedToday && (
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] text-text-dim mr-1">Мана:</span>
              {[1, 2, 3, 4, 5].map((v) => (
                <button key={v} onClick={() => { setMana(v); setManaDate(today); }}
                  className={cn("h-6 w-6 rounded text-[10px] font-bold hover:scale-110", v <= 2 ? "text-hp hover:bg-hp/10" : v <= 3 ? "text-gold hover:bg-gold/10" : "text-xp hover:bg-xp/10")}>{v}</button>
              ))}
            </div>
          )}
          <button onClick={() => setShowPanel(!showPanel)} className="rounded p-1 text-text-dim hover:text-text lg:hidden">
            {showPanel ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main chat area */}
        <div className="flex flex-1 flex-col">
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-bg-deep/30 p-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {liveTranscript && (
              <div className="flex gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-mana/20">
                  <User className="h-3.5 w-3.5 text-mana" />
                </div>
                <div className="max-w-[80%] rounded-xl bg-mana/5 border border-mana/20 px-3.5 py-2.5">
                  <p className="text-sm text-mana/80 italic">{liveTranscript}</p>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-mana animate-pulse" />
                    <span className="text-[10px] text-mana/50">слушаю...</span>
                  </div>
                </div>
              </div>
            )}
            {isTyping && (
              <div className="flex items-center gap-2 text-sm text-text-dim">
                <Bot className="h-4 w-4 animate-pulse text-accent" />
                <span className="animate-pulse">думает...</span>
              </div>
            )}
          </div>

          {/* Voice + Input area */}
          <div className="border-t border-border bg-bg-card">
            {/* Conversation mode big button area */}
            {convoMode && (
              <div className="flex flex-col items-center gap-3 px-4 py-5">
                {convoState === "speaking" && (
                  <div className="flex items-center gap-2 text-xs text-xp">
                    <Volume2 className="h-3.5 w-3.5 animate-pulse" />
                    Moltbot говорит...
                  </div>
                )}

                {/* Big mic button with audio level ring */}
                <div className="relative">
                  {/* Audio level ring */}
                  <div
                    className={cn(
                      "absolute inset-0 rounded-full transition-all duration-100",
                      convoState === "listening" && "bg-accent/10",
                      convoState === "speaking" && "bg-xp/10",
                      convoState === "processing" && "bg-gold/10",
                    )}
                    style={{
                      transform: `scale(${1 + audioLevel * 0.6})`,
                      opacity: convoState === "listening" ? 0.6 : 0,
                    }}
                  />
                  <button
                    onClick={handleMicTap}
                    disabled={convoState === "processing"}
                    className={cn(
                      "relative flex h-20 w-20 items-center justify-center rounded-full transition-all",
                      convoState === "listening" && "bg-accent/20 text-accent shadow-lg shadow-accent/20 scale-110",
                      convoState === "speaking" && "bg-xp/20 text-xp",
                      convoState === "processing" && "bg-gold/20 text-gold",
                      convoState === "idle" && "bg-bg-deep text-text-dim hover:bg-accent/10 hover:text-accent hover:scale-105",
                    )}
                  >
                    {convoState === "processing" ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : convoState === "listening" ? (
                      <Mic className="h-8 w-8" />
                    ) : convoState === "speaking" ? (
                      <Volume2 className="h-8 w-8" />
                    ) : (
                      <Mic className="h-8 w-8" />
                    )}
                  </button>
                </div>

                <p className="text-[10px] text-text-dim">
                  {convoState === "listening" ? "Говорите... пауза = отправка" :
                   convoState === "processing" ? "Обрабатываю..." :
                   convoState === "speaking" ? "Нажмите чтобы прервать" :
                   "Нажмите чтобы говорить"}
                </p>

                <button onClick={toggleConvoMode} className="flex items-center gap-1.5 rounded-lg bg-hp/10 px-3 py-1.5 text-xs text-hp hover:bg-hp/20">
                  <PhoneOff className="h-3 w-3" /> Завершить разговор
                </button>
              </div>
            )}

            {/* Text input + voice toggle */}
            <div className={cn("p-3", convoMode && "border-t border-border/50")}>
              <div className="flex items-center gap-2">
                {!convoMode && hasSpeechApi && (
                  <button
                    onClick={toggleConvoMode}
                    className="flex items-center gap-1.5 rounded-xl bg-accent/10 px-3 py-2.5 text-accent transition-all hover:bg-accent/20 hover:scale-105"
                    title="Голосовой режим"
                  >
                    <Phone className="h-5 w-5" />
                  </button>
                )}
                {!convoMode && hasSpeechApi && (
                  <button
                    onClick={() => { if (convoState !== "listening") startListening(); else stopListening(); }}
                    className={cn("rounded-xl p-2.5 transition-all", convoState === "listening" ? "bg-hp/20 text-hp animate-pulse" : "text-text-dim hover:bg-bg-hover hover:text-accent")}
                    title="Голосовой ввод"
                  >
                    {convoState === "listening" ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </button>
                )}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={convoMode ? "или напишите..." : "Написать Moltbot..."}
                  className="flex-1 rounded-xl border border-border bg-bg-deep px-4 py-2.5 text-sm text-text placeholder:text-text-dim/40 focus:border-accent/50 focus:outline-none"
                />
                <button onClick={() => sendMessage()} disabled={!input.trim() || isTyping} className="rounded-xl bg-accent px-4 py-2.5 text-white hover:bg-accent-dim disabled:opacity-30">
                  <Send className="h-4 w-4" />
                </button>
              </div>
              {!convoMode && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["/status", "/quests", "/report", "генерируй контент"].map((cmd) => (
                    <button key={cmd} onClick={() => setInput(cmd)} className="rounded-md border border-border px-2 py-1 text-[10px] text-text-dim hover:border-accent/50 hover:text-accent">{cmd}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className={cn("w-64 shrink-0 overflow-y-auto border-l border-border bg-bg-card p-3 space-y-4", showPanel ? "block" : "hidden lg:block")}>
          {rp?.player && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-mana">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-bright">Ур. {rp.player.level}</p>
                  <p className="text-[10px] text-text-dim">{rp.player.xp} XP</p>
                </div>
              </div>
              <MiniBar label="Gold" value={rp.player.gold || 0} max={500} color="bg-gold" />
              <MiniBar label="Mana" value={manaCheckedToday ? mana : (rp.player.mana || 0)} max={5} color="bg-mana" />
            </div>
          )}

          <div className="space-y-1.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-text-dim">Навигация</p>
            <QuickBtn icon={<Sparkles className="h-3 w-3" />} label="Конвейер" href="/pipeline" count={rp?.content?.pending_review} color="text-gold" />
            <QuickBtn icon={<ListTodo className="h-3 w-3" />} label="Задачи" href="/tasks" count={rp?.cursor_tasks?.pending} color="text-accent" />
            <QuickBtn icon={<Target className="h-3 w-3" />} label="Квесты" href="/quests" count={rp?.quests?.active} color="text-xp" />
            <QuickBtn icon={<TrendingUp className="h-3 w-3" />} label="Игрок" href="/player" color="text-mana" />
          </div>

          <QuestsMini />
          <SystemMini />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMsg }) {
  const [copied, setCopied] = useState(false);
  if (message.role === "system") {
    return (
      <div className="flex justify-center">
        <span className="rounded-full bg-accent/10 px-3 py-1 text-[10px] text-accent">{message.text}</span>
      </div>
    );
  }
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", isUser ? "bg-mana/20" : "bg-accent/20")}>
        {isUser ? <User className="h-3.5 w-3.5 text-mana" /> : <Sparkles className="h-3.5 w-3.5 text-accent" />}
      </div>
      <div className={cn("group max-w-[80%] rounded-xl px-3.5 py-2.5", isUser ? "bg-mana/10" : "border border-border/50 bg-bg-card")}>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">{message.text}</p>
        <div className="mt-1 flex items-center gap-2">
          {message.time && <p className="text-[10px] text-text-dim">{message.time}</p>}
          {!isUser && message.text && (
            <button
              onClick={() => { navigator.clipboard.writeText(message.text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="invisible text-text-dim/30 hover:text-accent group-hover:visible"
            >
              {copied ? <Check className="h-3 w-3 text-xp" /> : <Copy className="h-3 w-3" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 text-[10px] text-text-dim">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-bg-deep">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${Math.min((value / max) * 100, 100)}%` }} />
      </div>
      <span className="w-8 text-right text-[10px] text-text-dim">{value}</span>
    </div>
  );
}

function QuickBtn({ icon, label, href, count, color }: { icon: React.ReactNode; label: string; href: string; count?: number; color?: string }) {
  return (
    <a href={href} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-text-dim hover:bg-bg-hover hover:text-text">
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
      setQuests(listActiveQuests().slice(0, 3).map((q) => ({ title: q.title, priority: q.priority, xp: q.xp })));
    } catch {}
  }, []);
  if (quests.length === 0) return null;
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-medium uppercase tracking-wider text-text-dim">Квесты</p>
      {quests.map((q, i) => (
        <div key={i} className="flex items-center gap-1 px-1 text-[10px]">
          <span className={q.priority === "boss" ? "text-gold" : q.priority === "critical" ? "text-hp" : "text-text-dim/50"}>
            {q.priority === "boss" ? "👑" : q.priority === "critical" ? "🔥" : "·"}
          </span>
          <span className="flex-1 truncate text-text-dim">{q.title}</span>
        </div>
      ))}
    </div>
  );
}

function SystemMini() {
  const [st, setSt] = useState<{ mode?: string; openclaw?: boolean }>({});
  useEffect(() => { fetch("/api/chat").then((r) => r.json()).then(setSt).catch(() => {}); }, []);
  return (
    <div className="flex items-center gap-1.5 pt-2 border-t border-border/30">
      <div className={cn("h-1.5 w-1.5 rounded-full", st.openclaw ? "bg-xp" : st.mode ? "bg-gold" : "bg-text-dim/20")} />
      <span className="text-[10px] text-text-dim">{st.mode === "openclaw" ? "OpenClaw" : st.mode || "..."}</span>
    </div>
  );
}
