"use client";

import { useState, useRef, useEffect } from "react";
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
  Send,
  Loader2,
  Trophy,
  Flame,
  Target,
  Mic,
  MicOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePersistedState } from "@/lib/use-persisted-state";
import { useChatHistory, type ChatMsg } from "@/lib/use-chat-history";

const GM_SYSTEM = `Ты — Game Master, мудрый наставник Архитектора. Ведёшь летопись его жизни в стиле фэнтезийного RPG.

Твоя задача — ритуал закрытия дня. Когда Архитектор открывает Летопись вечером, ты:
1. Спрашиваешь: "Какой момент дня запомнишь больше всего?"
2. Потом: "Что забрало больше всего маны (энергии)?"
3. Потом: "Что завтра точно НЕ будешь делать?"
4. На основе ответов пишешь запись в летопись — 3-5 предложений эпическим стилем.

Не задавай все вопросы сразу. По одному. Жди ответа.
Если Архитектор отвечает коротко — это нормально, не допрашивай.
После 3 вопросов — пиши итоговую запись в летопись.

Стиль: тёплый, мудрый, фэнтезийный. Не пафосно, но с глубиной.
Архитектор = Сергей, Глава 1: Фундамент, 30-дневный спринт.
Всегда на русском.`;

const INITIAL_MESSAGES: ChatMsg[] = [
  {
    id: "gm-intro",
    role: "assistant",
    text: "Добрый вечер, Архитектор.\n\nДень подходит к концу, и пришло время записать его в летопись. Не торопись — здесь нет дедлайнов.\n\nРасскажи: какой момент дня ты запомнишь больше всего?",
    time: "",
  },
];

export default function ChroniclePage() {
  const [messages, setMessages, clearChat] = useChatHistory("chronicle", INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [recording, setRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const hasSpeechApi = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
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
        .map((m) => ({
          role: m.role === "user" ? ("user" as const) : ("assistant" as const),
          content: m.text,
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "Claude Sonnet 4",
          messages: [
            { role: "system", content: GM_SYSTEM },
            ...history,
            { role: "user", content: msg },
          ],
        }),
      });

      if (!res.ok) throw new Error("API error");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";

      setMessages((prev) => [...prev, { id: botMsgId, role: "assistant", text: "", time: now() }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === botMsgId ? { ...m, text: full } : m)),
        );
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: botMsgId, role: "assistant", text: "Связь с хрониками прервалась... Попробуй ещё раз.", time: now() },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleVoice = () => {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }
    if (!hasSpeechApi) return;

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
      if (fullText.trim()) sendMessage(fullText.trim());
    };

    recognition.onerror = () => setRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setRecording(true);
  };

  return (
    <div className="animate-fade-in flex h-[calc(100vh-5rem)] flex-col lg:h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 lg:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gold to-amber-600">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-text-bright">Летопись</h1>
            <p className="text-[10px] text-text-dim">Game Master · Ритуал закрытия дня</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-1">
            <Crown className="h-3 w-3 text-gold" />
            <span className="text-[10px] font-medium text-gold">Ур. 7</span>
          </div>
          <button
            onClick={() => { clearChat(); }}
            className="rounded-lg px-2 py-1 text-[10px] text-text-dim hover:bg-bg-hover hover:text-text"
          >
            Новый день
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 lg:p-5">
        {messages.filter((m) => m.role !== "system").map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 lg:max-w-[70%]",
                msg.role === "user"
                  ? "rounded-br-md bg-accent/20 text-text"
                  : "rounded-bl-md border border-gold/20 bg-gold/5 text-text",
              )}
            >
              {msg.role === "assistant" && (
                <div className="mb-1 flex items-center gap-1.5">
                  <Scroll className="h-3 w-3 text-gold" />
                  <span className="text-[10px] font-medium text-gold">Game Master</span>
                </div>
              )}
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
              {msg.time && (
                <p className={cn(
                  "mt-1 text-[10px]",
                  msg.role === "user" ? "text-right text-accent/50" : "text-gold/40",
                )}>
                  {msg.time}
                </p>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md border border-gold/20 bg-gold/5 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-gold/60">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Game Master пишет...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3 lg:p-4">
        <div className="flex items-center gap-2">
          {hasSpeechApi && (
            <button
              onClick={toggleVoice}
              className={cn(
                "shrink-0 rounded-xl p-2.5 transition-colors",
                recording
                  ? "bg-hp/20 text-hp animate-pulse"
                  : "bg-bg-deep text-text-dim hover:text-accent",
              )}
            >
              {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          )}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={recording ? "Говори..." : "Ответить Game Master'у..."}
            className="flex-1 rounded-xl border border-border bg-bg-deep px-4 py-2.5 text-sm text-text placeholder:text-text-dim/40 focus:border-gold/50 focus:outline-none"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            className="shrink-0 rounded-xl bg-gold/20 p-2.5 text-gold transition-colors hover:bg-gold/30 disabled:opacity-30"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function now() {
  return new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}
