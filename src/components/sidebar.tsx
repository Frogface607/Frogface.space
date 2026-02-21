"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Swords,
  Building2,
  FolderKanban,
  Terminal,
  Home,
  Gamepad2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Штаб", icon: Home, description: "Главный экран" },
  { href: "/player", label: "Игрок", icon: Gamepad2, description: "Статы и квесты" },
  { href: "/projects", label: "Проекты", icon: FolderKanban, description: "Доска миссий" },
  { href: "/studio", label: "Студия", icon: Building2, description: "Офис агентов" },
  { href: "/command", label: "Команды", icon: Terminal, description: "Чат с Moltbot" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-bg-card">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
          <Swords className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-wide text-text-bright">
            FROGFACE
          </h1>
          <p className="text-[10px] font-medium uppercase tracking-widest text-text-dim">
            Life OS
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map((item) => {
          const active = pathname === item.href;
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
                <p className={cn(
                  "text-[10px]",
                  active ? "text-accent/60" : "text-text-dim/50"
                )}>
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
      </div>
    </aside>
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
