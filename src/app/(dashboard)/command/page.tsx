"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Mic, Sparkles, Trash2 } from "lucide-react";
import { useChatHistory, type ChatMsg } from "@/lib/use-chat-history";

function now() {
  return new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

const INITIAL_MESSAGES: ChatMsg[] = [
  { id: "sys", role: "system", text: "🎮 Командный центр запущен. Moltbot онлайн. Глава 1: Фундамент.", time: "" },
  {
    id: "greeting",
    role: "assistant",
    text: "На связи, Архитектор. Командный центр запущен — все агенты в сборе.\n\nГотов к приказам. Что делаем?",
    time: now(),
  },
];

const SYSTEM_PROMPT = [
  "Ты — Moltbot, операционный директор Frogface Studio.",
  "Координируешь 8 агентов, управляешь приоритетами.",
  "",
  "Архитектор — Сергей. Креативный директор, не конвейер. Ценности: свобода + комфорт. Сейчас в Таиланде.",
  "Workflow: гулять → наговаривать потоки → структурировать → задачи агентам → approve/reject.",
  "",
  "Проекты:",
  "- MyReply: AI-ответы на отзывы, MRR 178K₽→500K, soft launch, 1 клиент→10. Чек 490₽/мес.",
  "- Edison Bar: ресторан Иркутск, 11 дней до сайта, планёрка с Машей, batch вывесок через Freepik.",
  "- «Идущий к руке»: YouTube, съёмки ср-чт-пт, стартовая фраза «Я устал бежать».",
  "- Frogface.space: этот дашборд, PWA, агенты, RPG-система.",
  "",
  "Anti-patterns: НЕ cold outreach до social proof, НЕ Playwright, НЕ автоматизация ради автоматизации.",
  "Глава 1: Фундамент, 30-дневный спринт.",
  "Стиль: дружелюбный, лаконичный, с RPG-нарративом. Обращайся «Архитектор». Русский язык.",
].join("\n");

export default function CommandPage() {
  const [messages, setMessages, clearChat] = useChatHistory("command", INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", text: input, time: now() };
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
      history.push({ role: "user", content: input });

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
          model: "Claude Sonnet 4",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error([err.error, err.details, err.model].filter(Boolean).join(" | "));
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
        setMessages((prev) =>
          prev.map((m) => (m.id === botMsgId ? { ...m, text: snapshot } : m))
        );
      }
    } catch (err) {
      const errorText = err instanceof Error ? err.message : "Неизвестная ошибка";
      setMessages((prev) => [
        ...prev,
        { id: botMsgId, role: "assistant", text: `⚠️ API: ${errorText}\n\n(Фоллбек) ${getSimulatedResponse(input)}`, time: now() },
      ]);
      setIsTyping(false);
    }
  };

  return (
    <div className="animate-fade-in flex h-[calc(100vh-5rem)] flex-col lg:h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-xl border border-border bg-bg-card px-4 py-3 lg:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20">
            <Bot className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text-bright">Moltbot — Командный центр</h1>
            <p className="text-[10px] text-xp">● Online · Claude Sonnet 4 · OpenRouter</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-md bg-bg-deep px-2 py-1 text-[10px] text-text-dim sm:inline-block">
            Глава 1
          </span>
          <button
            onClick={clearChat}
            className="rounded p-1.5 text-text-dim/40 transition-colors hover:bg-hp/10 hover:text-hp"
            title="Очистить чат"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto border-x border-border bg-bg-deep/50 p-4 lg:p-5"
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
            className="hidden rounded-lg p-2 text-text-dim transition-colors hover:bg-bg-hover hover:text-accent sm:block"
            title="Голосовой ввод (скоро)"
          >
            <Mic className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Написать Moltbot..."
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
        <div className="mt-2 flex flex-wrap gap-1.5 lg:gap-2">
          {["/status", "/quests", "/report"].map((cmd) => (
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

function MessageBubble({ message }: { message: ChatMsg }) {
  if (message.role === "system") {
    return (
      <div className="flex justify-center">
        <span className="rounded-full bg-accent/10 px-4 py-1.5 text-[10px] text-accent">
          {message.text}
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
        className={`max-w-[80%] rounded-xl px-4 py-3 lg:max-w-[70%] ${
          isUser
            ? "bg-mana/10 text-text"
            : "border border-border/50 bg-bg-card text-text"
        }`}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>
        {message.time && <p className="mt-1 text-[10px] text-text-dim">{message.time}</p>}
      </div>
    </div>
  );
}

function getSimulatedResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("/status")) {
    return "📊 Статус:\n\n💰 Gold: 178K ₽ (цель 500K)\n⚡ Мана: 72/100\n✨ XP: +340\n🎯 Квестов: 7 активных\n\nДвигаемся.";
  }
  if (lower.includes("/quests")) {
    return "🎯 Активные квесты:\n\n🔴 [БОСС] 10 платящих — MyReply\n🔴 [КРИТ] Сайт Edison\n🟡 Frogface.space\n🟢 Контент-стратегия\n\nЧто атакуем?";
  }
  if (lower.includes("/report")) {
    return "📋 Отчёт — Глава 1, День 1:\n\n✅ AI Proxy развёрнут\n✅ Голосовые работают\n✅ Рабочее пространство оптимизировано\n✅ Первый платёж получен\n\n🔜 Далее: Frogface MVP, MyReply маркетинг";
  }
  return `Принял, Архитектор. «${input}» — записал.\n\n1. Создать квест\n2. Отправить агентам\n3. В план на сегодня\n\nТвой ход.`;
}
