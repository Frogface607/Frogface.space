"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Mic, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "system",
    content: "🎮 Командный центр запущен. Moltbot онлайн. Глава 1: Фундамент.",
    timestamp: new Date(),
  },
  {
    id: "2",
    role: "assistant",
    content:
      "Привет, бро! 🤝 Я на связи. Командный центр запущен — теперь работаем отсюда, а не из Telegram.\n\nТвои активные квесты:\n• Запуск MyReply — 85% готово\n• Сайт Edison — 60% (критический)\n• Frogface.space — строим прямо сейчас\n\nЧто делаем? Готов к приказам, Архитектор.",
    timestamp: new Date(),
  },
];

export default function CommandPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate response (will be replaced with real OpenClaw WebSocket)
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getSimulatedResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="animate-fade-in flex h-[calc(100vh-3rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-xl border border-border bg-bg-card px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20">
            <Bot className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text-bright">Moltbot — Командный центр</h1>
            <p className="text-[10px] text-xp">● Online · Claude Sonnet 4 · OpenClaw Gateway</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-bg-deep px-2 py-1 text-[10px] text-text-dim">
            Глава 1 · День 1
          </span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto border-x border-border bg-bg-deep/50 p-5"
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-sm text-text-dim">
            <Bot className="h-4 w-4 animate-pulse text-accent" />
            <span className="animate-pulse">Moltbot думает...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="rounded-b-xl border border-border bg-bg-card p-3">
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg p-2 text-text-dim transition-colors hover:bg-bg-hover hover:text-accent"
            title="Голосовой ввод (скоро)"
          >
            <Mic className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Пиши Moltbot... (команды: /status, /quests, /imagine)"
            className="flex-1 rounded-lg border border-border bg-bg-deep px-4 py-2.5 text-sm text-text placeholder:text-text-dim/40 focus:border-accent/50 focus:outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-accent-dim disabled:opacity-30"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 flex gap-2">
          {["/status", "/quests", "/report", "/imagine"].map((cmd) => (
            <button
              key={cmd}
              onClick={() => setInput(cmd)}
              className="rounded-md border border-border px-2 py-1 text-[10px] text-text-dim transition-colors hover:border-accent/50 hover:text-accent"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  if (message.role === "system") {
    return (
      <div className="flex justify-center">
        <span className="rounded-full bg-accent/10 px-4 py-1.5 text-[10px] text-accent">
          {message.content}
        </span>
      </div>
    );
  }

  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isUser ? "bg-mana/20" : "bg-accent/20"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-mana" />
        ) : (
          <Sparkles className="h-4 w-4 text-accent" />
        )}
      </div>
      <div
        className={`max-w-[70%] rounded-xl px-4 py-3 ${
          isUser
            ? "bg-mana/10 text-text"
            : "border border-border/50 bg-bg-card text-text"
        }`}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
        <p className="mt-1 text-[10px] text-text-dim">
          {message.timestamp.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

function getSimulatedResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("/status")) {
    return "📊 Status Report:\n\n💰 Gold: 178K ₽ (target: 500K)\n⚡ Mana: 72/100 — good energy\n✨ XP Today: +340\n\n🎯 Active Quests: 7\n🔥 Critical: MyReply launch, Edison website\n\nОбщий вектор: положительный. Двигаемся.";
  }
  if (lower.includes("/quests")) {
    return "🎯 Active Quests:\n\n🔴 [BOSS] First 10 paying users — MyReply\n🔴 [CRIT] Edison website — close gestalt\n🟡 Frogface.space dashboard\n🟡 Receptor analysis\n🟢 Content strategy execution\n🟢 Agent office setup\n🟢 Voice command integration\n\nЧто атакуем первым?";
  }
  if (lower.includes("/report")) {
    return "📋 Weekly Report — Chapter 1, Day 1:\n\n✅ Completed:\n• AI Proxy deployed on Vercel\n• Voice transcription fixed\n• Workspace optimized 4x\n• Moltbot running in tmux\n• First payment received\n\n🔜 Next:\n• Frogface.space MVP\n• MyReply marketing push\n• Edison website sprint\n\nXP earned this week: +1,200\nGold change: +0.5K ₽";
  }
  return `Принял, бро. «${input}» — записал. Что с этим делаем дальше? Могу:\n\n1. Создать квест из этого\n2. Отправить агентам на исполнение\n3. Добавить в план на сегодня\n4. Просто запомнить\n\nТвой выбор, Архитектор.`;
}
