import { NextRequest, NextResponse } from 'next/server';

const RARITY_MAP: Record<string, { label: string; percentRange: [number, number] }> = {
  faithful_protector: { label: 'common', percentRange: [30, 45] },
  compromise: { label: 'common', percentRange: [20, 30] },
  selfless_saint: { label: 'uncommon', percentRange: [12, 20] },
  lone_wolf: { label: 'rare', percentRange: [5, 12] },
  cold_calculator: { label: 'rare', percentRange: [3, 8] },
  silent_revenge: { label: 'epic', percentRange: [1.5, 4] },
  sacrifice: { label: 'epic', percentRange: [1, 3] },
  chaos_agent: { label: 'legendary', percentRange: [0.2, 1.5] },
};

function randomInRange(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storyTitle, setting, endingType, traitProfile, choiceHistory, tags } = body;

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

    if (apiKey) {
      const isOpenRouter = !!process.env.OPENROUTER_API_KEY;
      const baseUrl = isOpenRouter
        ? 'https://openrouter.ai/api/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

      const model = isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini';

      const prompt = `Ты — мастер интерактивных историй и психолог.

КОНТЕКСТ:
История: "${storyTitle}"
Сеттинг: ${setting}
Тип концовки: ${endingType}
Профиль трейтов: ${traitProfile}
Теги поведения: ${JSON.stringify(tags)}
История выборов: ${JSON.stringify(choiceHistory)}

ЗАДАЧА:
Создай уникальную концовку для этого игрока. Ответь СТРОГО в формате JSON:
{
  "title": "Название концовки (3-5 слов, яркое, запоминающееся)",
  "description": "Эмоциональное описание концовки (3-4 предложения, показывающие последствия выборов игрока, его путь и судьбу)",
  "psychotype": "Психологический тип игрока (1 яркая фраза)"
}

ПРАВИЛА:
- Отражай уникальные трейты и выборы игрока
- Используй эмоциональный, кинематографичный язык
- Покажи последствия конкретных решений
- Не используй клише
- Пиши на русском`;

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          ...(isOpenRouter && { 'HTTP-Referer': 'https://8fates.app' }),
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.85,
          max_tokens: 400,
          response_format: { type: 'json_object' },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (content) {
          const parsed = JSON.parse(content);
          const rarityInfo = RARITY_MAP[endingType] || RARITY_MAP.compromise;

          return NextResponse.json({
            type: endingType,
            title: parsed.title,
            description: parsed.description,
            psychotype: parsed.psychotype,
            dominantTrait: JSON.parse(traitProfile).dominant,
            rarity: rarityInfo.label,
            rarityPercent: randomInRange(...rarityInfo.percentRange),
          });
        }
      }
    }

    return NextResponse.json(generateFallbackEnding(endingType, traitProfile));
  } catch {
    return NextResponse.json(
      generateFallbackEnding('compromise', '{}'),
      { status: 200 }
    );
  }
}

function generateFallbackEnding(endingType: string, traitProfile: string) {
  const rarityInfo = RARITY_MAP[endingType] || RARITY_MAP.compromise;

  const ENDINGS: Record<string, { title: string; description: string; psychotype: string }> = {
    faithful_protector: {
      title: 'Верность превыше всего',
      description:
        'Ты выбрал сторону тех, кто в тебе нуждался. Цена была высока — но ты заплатил её не задумываясь. В мире, где все считают выгоду, ты остался человеком.',
      psychotype: 'Хранитель обещаний',
    },
    compromise: {
      title: 'Мастер баланса',
      description:
        'Ты нашёл путь между огнём и льдом. Не предал никого — но и не стал героем. Иногда мудрость — это знать, когда промолчать.',
      psychotype: 'Дипломат серых зон',
    },
    selfless_saint: {
      title: 'Правда дороже покоя',
      description:
        'Ты выбрал правду, даже когда она разрушала привычный мир. Не ради славы — ради тех, кто не мог говорить за себя.',
      psychotype: 'Голос справедливости',
    },
    lone_wolf: {
      title: 'Путь одиночки',
      description:
        'Ты рискнул всем — и выиграл свободу. Один против системы, один против мира. Одиночество — это цена, которую платят за независимость.',
      psychotype: 'Неприрученный волк',
    },
    cold_calculator: {
      title: 'Холодный расчёт',
      description:
        'Каждый шаг — просчитан. Каждая эмоция — под контролем. Ты выиграл партию, но проиграл что-то, чему нет названия.',
      psychotype: 'Шахматист без сердца',
    },
    silent_revenge: {
      title: 'Тихая и точная месть',
      description:
        'Ты не кричал и не размахивал кулаками. Ты просто подождал — и нанёс удар, когда никто не ожидал. Месть, поданная холодной.',
      psychotype: 'Терпеливый мститель',
    },
    sacrifice: {
      title: 'Самопожертвование',
      description:
        'Ты отдал больше, чем от тебя просили. Не потому что должен — потому что не мог иначе. Мир не заслуживал такой жертвы, но ты всё равно её принёс.',
      psychotype: 'Тот, кто горит ради других',
    },
    chaos_agent: {
      title: 'Хаос и пламя',
      description:
        'Ты поджёг мосты, правила и ожидания. Когда система гниёт — иногда единственный выход это взрыв. Из пепла рождается что-то новое.',
      psychotype: 'Поджигатель порядка',
    },
  };

  const ending = ENDINGS[endingType] || ENDINGS.compromise;
  let dominant = 'pragmatism';
  try {
    dominant = JSON.parse(traitProfile).dominant || 'pragmatism';
  } catch {}

  return {
    type: endingType,
    ...ending,
    dominantTrait: dominant,
    rarity: rarityInfo.label,
    rarityPercent: randomInRange(...rarityInfo.percentRange),
  };
}
