export type ContentStatus = "pending" | "approved" | "rejected" | "edited" | "published";
export type ContentBrand = "myreply" | "edison" | "frogface" | "personal";
export type ContentFormat = "tg_post" | "story" | "reel_script" | "article" | "tweet";

export interface ContentPiece {
  id: string;
  brand: ContentBrand;
  format: ContentFormat;
  topic: string;
  text: string;
  image_prompt?: string;
  hashtags?: string[];
  status: ContentStatus;
  edited_text?: string;
  created: string;
  reviewed?: string;
}

export const BRAND_CONFIG: Record<ContentBrand, {
  name: string;
  color: string;
  voice: string;
  gradient: string;
}> = {
  myreply: {
    name: "MyReply",
    color: "text-blue-400",
    gradient: "from-blue-500 to-cyan-400",
    voice: "Дерзкий, без буллшита. «Мы освобождаем ваше время». Тёмный, tech-стиль.",
  },
  edison: {
    name: "Edison Bar",
    color: "text-amber-400",
    gradient: "from-amber-500 to-orange-400",
    voice: "Тёплый, гастрономический, с юмором. Industrial, крафт. Иркутск.",
  },
  frogface: {
    name: "Frogface",
    color: "text-violet-400",
    gradient: "from-violet-500 to-purple-400",
    voice: "Гиковский, с RPG-отсылками. Про AI, автоматизацию, стартапы. Честный.",
  },
  personal: {
    name: "Личный бренд",
    color: "text-xp",
    gradient: "from-green-500 to-emerald-400",
    voice: "Сергей Орлов. Честный, не инфоцыганский. «Я устал бежать».",
  },
};

export const FORMAT_LABELS: Record<ContentFormat, string> = {
  tg_post: "TG пост",
  story: "Сторис",
  reel_script: "Рилс скрипт",
  article: "Статья",
  tweet: "Твит",
};

export function generateContentId(): string {
  return `CP-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
}
