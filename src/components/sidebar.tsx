"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Swords,
  Building2,
  FolderKanban,
  Terminal,
  Home,
  Gamepad2,
  ScrollText,
  BookOpen,
  ListTodo,
  Sparkles,
  Sun,
  FlaskConical,
  Brain,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Штаб", icon: Home, description: "Главный экран" },
  { href: "/morning", label: "Планёрка", icon: Sun, description: "Утренний ритуал" },
  { href: "/quests", label: "Квесты", icon: ScrollText, description: "Журнал квестов" },
  { href: "/player", label: "Игрок", icon: Gamepad2, description: "Статы и скиллы" },
  { href: "/projects", label: "Проекты", icon: FolderKanban, description: "Доска миссий" },
  { href: "/agency", label: "Агентство", icon: Building2, description: "Frogface Agency" },
  { href: "/mindmap", label: "Разум", icon: Brain, description: "Лабиринты разума" },
  { href: "/chronicle", label: "Летопись", icon: BookOpen, description: "Game Master" },
  { href: "/pipeline", label: "Конвейер", icon: Sparkles, description: "AI-контент" },
  { href: "/tasks", label: "Задачи", icon: ListTodo, description: "Очередь для Cursor" },
  { href: "/command", label: "Команды", icon: Terminal, description: "Чат с Moltbot" },
  { href: "/test", label: "Тесты", icon: FlaskConical, description: "Проверка систем" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 glow-accent">
            <Swords className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="font-display text-sm font-bold tracking-wider text-text-bright">
              FROGFACE
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-text-dim/40">
              Life OS
            </p>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="rounded-lg p-1.5 text-text-dim/40 transition-colors hover:text-text lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
                active
                  ? "bg-accent/8 text-accent"
                  : "text-text-dim/60 hover:bg-bg-hover hover:text-text",
              )}
            >
              <item.icon className={cn(
                "h-4 w-4 transition-all",
                active ? "text-accent" : "text-text-dim/30 group-hover:text-text-dim/60",
              )} />
              <div>
                <span className={cn(
                  "text-sm",
                  active && "font-semibold",
                )}>
                  {item.label}
                </span>
                <p className={cn(
                  "text-[10px] transition-colors",
                  active ? "text-accent/40" : "text-text-dim/20 group-hover:text-text-dim/30",
                )}>
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Player mini-stats */}
      <div className="border-t border-border/30 px-4 py-4">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="relative">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-accent/60 to-mana/60" />
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-bg-card bg-xp" />
          </div>
          <div>
            <p className="font-display text-xs font-bold text-text-bright">Сергей</p>
            <p className="text-[10px] text-text-dim/40">Ур. 7 · Архитектор</p>
          </div>
        </div>
        <div className="space-y-2">
          <StatBar label="XP" value={2847} max={5000} color="bg-xp" />
          <StatBar label="Gold" value={178} max={500} color="bg-gold" suffix="K" />
          <StatBar label="Mana" value={72} max={100} color="bg-mana" />
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] text-text-dim/30 transition-colors hover:bg-bg-hover hover:text-hp/60"
        >
          <LogOut className="h-3 w-3" />
          Выйти
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center gap-3 border-b border-border/30 bg-bg-deep/80 px-4 py-3 backdrop-blur-xl lg:hidden">
        <button onClick={() => setOpen(true)} className="rounded-lg p-1.5 text-text-dim/40 transition-colors hover:text-accent">
          <Menu className="h-5 w-5" />
        </button>
        <Swords className="h-4 w-4 text-accent/60" />
        <span className="font-display text-xs font-bold tracking-wider text-text-bright">FROGFACE</span>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-border/30 bg-bg-deep/95 backdrop-blur-xl transition-transform duration-300",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

function StatBar({
  label, value, max, color, suffix = "",
}: {
  label: string; value: number; max: number; color: string; suffix?: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 text-[10px] text-text-dim/30">{label}</span>
      <div className="progress-bar h-1 flex-1 bg-border/50">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 text-right text-[10px] tabular-nums text-text-dim/40">
        {value}{suffix}
      </span>
    </div>
  );
}
