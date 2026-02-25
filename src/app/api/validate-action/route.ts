import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, beat, story, currentTraits } = body;

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

    if (apiKey) {
      const isOpenRouter = !!process.env.OPENROUTER_API_KEY;
      const baseUrl = isOpenRouter
        ? 'https://openrouter.ai/api/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

      const model = isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini';

      const prompt = `Ты — валидатор действий в интерактивной истории. Проверяй на адекватность миру, но давай свободу.

ИСТОРИЯ: "${story.title}"
СЕТТИНГ: ${story.setting}, ${story.year}
СЦЕНА: ${beat.title} — ${beat.narration}

ДЕЙСТВИЕ ИГРОКА: "${action}"

ТЕКУЩИЕ ТРЕЙТЫ: ${JSON.stringify(currentTraits)}

ЗАДАЧА: Оцени, возможно ли это действие в данном мире и ситуации. Ответь СТРОГО в JSON:

Если действие ВОЗМОЖНО:
{
  "valid": true,
  "traitEffects": [{"trait": "loyalty|pragmatism|empathy|violence|risk_taking|moral_flexibility", "delta": число_от_-3_до_3}],
  "tags": ["тег1", "тег2"]
}

Если действие НЕВОЗМОЖНО:
{
  "valid": false,
  "reason": "Краткое объяснение почему (1 предложение, дружелюбно)"
}

ПРАВИЛА ВАЛИДАЦИИ:
- РАЗРЕШАЙ креативные и неожиданные действия (это часть фана!)
- РАЗРЕШАЙ эмоциональные и импульсивные поступки
- ЗАПРЕЩАЙ только физически невозможное для сеттинга (телепортация, магия в реалистичном мире)
- ЗАПРЕЩАЙ абсурд, не связанный с ситуацией ("полететь на луну")
- ЗАПРЕЩАЙ действия с предметами/технологиями, которых нет в сеттинге
- Будь ЛИБЕРАЛЬНЫМ — в сомнительных случаях разрешай
- Назначай 2-3 трейт-эффекта, отражающих суть действия`;

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
          temperature: 0.3,
          max_tokens: 200,
          response_format: { type: 'json_object' },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return NextResponse.json(JSON.parse(content));
        }
      }
    }

    return NextResponse.json({
      valid: true,
      traitEffects: [
        { trait: 'moral_flexibility', delta: 1 },
        { trait: 'risk_taking', delta: 1 },
      ],
      tags: ['custom_action', 'creative'],
    });
  } catch {
    return NextResponse.json({
      valid: true,
      traitEffects: [{ trait: 'moral_flexibility', delta: 1 }],
      tags: ['custom_action'],
    });
  }
}
