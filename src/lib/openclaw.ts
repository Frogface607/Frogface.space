/**
 * Client-side helpers for interacting with OpenClaw via our API proxy.
 */

export interface MemoryItem {
  id: string;
  text: string;
  category: string;
  importance: number;
  score?: number;
  createdAt?: string;
}

export async function memoryRecall(query: string, limit = 5): Promise<MemoryItem[]> {
  try {
    const res = await fetch(`/api/memory?q=${encodeURIComponent(query)}&limit=${limit}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.memories ?? [];
  } catch {
    return [];
  }
}

export async function memoryStore(
  text: string,
  category: "preference" | "decision" | "entity" | "fact" | "other" = "fact",
  importance = 0.7,
): Promise<boolean> {
  try {
    const res = await fetch("/api/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "store", text, category, importance }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function memoryForget(query: string): Promise<boolean> {
  try {
    const res = await fetch("/api/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "forget", query }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export interface OpenClawStatus {
  connected: boolean;
  mode: "openclaw" | "openrouter-direct" | "offline";
  openclawUrl: string | null;
}

export async function getOpenClawStatus(): Promise<OpenClawStatus> {
  try {
    const res = await fetch("/api/chat");
    if (!res.ok) return { connected: false, mode: "offline", openclawUrl: null };
    const data = await res.json();
    return {
      connected: data.openclaw || data.hasKey,
      mode: data.mode ?? (data.hasKey ? "openrouter-direct" : "offline"),
      openclawUrl: data.openclawUrl ?? null,
    };
  } catch {
    return { connected: false, mode: "offline", openclawUrl: null };
  }
}
