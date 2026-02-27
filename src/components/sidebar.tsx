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
  { href: "/studio", label: "Студия", icon: Building2, description: "Офис агентов" },
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
      <div className="flex items-center justify-between border-b border-border px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
            <Swords className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide text-text-bright">FROGFACE</h1>
            <p className="text-[10px] font-medium uppercase tracking-widest text-text-dim">Life OS</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="rounded-lg p-1.5 text-text-dim hover:text-text lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                active
                  ? "bg-accent/15 text-accent font-medium"
                  : "text-text-dim hover:bg-bg-hover hover:text-text"
              )}
            >
              <item.icon className={cn("h-4 w-4", active && "text-accent")} />
              <div>
                <span>{item.label}</span>
                <p className={cn("text-[10px]", active ? "text-accent/60" : "text-text-dim/50")}>
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Player mini-stats */}
      <div className="border-t border-border px-4 py-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent to-mana" />
          <div>
            <p className="text-xs font-semibold text-text-bright">Сергей</p>
            <p className="text-[10px] text-text-dim">Ур. 7 Архитектор</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <StatBar label="XP" value={2847} max={5000} color="bg-xp" />
          <StatBar label="Gold" value={178} max={500} color="bg-gold" suffix="K ₽" />
          <StatBar label="Mana" value={72} max={100} color="bg-mana" />
        </div>
        <button
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] text-text-dim transition-colors hover:bg-bg-hover hover:text-hp"
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
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center gap-3 border-b border-border bg-bg-card px-4 py-3 lg:hidden">
        <button onClick={() => setOpen(true)} className="rounded-lg p-1.5 text-text-dim hover:text-accent">
          <Menu className="h-5 w-5" />
        </button>
        <Swords className="h-4 w-4 text-accent" />
        <span className="text-xs font-bold text-text-bright">FROGFACE</span>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — mobile: slide-in overlay, desktop: fixed */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-border bg-bg-card transition-transform duration-200",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

function StatBar({
  label,
  value,
  max,
  color,
  suffix = "",
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  suffix?: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 text-[10px] text-text-dim">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-bg-deep">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-12 text-right text-[10px] text-text-dim">
        {value}{suffix}
      </span>
    </div>
  );
}
