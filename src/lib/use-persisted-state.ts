"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Persisted state hook: localStorage instant load + API sync (OpenClaw/Supabase).
 * Loads from localStorage first (fast hydration), then fetches from /api/kv.
 * On write: saves to localStorage immediately, debounced save to API.
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [stored, setStored] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    let cancelled = false;

    try {
      const local = localStorage.getItem(key);
      if (local && !cancelled) setStored(JSON.parse(local));
    } catch {}

    fetch(`/api/kv?key=${encodeURIComponent(key)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.value !== undefined && data.value !== null) {
          setStored(data.value as T);
          try {
            localStorage.setItem(key, JSON.stringify(data.value));
          } catch {}
        }
      })
      .catch(() => {});

    setHydrated(true);
    return () => { cancelled = true; };
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStored((prev) => {
        const next = value instanceof Function ? value(prev) : value;

        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {}

        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
          fetch("/api/kv", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key, value: next }),
          }).catch(() => {});
        }, 300);

        return next;
      });
    },
    [key],
  );

  return [hydrated ? stored : initialValue, setValue];
}
