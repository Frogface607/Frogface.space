import { NextRequest } from "next/server";
import {
  type ContentPiece,
  type ContentBrand,
  type ContentFormat,
  BRAND_CONFIG,
  generateContentId,
} from "@/lib/pipeline";
import { kvGet, kvSet, logAppend } from "@/lib/storage";

const KV_KEY = "content_pipeline";

function checkAuth(req: NextRequest): boolean {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const secret = process.env.API_SECRET;
  if (!secret) return true;
  return token === secret;
}

function buildPrompt(brand: ContentBrand, format: ContentFormat, topic: string): string {
  const cfg = BRAND_CONFIG[brand];
  const formatMap: Record<ContentFormat, string> = {
    tg_post: "пост для Telegram-канала (200-400 символов, с эмодзи, вовлекающий)",
    story: "текст для Instagram/Telegram сторис (1-3 коротких предложения, CTA)",
    reel_script: "сценарий для короткого видео Reels/Shorts (30-60 сек, по кадрам)",
    article: "развёрнутый пост/статья (500-800 символов, с экспертизой)",
    tweet: "короткий пост-мысль (до 200 символов, ёмко и цепляюще)",
  };

  return [
    `Ты — контент-мейкер для бренда "${cfg.name}".`,
    `Голос бренда: ${cfg.voice}`,
    ``,
    `Создай ${formatMap[format]}.`,
    `Тема: ${topic}`,
    ``,
    `ФОРМАТ ОТВЕТА (строго JSON, без markdown):`,
    `{`,
    `  "text": "готовый текст поста",`,
    `  "image_prompt": "промпт для генерации картинки к посту (английский, для Midjourney/DALL-E стиль)",`,
    `  "hashtags": ["хэштег1", "хэштег2", "хэштег3"]`,
    `}`,
    ``,
    `Пиши сразу готовый текст, не абстракцию. Русский язык.`,
  ].join("\n");
}

async function generateOne(
  brand: ContentBrand, format: ContentFormat, topic: string,
): Promise<ContentPiece | null> {
  const prompt = buildPrompt(brand, format, topic);
  const openclawUrl = process.env.OPENCLAW_URL;
  const openclawToken = process.env.OPENCLAW_GATEWAY_TOKEN;
  const openrouterKey = process.env.OPENROUTER_API_KEY;

  let responseText = "";

  if (openclawUrl && openclawToken) {
    try {
      const res = await fetch(`${openclawUrl}/v1/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${openclawToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "anthropic/claude-sonnet-4",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1024,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        responseText = data.choices?.[0]?.message?.content || "";
      }
    } catch { /* fall through */ }
  }

  if (!responseText && openrouterKey) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openrouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://frogface.space",
          "X-Title": "Frogface Pipeline",
        },
        body: JSON.stringify({
          model: "anthropic/claude-haiku-4.5",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1024,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        responseText = data.choices?.[0]?.message?.content || "";
      }
    } catch { /* no backend */ }
  }

  if (!responseText) return null;

  let parsed: { text?: string; image_prompt?: string; hashtags?: string[] };
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { text: responseText };
  } catch {
    parsed = { text: responseText };
  }

  return {
    id: generateContentId(),
    brand, format, topic,
    text: parsed.text || responseText,
    image_prompt: parsed.image_prompt,
    hashtags: parsed.hashtags,
    status: "pending",
    created: new Date().toISOString(),
  };
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try { body = await req.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { brand = "myreply", format = "tg_post", topics, count = 1 } = body as {
    brand?: ContentBrand; format?: ContentFormat; topics?: string[]; count?: number;
  };

  const defaultTopics: Record<ContentBrand, string[]> = {
    myreply: [
      "Как AI отвечает на отзывы за 3 секунды",
      "Почему бизнесу нельзя игнорировать отзывы",
      "Кейс: ресторан увеличил рейтинг с 4.1 до 4.7",
      "Сколько стоит плохой отзыв без ответа",
      "AI vs человек: кто лучше отвечает на отзывы",
      "5 ошибок при ответе на негативный отзыв",
      "Как автоматизировать репутацию за 490₽/мес",
    ],
    edison: [
      "Сегодня в Edison: живая музыка + крафтовое пиво",
      "Новое блюдо от шефа — попробуй первым",
      "Пятничный вечер в Edison Bar",
      "Винная карта обновлена — 3 новых позиции",
      "Edison Bar: место где рождаются истории",
    ],
    frogface: [
      "Как я автоматизировал свою жизнь с помощью AI",
      "RPG-система для управления бизнесом",
      "Почему я заменил 5 сотрудников AI-агентами",
      "Мой пульт управления жизнью — frogface.space",
    ],
    personal: [
      "Я устал бежать. И впервые просто иду.",
      "9 лет в ресторанном бизнесе — и вот что я понял",
      "AI не заменит творца. Но освободит руки.",
    ],
  };

  const topicList = topics || defaultTopics[brand] || defaultTopics.myreply;
  const n = Math.min(count, 10);
  const generated: ContentPiece[] = [];

  for (let i = 0; i < n; i++) {
    const topic = topicList[i % topicList.length];
    const piece = await generateOne(brand, format, topic);
    if (piece) generated.push(piece);
  }

  if (generated.length === 0) {
    return Response.json({ error: "No AI backend available" }, { status: 502 });
  }

  const existing = await kvGet<ContentPiece[]>(KV_KEY, []);
  await kvSet(KV_KEY, [...generated, ...existing]);
  await logAppend({
    source: "pipeline", type: "log",
    text: `Сгенерировано ${generated.length} постов (${BRAND_CONFIG[brand].name}, ${format})`,
  });

  return Response.json({ ok: true, generated: generated.length, pieces: generated });
}
