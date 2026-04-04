"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  Mic,
  MicOff,
  Loader2,
  Hash,
  MessageCircle,
  Users,
  Sparkles,
  Crown,
  Building2,
  Lock,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── TYPES ──────────────────────────────────────────────

interface Agent {
  id: string;
  name: string;
  role: string;
  avatar_emoji: string;
  accent_color: string;
  status: string;
  mood: string;
  level: number;
  department: string;
}

interface Conversation {
  id: string;
  type: string;
  name: string;
  icon: string;
  participant_ids: string[];
  project: string | null;
}

interface Message {
  id: number;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  created_at: string;
}

// ─── STATUS CONFIG ──────────────────────────────────────

const STATUS_STYLES: Record<string, { label: string; color: string; pulse: boolean }> = {
  active: { label: "Активен", color: "bg-xp", pulse: false },
  thinking: { label: "Думает...", color: "bg-accent", pulse: true },
  working: { label: "Работает", color: "bg-mana", pulse: true },
  meeting: { label: "Совещание", color: "bg-gold", pulse: false },
  idle: { label: "Ожидает", color: "bg-text-dim/30", pulse: false },
  offline: { label: "Офлайн", color: "bg-text-dim/10", pulse: false },
};

// ─── MAIN PAGE ──────────────────────────────────────────

export default function AgencyPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConv, setActiveConv] = useState<string>("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial data
  useEffect(() => {
    Promise.all([
      fetch("/api/agency/agents").then((r) => r.json()),
      fetch("/api/agency/conversations").then((r) => r.json()),
    ]).then(([agentsData, convsData]) => {
      setAgents(agentsData.agents || []);
      setConversations(convsData.conversations || []);
      // Default to #general
      const general = (convsData.conversations || []).find(
        (c: Conversation) => c.name === "#general",
      );
      if (general) setActiveConv(general.id);
      setLoading(false);
    });
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeConv) return;
    fetch(`/api/agency/messages?conversation_id=${activeConv}`)
      .then((r) => r.json())
      .then((data) => setMessages(data.messages || []));
  }, [activeConv]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Refresh agents periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/agency/agents")
        .then((r) => r.json())
        .then((data) => setAgents(data.agents || []));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !activeConv || sending) return;

    const msg = input.trim();
    setInput("");
    setSending(true);

    // Optimistic: add user message
    const tempMsg: Message = {
      id: Date.now(),
      conversation_id: activeConv,
      sender_id: "architect",
      content: msg,
      message_type: "text",
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch("/api/agency/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: activeConv, message: msg }),
      });
      const data = await res.json();

      // Refresh agents (status may have changed)
      fetch("/api/agency/agents")
        .then((r) => r.json())
        .then((d) => setAgents(d.agents || []));

      // Add frog responses
      if (data.responses) {
        const frogMessages: Message[] = data.responses.map(
          (r: { frog_id: string; content: string }, i: number) => ({
            id: Date.now() + i + 1,
            conversation_id: activeConv,
            sender_id: r.frog_id,
            content: r.content,
            message_type: "text",
            created_at: new Date().toISOString(),
          }),
        );
        setMessages((prev) => [...prev, ...frogMessages]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 999,
          conversation_id: activeConv,
          sender_id: "system",
          content: "Ошибка связи с агентством. Проверь API ключи.",
          message_type: "system",
          created_at: new Date().toISOString(),
        },
      ]);
    }

    setSending(false);
  };

  const getAgent = (id: string) => agents.find((a) => a.id === id);
  const activeConvData = conversations.find((c) => c.id === activeConv);

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-accent" />
          <p className="mt-3 font-display text-sm text-text-dim">Загружаем агентство...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="noise grid-bg relative flex h-[calc(100vh-4rem)] flex-col lg:h-screen">
      <div className="pointer-events-none absolute inset-0 radial-accent" />

      <div className="relative z-10 flex h-full flex-col">
        {/* ─── TOP: Agent Status Bar ─────────────────────── */}
        <div className="shrink-0 border-b border-border/30 bg-bg-deep/50 backdrop-blur-xl">
          <div className="flex items-center gap-2 px-4 py-3">
            <Building2 className="h-4 w-4 text-accent/60" />
            <h1 className="font-display text-xs font-bold uppercase tracking-[0.3em] text-text-dim/50">
              Frogface Agency
            </h1>
            <span className="ml-auto rounded-full bg-bg-elevated px-2.5 py-0.5 text-[10px] text-text-dim/40">
              Ур. 1 · Гараж
            </span>
          </div>

          {/* Frog cards */}
          <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
            {agents.map((agent) => {
              const st = STATUS_STYLES[agent.status] || STATUS_STYLES.idle;
              return (
                <div
                  key={agent.id}
                  className="glass glass-hover flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 transition-all"
                >
                  <div className="relative">
                    <span className="text-xl">{agent.avatar_emoji}</span>
                    <div
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-bg-deep",
                        st.color,
                        st.pulse && "animate-pulse",
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-bright">{agent.name}</p>
                    <p className="text-[10px] text-text-dim/50">{agent.role}</p>
                  </div>
                </div>
              );
            })}

            {/* Locked slots */}
            {[1, 2, 3].map((i) => (
              <div
                key={`locked-${i}`}
                className="flex shrink-0 items-center gap-2 rounded-xl border border-dashed border-border/20 px-3 py-2 opacity-30"
              >
                <Lock className="h-4 w-4 text-text-dim/20" />
                <span className="text-[10px] text-text-dim/20">Ур. {i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── MAIN: Chat Area ───────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Channel sidebar */}
          <div className="hidden w-56 shrink-0 border-r border-border/20 bg-bg-deep/30 lg:block">
            <div className="p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-dim/30">
                Каналы
              </p>
              {conversations
                .filter((c) => c.type === "channel")
                .map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConv(conv.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-all",
                      activeConv === conv.id
                        ? "bg-accent/10 text-accent"
                        : "text-text-dim/50 hover:bg-bg-hover hover:text-text-dim",
                    )}
                  >
                    <span className="text-xs">{conv.icon}</span>
                    <span>{conv.name}</span>
                  </button>
                ))}
            </div>

            <div className="p-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-dim/30">
                Личные
              </p>
              {agents.map((agent) => (
                <button
                  key={`dm-${agent.id}`}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm text-text-dim/40 transition-all hover:bg-bg-hover hover:text-text-dim"
                >
                  <span className="text-xs">{agent.avatar_emoji}</span>
                  <span>{agent.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Messages area */}
          <div className="flex flex-1 flex-col">
            {/* Channel header */}
            {activeConvData && (
              <div className="flex items-center gap-2 border-b border-border/10 px-4 py-2.5">
                <span>{activeConvData.icon}</span>
                <span className="font-display text-sm font-semibold text-text-bright">
                  {activeConvData.name}
                </span>
                {activeConvData.project && (
                  <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent/60">
                    {activeConvData.project}
                  </span>
                )}
                <span className="ml-auto text-[10px] text-text-dim/30">
                  {activeConvData.participant_ids.filter((id) => id !== "architect").length} лягух
                </span>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {messages.length === 0 && (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="mx-auto h-8 w-8 text-accent/20" />
                    <p className="mt-2 text-sm text-text-dim/30">Начни разговор, Босс</p>
                  </div>
                </div>
              )}

              <div className="stagger space-y-3">
                {messages.map((msg) => {
                  const isArchitect = msg.sender_id === "architect";
                  const isSystem = msg.sender_id === "system";
                  const agent = getAgent(msg.sender_id);

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="text-center">
                        <span className="text-xs text-hp/60">{msg.content}</span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-3",
                        isArchitect && "flex-row-reverse",
                      )}
                    >
                      {/* Avatar */}
                      <div className="shrink-0 pt-0.5">
                        {isArchitect ? (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent to-mana">
                            <Crown className="h-4 w-4 text-white" />
                          </div>
                        ) : (
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-full"
                            style={{ backgroundColor: `${agent?.accent_color}15` }}
                          >
                            <span className="text-sm">{agent?.avatar_emoji || "🐸"}</span>
                          </div>
                        )}
                      </div>

                      {/* Message bubble */}
                      <div className={cn("max-w-[75%]", isArchitect && "text-right")}>
                        <p className="mb-0.5 text-[10px] font-semibold" style={{ color: isArchitect ? undefined : agent?.accent_color }}>
                          {isArchitect ? "Босс" : agent?.name || msg.sender_id}
                        </p>
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                            isArchitect
                              ? "glass text-text-bright"
                              : "bg-bg-elevated/50 text-text",
                          )}
                          style={
                            !isArchitect
                              ? { borderLeft: `2px solid ${agent?.accent_color}30` }
                              : undefined
                          }
                        >
                          {msg.content}
                        </div>
                        <p className="mt-0.5 text-[9px] text-text-dim/20">
                          {new Date(msg.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {sending && (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-accent/40" />
                  <span className="text-xs text-text-dim/30">Лягухи думают...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-border/10 p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Написать в агентство..."
                  disabled={sending}
                  className="flex-1 rounded-xl border border-border/30 bg-bg-deep/50 px-4 py-3 text-sm text-text placeholder:text-text-dim/20 focus:border-accent/30 focus:outline-none disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="flex items-center gap-1.5 rounded-xl bg-accent/15 px-4 py-3 text-sm font-medium text-accent transition-all hover:bg-accent/25 disabled:opacity-20"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
