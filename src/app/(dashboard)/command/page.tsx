"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Bot,
  User,
  Mic,
  MicOff,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  Loader2,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatHistory, type ChatMsg } from "@/lib/use-chat-history";
import { speak, stopSpeaking, isSpeaking, preloadVoices } from "@/lib/tts";
import { parseActions, executeActions, listActiveQuests } from "@/lib/quest-store";

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
  "",
  "ВАЖНО: Если разговор идёт голосом — отвечай коротко и разговорно. Не пиши списки и буллеты — говори как друг.",
  "",
  "=== УПРАВЛЕНИЕ КВЕСТАМИ ===",
  "Ты можешь создавать, завершать и показывать квесты. Используй action-блоки в ответе.",
  "Формат (вставляй в конце ответа, можно несколько):",
  "",
  "Создать квест:     [QUEST:CREATE|название|проект|приоритет|xp]",
  "  проект: MyReply, Edison, YouTube, Frogface, General",
  "  приоритет: normal, critical, boss",
  "  xp: число (100-800)",
  "",
  "Завершить квест:   [QUEST:COMPLETE|часть названия квеста]",
  "Показать квесты:   [QUEST:LIST]",
  "",
  "Примеры:",
  '  "Создаю квест! [QUEST:CREATE|Позвонить Маше по стратегии|Edison|critical|150]"',
  '  "Отмечаю готовым. [QUEST:COMPLETE|Позвонить Маше]"',
  '  "Вот активные: [QUEST:LIST]"',
  "",
  "Если пользователь просит создать задачу/квест — ВСЕГДА используй action-блок.",
  "Если просит показать квесты/задачи — ВСЕГДА используй [QUEST:LIST].",
  "Если говорит что сделал что-то — предложи завершить соответствующий квест.",
  "Action-блоки ставь В КОНЦЕ текста, после своего ответа.",
  "",
  "=== ДЕЛЕГИРОВАНИЕ ЗАДАЧ В CURSOR ===",
  "Для сложных технических задач (код, дашборд, API, дизайн) создавай задачу для Cursor:",
  "Формат: [TASK:CREATE|название|описание|проект|приоритет|cursor]",
  "  проект: myreply, edison, frogface, video, content",
  "  приоритет: boss, critical, high, normal, low",
  "",
  "Пример:",
  '  "Создам задачу для Cursor! [TASK:CREATE|SEO для лендинга|Оптимизировать метатеги и Open Graph для MyReply|myreply|high|cursor]"',
  "",
  "Используй [TASK:CREATE] когда задача требует написания кода или работы с проектом.",
  "Используй [QUEST:CREATE] для обычных задач (звонки, контент, стратегия).",
].join("\n");

export default function CommandPage() {
  const [messages, setMessages, clearChat] = useChatHistory("command", INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [voiceMode, setVoiceMode] = useVoiceMode();
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [recording, setRecording] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const pendingSpeakRef = useRef<string | null>(null);

  const hasSpeechApi =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    preloadVoices();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const speakText = useCallback(
    (text: string) => {
      if (!autoSpeak || !voiceMode) return;
      setSpeaking(true);
      speak(text, () => setSpeaking(false));
    },
    [autoSpeak, voiceMode],
  );

  const sendMessage = useCallback(
    async (text?: string) => {
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
        history.push({ role: "user", content: msg });

        const isVoice = voiceMode;
        const activeQuests = listActiveQuests();
        const questContext = activeQuests.length > 0
          ? "\n\n=== ТЕКУЩИЕ КВЕСТЫ ===\n" + activeQuests.map(
              (q, i) => `${i + 1}. [${q.priority}] ${q.title} (${q.project}, +${q.xp} XP, ${q.progress}%)`
            ).join("\n")
          : "\n\n=== ТЕКУЩИЕ КВЕСТЫ ===\nНет активных квестов.";
        const systemContent = isVoice
          ? SYSTEM_PROMPT + questContext + "\n\n[Режим: голосовой диалог. Отвечай коротко, 2-4 предложения. Без маркдаун-форматирования.]"
          : SYSTEM_PROMPT + questContext;

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
            prev.map((m) => (m.id === botMsgId ? { ...m, text: snapshot } : m)),
          );
        }

        const actions = parseActions(full);
        if (actions.length > 0) {
          const results = await executeActions(actions);
          const cleanedText = full.replace(/\[QUEST:.*?\]/g, "").replace(/\[TASK:CREATE\|.*?\]/g, "").trim();
          const actionSummary = results.join("\n");
          const finalText = cleanedText + (actionSummary ? "\n\n" + actionSummary : "");
          setMessages((prev) =>
            prev.map((m) => (m.id === botMsgId ? { ...m, text: finalText } : m)),
          );
          if (finalText) speakText(cleanedText);
        } else {
          if (full) speakText(full);
        }
      } catch (err) {
        const errorText = err instanceof Error ? err.message : "Неизвестная ошибка";
        const fallback = `⚠️ API: ${errorText}\n\n(Фоллбек) ${getSimulatedResponse(msg)}`;
        setMessages((prev) => [
          ...prev,
          { id: botMsgId, role: "assistant", text: fallback, time: now() },
        ]);
        setIsTyping(false);
      }
    },
    [input, isTyping, messages, setMessages, voiceMode, speakText],
  );

  const toggleRecording = useCallback(() => {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }
    if (!hasSpeechApi) return;

    stopSpeaking();
    setSpeaking(false);

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
      if (fullText.trim()) {
        setInput("");
        sendMessage(fullText.trim());
      }
    };

    recognition.onerror = () => setRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setRecording(true);
  }, [recording, hasSpeechApi, sendMessage]);

  const toggleVoiceMode = () => {
    const next = !voiceMode;
    setVoiceMode(next);
    if (!next) {
      stopSpeaking();
      setSpeaking(false);
      if (recording) {
        recognitionRef.current?.stop();
        setRecording(false);
      }
    }
  };

  return (
    <div className="animate-fade-in flex h-[calc(100vh-5rem)] flex-col lg:h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-xl border border-border bg-bg-card px-4 py-3 lg:px-5">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
            voiceMode ? "bg-xp/20" : "bg-accent/20",
          )}>
            {voiceMode ? (
              <Radio className="h-5 w-5 text-xp" />
            ) : (
              <Bot className="h-5 w-5 text-accent" />
            )}
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text-bright">
              {voiceMode ? "Moltbot — Голосовой режим" : "Moltbot — Командный центр"}
            </h1>
            <p className="text-[10px] text-xp">
              ● Online · Claude Sonnet 4 {voiceMode ? " · TTS" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {voiceMode && (
            <button
              onClick={() => setAutoSpeak((v) => !v)}
              className={cn(
                "rounded p-1.5 transition-colors",
                autoSpeak ? "text-xp hover:bg-xp/10" : "text-text-dim/40 hover:bg-bg-hover",
              )}
              title={autoSpeak ? "Автоозвучка: вкл" : "Автоозвучка: выкл"}
            >
              {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          )}
          <button
            onClick={toggleVoiceMode}
            className={cn(
              "rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-all",
              voiceMode
                ? "bg-xp/20 text-xp"
                : "bg-bg-deep text-text-dim hover:border-accent/50 hover:text-accent",
            )}
          >
            {voiceMode ? "Голос ВКЛ" : "Голос"}
          </button>
          <span className="hidden rounded-md bg-bg-deep px-2 py-1 text-[10px] text-text-dim sm:inline-block">
            Глава 1
          </span>
          <button
            onClick={() => { clearChat(); stopSpeaking(); }}
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
          <MessageBubble
            key={msg.id}
            message={msg}
            onSpeak={voiceMode ? (text) => { stopSpeaking(); speakText(text); } : undefined}
          />
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-sm text-text-dim">
            <Bot className="h-4 w-4 animate-pulse text-accent" />
            <span className="animate-pulse">Moltbot думает...</span>
          </div>
        )}
      </div>

      {/* Voice Mode — Big Mic */}
      {voiceMode ? (
        <div className="border-t border-border bg-bg-card p-4">
          <div className="flex flex-col items-center gap-3">
            {speaking && (
              <div className="flex items-center gap-2 text-xs text-xp">
                <Volume2 className="h-3.5 w-3.5 animate-pulse" />
                Moltbot говорит...
                <button
                  onClick={() => { stopSpeaking(); setSpeaking(false); }}
                  className="ml-1 rounded px-2 py-0.5 text-[10px] text-text-dim hover:bg-bg-hover"
                >
                  стоп
                </button>
              </div>
            )}
            {recording && input && (
              <div className="w-full max-w-md rounded-lg border border-border/30 bg-bg-deep/50 px-4 py-2 text-center">
                <p className="text-xs text-text-dim">{input}</p>
              </div>
            )}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleRecording}
                disabled={isTyping}
                className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-full transition-all",
                  recording
                    ? "bg-hp/20 text-hp shadow-lg shadow-hp/20 animate-pulse"
                    : "bg-accent/20 text-accent hover:bg-accent/30 hover:scale-105",
                  isTyping && "opacity-30",
                )}
              >
                {recording ? (
                  <MicOff className="h-7 w-7" />
                ) : (
                  <Mic className="h-7 w-7" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-text-dim">
              {recording ? "Говори... Нажми чтобы остановить" : "Нажми и говори"}
            </p>

            <div className="flex w-full items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="или напиши..."
                className="flex-1 rounded-lg border border-border bg-bg-deep px-3 py-2 text-xs text-text placeholder:text-text-dim/30 focus:border-accent/50 focus:outline-none"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isTyping}
                className="rounded-lg bg-accent/20 p-2 text-accent transition-colors hover:bg-accent/30 disabled:opacity-30"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Text Mode Input */
        <div className="rounded-b-xl border border-border bg-bg-card p-3">
          <div className="flex items-center gap-2">
            {hasSpeechApi && (
              <button
                onClick={toggleRecording}
                className={cn(
                  "rounded-lg p-2 transition-colors",
                  recording
                    ? "bg-hp/20 text-hp animate-pulse"
                    : "text-text-dim hover:bg-bg-hover hover:text-accent",
                )}
                title="Голосовой ввод"
              >
                {recording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
            )}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Написать Moltbot..."
              className="flex-1 rounded-lg border border-border bg-bg-deep px-4 py-2.5 text-sm text-text placeholder:text-text-dim/40 focus:border-accent/50 focus:outline-none"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim()}
              className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-accent-dim disabled:opacity-30"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5 lg:gap-2">
            {["/status", "/quests", "/tasks", "/report"].map((cmd) => (
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
      )}
    </div>
  );
}

function MessageBubble({
  message,
  onSpeak,
}: {
  message: ChatMsg;
  onSpeak?: (text: string) => void;
}) {
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
        className={`group max-w-[80%] rounded-xl px-4 py-3 lg:max-w-[70%] ${
          isUser ? "bg-mana/10 text-text" : "border border-border/50 bg-bg-card text-text"
        }`}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>
        <div className="mt-1 flex items-center gap-2">
          {message.time && <p className="text-[10px] text-text-dim">{message.time}</p>}
          {onSpeak && !isUser && message.text && (
            <button
              onClick={() => onSpeak(message.text)}
              className="invisible text-text-dim/30 transition-colors hover:text-accent group-hover:visible"
              title="Озвучить"
            >
              <Volume2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function useVoiceMode(): [boolean, (v: boolean) => void] {
  const [mode, setMode] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ff_voice_mode");
      if (stored === "true") setMode(true);
    } catch {}
  }, []);

  const set = (v: boolean) => {
    setMode(v);
    try {
      localStorage.setItem("ff_voice_mode", String(v));
    } catch {}
  };

  return [mode, set];
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
