"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Brain,
  Zap,
  Target,
  ChevronRight,
  Plus,
  X,
  Sparkles,
  Crown,
  TrendingUp,
  Truck,
  Star,
  Globe,
  CheckCircle2,
  Circle,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── TYPES ──────────────────────────────────────────────

interface MindNode {
  id: string;
  label: string;
  type: "project" | "quest" | "idea" | "blocker" | "agent" | "goal";
  status?: "active" | "done" | "blocked" | "idea";
  color: string;
  x: number;
  y: number;
  parent?: string;
  children: string[];
  details?: string;
  xp?: number;
  priority?: string;
}

// ─── INITIAL MAP ────────────────────────────────────────

const INITIAL_NODES: MindNode[] = [
  // Center: Boss
  {
    id: "boss",
    label: "БОСС",
    type: "goal",
    color: "#a78bfa",
    x: 50,
    y: 50,
    children: ["edison", "myreply", "frogface", "vision"],
    details: "Сергей · Архитектор · Бангкок",
  },

  // Edison cluster
  {
    id: "edison",
    label: "Edison Bar",
    type: "project",
    status: "active",
    color: "#fbbf24",
    x: 20,
    y: 25,
    parent: "boss",
    children: ["ed-delivery", "ed-menu", "ed-marketing"],
    details: "888 бронирований · 68 событий · 137 позиций меню",
  },
  {
    id: "ed-delivery",
    label: "Доставка",
    type: "quest",
    status: "active",
    color: "#fbbf24",
    x: 8,
    y: 12,
    parent: "edison",
    children: ["ed-del-pwa", "ed-del-courier", "ed-del-premiera"],
    details: "Своя доставка без Яндекс.Еды",
    priority: "boss",
    xp: 500,
  },
  {
    id: "ed-del-pwa",
    label: "PWA трекинг",
    type: "quest",
    status: "idea",
    color: "#fbbf24",
    x: 3,
    y: 5,
    parent: "ed-delivery",
    children: [],
    details: "Страница доставки + трекинг курьера",
    xp: 300,
  },
  {
    id: "ed-del-courier",
    label: "Курьеры",
    type: "quest",
    status: "idea",
    color: "#fbbf24",
    x: 8,
    y: 3,
    parent: "ed-delivery",
    children: [],
    details: "Начать с 1 курьера, масштабировать",
    xp: 200,
  },
  {
    id: "ed-del-premiera",
    label: "Премьера",
    type: "quest",
    status: "active",
    color: "#fbbf24",
    x: 15,
    y: 5,
    parent: "ed-delivery",
    children: [],
    details: "Коллаб с шеф-поваром Михно. Булки + совместные курьеры",
    xp: 200,
  },
  {
    id: "ed-menu",
    label: "Новое меню",
    type: "quest",
    status: "active",
    color: "#fbbf24",
    x: 10,
    y: 35,
    parent: "edison",
    children: [],
    details: "/new/menu → довести до прода",
    priority: "critical",
    xp: 400,
  },
  {
    id: "ed-marketing",
    label: "Маркетинг",
    type: "quest",
    status: "active",
    color: "#fbbf24",
    x: 28,
    y: 12,
    parent: "edison",
    children: [],
    details: "TG-канал, реклама, контент. ПРИОРИТЕТ #1",
    priority: "boss",
    xp: 500,
  },

  // MyReply cluster
  {
    id: "myreply",
    label: "MyReply",
    type: "project",
    status: "active",
    color: "#34d399",
    x: 75,
    y: 20,
    parent: "boss",
    children: ["mr-launch", "mr-promo", "mr-users"],
    details: "my-reply.ru · Лайв · 0 юзеров · YuKassa",
  },
  {
    id: "mr-launch",
    label: "Soft Launch",
    type: "quest",
    status: "active",
    color: "#34d399",
    x: 85,
    y: 8,
    parent: "myreply",
    children: [],
    details: "Первый реальный пользователь",
    priority: "boss",
    xp: 800,
  },
  {
    id: "mr-promo",
    label: "Промокоды",
    type: "quest",
    status: "active",
    color: "#34d399",
    x: 90,
    y: 20,
    parent: "myreply",
    children: [],
    details: "Завтра: Маша, Михно, Саша",
    priority: "critical",
    xp: 300,
  },
  {
    id: "mr-users",
    label: "10 платящих",
    type: "goal",
    status: "idea",
    color: "#34d399",
    x: 92,
    y: 32,
    parent: "myreply",
    children: [],
    details: "Цель: 10 платящих клиентов → разблокировать cold outreach",
    xp: 1000,
  },

  // Frogface cluster
  {
    id: "frogface",
    label: "Frogface",
    type: "project",
    status: "active",
    color: "#818cf8",
    x: 30,
    y: 75,
    parent: "boss",
    children: ["ff-agency", "ff-rpg", "ff-supabase"],
    details: "Life OS · Командный центр · RPG",
  },
  {
    id: "ff-agency",
    label: "Agency",
    type: "quest",
    status: "active",
    color: "#818cf8",
    x: 15,
    y: 85,
    parent: "frogface",
    children: [],
    details: "Mission Control · 4 лягухи · Чат с Claude",
    priority: "critical",
    xp: 500,
  },
  {
    id: "ff-rpg",
    label: "RPG система",
    type: "quest",
    status: "idea",
    color: "#818cf8",
    x: 30,
    y: 92,
    parent: "frogface",
    children: [],
    details: "Реальные статы из Supabase/Git. Skill tree",
    xp: 300,
  },
  {
    id: "ff-supabase",
    label: "Live Data",
    type: "quest",
    status: "idea",
    color: "#818cf8",
    x: 45,
    y: 88,
    parent: "frogface",
    children: [],
    details: "Подключить живые данные вместо хардкода",
    xp: 300,
  },

  // Vision
  {
    id: "vision",
    label: "1M$ МЕЧТА",
    type: "goal",
    color: "#f87171",
    x: 78,
    y: 70,
    parent: "boss",
    children: ["v-condo", "v-freedom"],
    details: "Лакшери кондо Бангкок · AR очки · Полная свобода",
  },
  {
    id: "v-condo",
    label: "Кондо BKK",
    type: "goal",
    status: "idea",
    color: "#f87171",
    x: 88,
    y: 60,
    parent: "vision",
    children: [],
    details: "Высокий этаж, огромные мониторы, лакшери",
  },
  {
    id: "v-freedom",
    label: "Свобода",
    type: "goal",
    status: "idea",
    color: "#f87171",
    x: 90,
    y: 80,
    parent: "vision",
    children: [],
    details: "Агентство зарабатывает автономно. Минимум участия.",
  },
];

// ─── ICONS ──────────────────────────────────────────────

function NodeIcon({ type, priority }: { type: string; priority?: string }) {
  if (priority === "boss") return <Crown className="h-3 w-3" />;
  switch (type) {
    case "project": return <Globe className="h-3 w-3" />;
    case "quest": return <Target className="h-3 w-3" />;
    case "idea": return <Sparkles className="h-3 w-3" />;
    case "blocker": return <AlertTriangle className="h-3 w-3" />;
    case "goal": return <Star className="h-3 w-3" />;
    default: return <Circle className="h-3 w-3" />;
  }
}

// ─── MAIN PAGE ──────────────────────────────────────────

export default function MindmapPage() {
  const [nodes] = useState<MindNode[]>(INITIAL_NODES);
  const [selected, setSelected] = useState<MindNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-node]")) return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [dragging, dragStart]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.3, Math.min(2, z - e.deltaY * 0.001)));
  }, []);

  return (
    <div className="noise grid-bg relative flex h-[calc(100vh-4rem)] flex-col lg:h-screen">
      <div className="pointer-events-none absolute inset-0 radial-accent" />

      {/* Header */}
      <div className="relative z-20 flex items-center justify-between border-b border-border/30 bg-bg-deep/80 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-accent" />
          <h1 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-text-bright">
            Лабиринты разума
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.min(2, z + 0.2))}
            className="rounded-lg bg-bg-elevated px-2 py-1 text-xs text-text-dim hover:text-text"
          >+</button>
          <span className="text-[10px] tabular-nums text-text-dim/40">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.max(0.3, z - 0.2))}
            className="rounded-lg bg-bg-elevated px-2 py-1 text-xs text-text-dim hover:text-text"
          >-</button>
          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="rounded-lg bg-bg-elevated px-2 py-1 text-[10px] text-text-dim hover:text-text"
          >Reset</button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative z-10 flex-1 cursor-grab overflow-hidden active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          className="absolute inset-0 origin-center transition-transform duration-100"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {/* Connection lines */}
          <svg className="absolute inset-0 h-full w-full" style={{ pointerEvents: "none" }}>
            {nodes.map((node) =>
              node.parent ? (
                <ConnectionLine
                  key={`line-${node.id}`}
                  from={nodes.find((n) => n.id === node.parent)!}
                  to={node}
                  color={node.color}
                />
              ) : null,
            )}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              data-node
              onClick={() => setSelected(node)}
              className={cn(
                "absolute cursor-pointer transition-all duration-300 hover:scale-110",
                selected?.id === node.id && "scale-110",
              )}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className={cn(
                  "glass rounded-xl px-3 py-2 transition-all",
                  selected?.id === node.id && "ring-1",
                  node.status === "done" && "opacity-50",
                )}
                style={{
                  borderColor: `${node.color}30`,
                  boxShadow: selected?.id === node.id
                    ? `0 0 20px ${node.color}30, 0 0 0 1px ${node.color}60`
                    : `0 0 8px ${node.color}10`,
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span style={{ color: node.color }}>
                    <NodeIcon type={node.type} priority={node.priority} />
                  </span>
                  <span
                    className={cn(
                      "whitespace-nowrap text-xs font-semibold",
                      node.id === "boss" ? "font-display text-sm" : "",
                    )}
                    style={{ color: node.color }}
                  >
                    {node.label}
                  </span>
                  {node.xp && (
                    <span className="text-[9px] text-xp/50">+{node.xp}</span>
                  )}
                </div>
                {node.id === "boss" && (
                  <p className="mt-0.5 text-[9px] text-text-dim/40">{node.details}</p>
                )}
              </div>

              {/* Status dot */}
              {node.status && (
                <div
                  className={cn(
                    "absolute -right-1 -top-1 h-2 w-2 rounded-full",
                    node.status === "active" && "bg-xp animate-pulse",
                    node.status === "done" && "bg-text-dim/30",
                    node.status === "blocked" && "bg-hp animate-pulse",
                    node.status === "idea" && "bg-mana/50",
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="absolute bottom-4 left-4 right-4 z-30 animate-fade-in lg:left-auto lg:right-4 lg:w-80">
          <div className="glass glow-accent rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span style={{ color: selected.color }}>
                  <NodeIcon type={selected.type} priority={selected.priority} />
                </span>
                <h3 className="font-display text-sm font-bold text-text-bright">
                  {selected.label}
                </h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-1 text-text-dim/30 hover:text-text-dim"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {selected.details && (
              <p className="mt-2 text-xs leading-relaxed text-text-dim/70">
                {selected.details}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {selected.status && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium",
                    selected.status === "active" && "bg-xp/10 text-xp",
                    selected.status === "done" && "bg-text-dim/10 text-text-dim",
                    selected.status === "blocked" && "bg-hp/10 text-hp",
                    selected.status === "idea" && "bg-mana/10 text-mana",
                  )}
                >
                  {selected.status === "active" ? "Активно" :
                   selected.status === "done" ? "Готово" :
                   selected.status === "blocked" ? "Заблокировано" : "Идея"}
                </span>
              )}
              {selected.priority && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium",
                    selected.priority === "boss" && "bg-gold/10 text-gold",
                    selected.priority === "critical" && "bg-hp/10 text-hp",
                  )}
                >
                  {selected.priority === "boss" ? "БОСС" : "КРИТ"}
                </span>
              )}
              {selected.xp && (
                <span className="rounded-full bg-xp/10 px-2 py-0.5 text-[10px] font-medium text-xp">
                  +{selected.xp} XP
                </span>
              )}
            </div>

            {selected.children.length > 0 && (
              <div className="mt-3 border-t border-border/20 pt-2">
                <p className="text-[10px] text-text-dim/30">Связи:</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selected.children.map((childId) => {
                    const child = nodes.find((n) => n.id === childId);
                    return child ? (
                      <button
                        key={childId}
                        onClick={() => setSelected(child)}
                        className="flex items-center gap-1 rounded-lg bg-bg-elevated px-2 py-1 text-[10px] text-text-dim/60 transition-colors hover:text-text-dim"
                      >
                        <ChevronRight className="h-2.5 w-2.5" />
                        {child.label}
                      </button>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CONNECTION LINE ────────────────────────────────────

function ConnectionLine({ from, to, color }: { from: MindNode; to: MindNode; color: string }) {
  if (!from) return null;
  const x1 = `${from.x}%`;
  const y1 = `${from.y}%`;
  const x2 = `${to.x}%`;
  const y2 = `${to.y}%`;

  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={`${color}20`}
      strokeWidth="1"
      strokeDasharray="4 4"
    />
  );
}
