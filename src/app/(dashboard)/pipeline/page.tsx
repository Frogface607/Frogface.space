"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  X,
  Check,
  Pencil,
  Copy,
  ChevronLeft,
  ChevronRight,
  Image,
  Hash,
  Loader2,
  RefreshCw,
  Zap,
  BarChart3,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type ContentPiece,
  type ContentBrand,
  type ContentFormat,
  BRAND_CONFIG,
  FORMAT_LABELS,
} from "@/lib/pipeline";

export default function PipelinePage() {
  const [items, setItems] = useState<ContentPiece[]>([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, published: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showGenerate, setShowGenerate] = useState(false);
  const [filter, setFilter] = useState<"pending" | "approved" | "all">("pending");
  const [swipeAnim, setSwipeAnim] = useState<"left" | "right" | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState("");
  const [copied, setCopied] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const status = filter === "all" ? "" : `?status=${filter}`;
      const res = await fetch(`/api/pipeline${status}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setCounts(data.counts || counts);
      }
    } catch { /* empty */ } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const current = items[currentIdx];

  const handleAction = async (action: "approved" | "rejected" | "edited", text?: string) => {
    if (!current) return;

    setSwipeAnim(action === "rejected" ? "left" : "right");

    const body: Record<string, string> = { id: current.id, status: action };
    if (text) body.edited_text = text;

    await fetch("/api/pipeline", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setTimeout(() => {
      setSwipeAnim(null);
      setEditMode(false);
      const next = items.filter((_, i) => i !== currentIdx);
      setItems(next);
      if (currentIdx >= next.length) setCurrentIdx(Math.max(0, next.length - 1));
      setCounts((c) => ({
        ...c,
        pending: Math.max(0, c.pending - 1),
        [action]: (c[action as keyof typeof c] as number || 0) + 1,
      }));
    }, 300);
  };

  const generate = async (brand: ContentBrand, format: ContentFormat, count: number, topics?: string[]) => {
    setGenerating(true);
    try {
      const res = await fetch("/api/pipeline/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, format, count, topics: topics?.length ? topics : undefined }),
      });
      if (res.ok) {
        setShowGenerate(false);
        setFilter("pending");
        fetchItems();
      }
    } finally {
      setGenerating(false);
    }
  };

  const copyText = () => {
    if (!current) return;
    const text = current.edited_text || current.text;
    const hashtags = current.hashtags?.map((h) => `#${h}`).join(" ") || "";
    navigator.clipboard.writeText(text + (hashtags ? `\n\n${hashtags}` : ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-bright">Контент-конвейер</h1>
          <p className="mt-1 text-sm text-text-dim">AI генерирует — ты одобряешь</p>
        </div>
        <button
          onClick={() => setShowGenerate(!showGenerate)}
          className="flex items-center gap-1.5 rounded-lg bg-accent/20 px-4 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent/30"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Генерировать
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3">
        {([
          { key: "pending", label: "Ожидают", color: "text-gold", emoji: "⏳" },
          { key: "approved", label: "Одобрено", color: "text-xp", emoji: "✅" },
          { key: "rejected", label: "Отклонено", color: "text-hp", emoji: "❌" },
          { key: "published", label: "Опубликовано", color: "text-accent", emoji: "📤" },
        ] as const).map(({ key, label, color, emoji }) => (
          <button
            key={key}
            onClick={() => setFilter(key === "rejected" ? "all" : key as "pending" | "approved")}
            className={cn(
              "rounded-xl border bg-bg-card p-3 text-left transition-all",
              filter === key ? "border-accent" : "border-border",
            )}
          >
            <span className="text-xs text-text-dim">{emoji} {label}</span>
            <p className={cn("mt-1 text-lg font-bold", color)}>
              {counts[key]}
            </p>
          </button>
        ))}
      </div>

      {/* Generate form */}
      {showGenerate && (
        <GenerateForm generating={generating} onGenerate={generate} onClose={() => setShowGenerate(false)} />
      )}

      {/* Tinder-style card */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-text-dim" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-bg-card p-12 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-text-dim/20" />
          <p className="mt-3 text-sm text-text-dim">
            {filter === "pending" ? "Нет контента на проверку" : "Пусто"}
          </p>
          <p className="mt-1 text-xs text-text-dim/50">
            Нажми &quot;Генерировать&quot; чтобы AI создал посты
          </p>
        </div>
      ) : (
        <div className="relative mx-auto max-w-lg">
          {/* Navigation */}
          <div className="mb-3 flex items-center justify-between text-xs text-text-dim">
            <button
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              className="rounded p-1 hover:bg-bg-hover disabled:opacity-20"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span>{currentIdx + 1} / {items.length}</span>
            <button
              onClick={() => setCurrentIdx((i) => Math.min(items.length - 1, i + 1))}
              disabled={currentIdx >= items.length - 1}
              className="rounded p-1 hover:bg-bg-hover disabled:opacity-20"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Card */}
          {current && (
            <div
              className={cn(
                "rounded-2xl border border-border bg-bg-card transition-all duration-300",
                swipeAnim === "left" && "-translate-x-full rotate-[-8deg] opacity-0",
                swipeAnim === "right" && "translate-x-full rotate-[8deg] opacity-0",
              )}
            >
              {/* Brand header */}
              <div className={cn(
                "flex items-center justify-between rounded-t-2xl bg-gradient-to-r px-5 py-3",
                BRAND_CONFIG[current.brand].gradient,
              )}>
                <div>
                  <span className="text-sm font-bold text-white">
                    {BRAND_CONFIG[current.brand].name}
                  </span>
                  <span className="ml-2 rounded bg-white/20 px-2 py-0.5 text-[10px] text-white">
                    {FORMAT_LABELS[current.format]}
                  </span>
                </div>
                <span className="text-[10px] text-white/70">
                  {new Date(current.created).toLocaleString("ru-RU", {
                    hour: "2-digit", minute: "2-digit", day: "numeric", month: "short",
                  })}
                </span>
              </div>

              {/* Topic */}
              <div className="border-b border-border px-5 py-2">
                <p className="text-[10px] font-medium uppercase tracking-wider text-text-dim">Тема</p>
                <p className="text-xs text-text">{current.topic}</p>
              </div>

              {/* Content */}
              <div className="px-5 py-4">
                {editMode ? (
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={8}
                    className="w-full rounded-lg border border-accent/30 bg-bg-deep px-3 py-2 text-sm leading-relaxed text-text-bright focus:border-accent focus:outline-none"
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-bright">
                    {current.edited_text || current.text}
                  </p>
                )}
              </div>

              {/* Image prompt */}
              {current.image_prompt && (
                <div className="border-t border-border px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    <Image className="h-3 w-3 text-text-dim" />
                    <span className="text-[10px] font-medium uppercase tracking-wider text-text-dim">
                      Промпт для картинки
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] italic text-text-dim/70">{current.image_prompt}</p>
                </div>
              )}

              {/* Hashtags */}
              {current.hashtags && current.hashtags.length > 0 && (
                <div className="border-t border-border px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    <Hash className="h-3 w-3 text-text-dim" />
                    <div className="flex flex-wrap gap-1.5">
                      {current.hashtags.map((h) => (
                        <span key={h} className="rounded bg-accent/10 px-2 py-0.5 text-[10px] text-accent">
                          #{h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-4 rounded-b-2xl border-t border-border bg-bg-deep/30 px-5 py-4">
                <button
                  onClick={() => handleAction("rejected")}
                  className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-hp/30 text-hp transition-all hover:scale-110 hover:border-hp hover:bg-hp/10"
                  title="Отклонить"
                >
                  <X className="h-6 w-6" />
                </button>

                {editMode ? (
                  <button
                    onClick={() => { handleAction("edited", editText); }}
                    className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-xp/30 text-xp transition-all hover:scale-110 hover:border-xp hover:bg-xp/10"
                    title="Сохранить правку"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => { setEditMode(true); setEditText(current.edited_text || current.text); }}
                    className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gold/30 text-gold transition-all hover:scale-110 hover:border-gold hover:bg-gold/10"
                    title="Редактировать"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                )}

                <button
                  onClick={copyText}
                  className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-mana/30 text-mana transition-all hover:scale-110 hover:border-mana hover:bg-mana/10"
                  title="Скопировать"
                >
                  <Copy className={cn("h-5 w-5", copied && "text-xp")} />
                </button>

                <button
                  onClick={() => handleAction("approved")}
                  className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-xp/30 text-xp transition-all hover:scale-110 hover:border-xp hover:bg-xp/10"
                  title="Одобрить"
                >
                  <Check className="h-6 w-6" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GenerateForm({
  generating,
  onGenerate,
  onClose,
}: {
  generating: boolean;
  onGenerate: (brand: ContentBrand, format: ContentFormat, count: number, topics?: string[]) => void;
  onClose: () => void;
}) {
  const [brand, setBrand] = useState<ContentBrand>("myreply");
  const [format, setFormat] = useState<ContentFormat>("tg_post");
  const [count, setCount] = useState(5);
  const [topicsRaw, setTopicsRaw] = useState("");

  return (
    <div className="rounded-2xl border border-accent/30 bg-bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-accent flex items-center gap-2">
          <Zap className="h-4 w-4" /> Запуск генерации
        </p>
        <button onClick={onClose} className="text-text-dim hover:text-text">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Brand selector */}
      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-text-dim">Бренд</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(Object.entries(BRAND_CONFIG) as [ContentBrand, typeof BRAND_CONFIG[ContentBrand]][]).map(
            ([key, cfg]) => (
              <button
                key={key}
                onClick={() => setBrand(key)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all",
                  brand === key ? "border-accent bg-accent/10" : "border-border hover:border-border/80",
                )}
              >
                <p className={cn("text-xs font-medium", cfg.color)}>{cfg.name}</p>
                <p className="mt-0.5 text-[10px] text-text-dim/50 line-clamp-1">{cfg.voice.split(".")[0]}</p>
              </button>
            ),
          )}
        </div>
      </div>

      {/* Format */}
      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-text-dim">Формат</p>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(FORMAT_LABELS) as [ContentFormat, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFormat(key)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs transition-colors",
                format === key ? "bg-accent/20 text-accent" : "bg-bg-deep text-text-dim hover:text-text",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-text-dim">
          Количество: {count}
        </p>
        <input
          type="range"
          min={1}
          max={10}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-full accent-accent"
        />
      </div>

      {/* Custom topics */}
      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-text-dim">
          Темы (по одной на строку, или оставь пустым для авто)
        </p>
        <textarea
          value={topicsRaw}
          onChange={(e) => setTopicsRaw(e.target.value)}
          rows={3}
          placeholder="AI сам подберёт темы для бренда..."
          className="w-full rounded-lg border border-border bg-bg-deep px-3 py-2 text-xs text-text placeholder:text-text-dim/30 focus:border-accent focus:outline-none"
        />
      </div>

      <button
        onClick={() => {
          const topics = topicsRaw.split("\n").map((l) => l.trim()).filter(Boolean);
          onGenerate(brand, format, count, topics.length ? topics : undefined);
        }}
        disabled={generating}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-medium text-bg-deep transition-colors hover:bg-accent-dim disabled:opacity-50"
      >
        {generating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Генерирую {count} постов...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Сгенерировать {count} постов
          </>
        )}
      </button>

      <p className="text-center text-[10px] text-text-dim/50">
        OpenClaw на VPS — работает бесплатно. Можно запускать ночью.
      </p>
    </div>
  );
}
