"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Swords, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Неверный пароль");
        setPassword("");
      }
    } catch {
      setError("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-deep">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/20">
            <Swords className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-xl font-bold tracking-wide text-text-bright">FROGFACE</h1>
          <p className="text-xs text-text-dim">Life OS · Командный центр</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-bg-card p-6">
          <label className="mb-2 block text-xs font-medium text-text-dim">
            Пароль доступа
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введи пароль, Архитектор..."
            autoFocus
            className="w-full rounded-lg border border-border bg-bg-deep px-4 py-3 text-sm text-text placeholder:text-text-dim/40 focus:border-accent/50 focus:outline-none"
          />

          {error && (
            <div className="mt-3 flex items-center gap-2 text-xs text-hp">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!password || loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3 text-sm font-medium text-white transition-all hover:bg-accent-dim disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Войти в игру"
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-[10px] text-text-dim/40">
          frogface.space · protected
        </p>
      </div>
    </div>
  );
}
