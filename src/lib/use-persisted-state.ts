"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase";

/**
 * Persisted state hook: Supabase kv_store with localStorage fallback.
 * Loads from localStorage instantly (for fast hydration), then syncs with Supabase.
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

    // 1. Instant hydration from localStorage
    try {
      const local = localStorage.getItem(key);
      if (local && !cancelled) setStored(JSON.parse(local));
    } catch {}

    // 2. Then try Supabase (async, overwrites if newer)
    if (supabase) {
      Promise.resolve(
        supabase.from("kv_store").select("value").eq("key", key).maybeSingle()
      )
        .then(({ data }) => {
          if (!cancelled && data?.value !== undefined) {
            setStored(data.value as T);
            try {
              localStorage.setItem(key, JSON.stringify(data.value));
            } catch {}
          }
        })
        .catch(() => {});
    }

    setHydrated(true);
    return () => { cancelled = true; };
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStored((prev) => {
        const next = value instanceof Function ? value(prev) : value;

        // Always save to localStorage immediately
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {}

        // Debounced save to Supabase (300ms)
        if (supabase) {
          clearTimeout(saveTimer.current);
          saveTimer.current = setTimeout(() => {
            supabase!
              .from("kv_store")
              .upsert({ key, value: next, updated_at: new Date().toISOString() })
              .then(() => {});
          }, 300);
        }

        return next;
      });
    },
    [key],
  );

  return [hydrated ? stored : initialValue, setValue];
}
