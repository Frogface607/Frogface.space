import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storyId, storyTitle, setting, dayNumber, previousEvents } = body;

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

    if (apiKey) {
      const isOpenRouter = !!process.env.OPENROUTER_API_KEY;
      const baseUrl = isOpenRouter
        ? 'https://openrouter.ai/api/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

      const model = isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini';

      const prompt = `Ты — журналист, пишущий о событиях в альтернативной реальности интерактивной истории.

МИР: "${storyTitle}"
СЕТТИНГ: ${setting}
ДЕНЬ: ${dayNumber} (после основных событий истории)
${previousEvents ? `ПРЕДЫДУЩИЕ СОБЫТИЯ: ${previousEvents}` : ''}

ЗАДАЧА: Напиши новостную заметку о том, что происходит в мире истории ПОСЛЕ основных событий. Ответь в JSON:

{
  "headline": "Заголовок (интригующий, 5-8 слов)",
  "content": "Текст заметки (150-200 слов, разговорный стиль, интриги, слухи, твисты. Покажи что персонажи живут своей жизнью)"
}

СТИЛЬ:
- Как пост ВКонтакте 2008 года
- Разговорный, живой
- Интригующий (намёки, тайны)
- Упоминай конкретных персонажей
- Намекай на неожиданные повороты`;

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
          temperature: 0.9,
          max_tokens: 350,
          response_format: { type: 'json_object' },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return NextResponse.json({
            storyId,
            day: dayNumber,
            date: new Date().toISOString(),
            headline: parsed.headline,
            content: parsed.content,
          });
        }
      }
    }

    return NextResponse.json(getFallbackNewspaper(storyId, dayNumber));
  } catch {
    return NextResponse.json(getFallbackNewspaper('unknown', 1));
  }
}

function getFallbackNewspaper(storyId: string, dayNumber: number) {
  const papers = [
    {
      headline: 'Школу №47 ждут перемены',
      content:
        'Алина Соколова больше не появляется в школе. Одноклассники говорят, что она уехала к тёте в Москву. Но Максим клянётся, что видел её вчера у старого крыла — она разговаривала с незнакомым мужчиной в костюме.\n\nДенис Волков опубликовал пост ВКонтакте: "Иногда правда дороже дружбы. Иногда — нет." 83 комментария. Школа разделилась на два лагеря.\n\nА директор Беляев неожиданно взял больничный. Второй день подряд. Секретарша Нина Павловна говорит — "сердце". Но кто-то видел его машину у здания прокуратуры.',
    },
    {
      headline: 'В школьном чате война',
      content:
        'Анонимный аккаунт "Правда_47" выложил скан каких-то документов. Половина считает это фейком, половина — бомбой. Классная Мария Ивановна попросила всех "не распространять слухи и готовиться к экзаменам".\n\nАлина вернулась. Но что-то изменилось — она больше не разговаривает с Денисом. Совсем. А ведь они были неразлучны с девятого класса.\n\nСтранная деталь: в старом крыле заменили замок. Никто не помнит, чтобы его меняли последние лет пять. Зачем сейчас?',
    },
    {
      headline: 'Неожиданный визит в школу №47',
      content:
        'Утром к школе подъехала чёрная Волга с московскими номерами. Два человека в костюмах прошли прямо к кабинету директора. Беляев вернулся из "больничного" как по волшебству.\n\nДенис написал в личку классу: "Завтра всё узнаете. Просто будьте в школе." Никаких объяснений.\n\nАлина сменила аватарку ВКонтакте на чёрный квадрат. 47 человек поставили лайк. Совпадение? Школа №47. 47 лайков.',
    },
  ];

  const paper = papers[(dayNumber - 1) % papers.length];

  return {
    storyId,
    day: dayNumber,
    date: new Date().toISOString(),
    ...paper,
  };
}
