"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface ChatMsg {
  id: string;
  role: "user" | "agent" | "assistant" | "system";
  text: string;
  time: string;
}

/**
 * Chat history hook: localStorage instant load + API sync (OpenClaw/Supabase).
 * Messages are stored via /api/kv with key ff_chat_{agentId}.
 */
export function useChatHistory(
  agentId: string,
  initialMessages: ChatMsg[],
): [ChatMsg[], (msgs: ChatMsg[] | ((prev: ChatMsg[]) => ChatMsg[])) => void, () => void] {
  const lsKey = `ff_chat_${agentId}`;
  const [messages, setMessages] = useState<ChatMsg[]>(initialMessages);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    try {
      const local = localStorage.getItem(lsKey);
      if (local) {
        const parsed = JSON.parse(local) as ChatMsg[];
        if (parsed.length > 0) setMessages(parsed);
      }
    } catch {}

    fetch(`/api/kv?key=${encodeURIComponent(lsKey)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.value && Array.isArray(data.value) && data.value.length > 0) {
          setMessages(data.value as ChatMsg[]);
          try {
            localStorage.setItem(lsKey, JSON.stringify(data.value));
          } catch {}
        }
      })
      .catch(() => {});
  }, [agentId, lsKey]);

  const updateMessages = useCallback(
    (value: ChatMsg[] | ((prev: ChatMsg[]) => ChatMsg[])) => {
      setMessages((prev) => {
        const next = value instanceof Function ? value(prev) : value;

        try {
          localStorage.setItem(lsKey, JSON.stringify(next));
        } catch {}

        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
          fetch("/api/kv", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: lsKey, value: next }),
          }).catch(() => {});
        }, 500);

        return next;
      });
    },
    [lsKey],
  );

  const clearHistory = useCallback(() => {
    setMessages(initialMessages);
    try { localStorage.removeItem(lsKey); } catch {}
    fetch("/api/kv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: lsKey, value: [] }),
    }).catch(() => {});
  }, [lsKey, initialMessages]);

  return [messages, updateMessages, clearHistory];
}
