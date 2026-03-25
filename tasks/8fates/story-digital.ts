import type { Story } from './types';

export const STORY_DIGITAL: Story = {
  id: 'digital-conscience',
  title: 'Цифровая совесть',
  subtitle: 'Москва. Стартап. Твой AI делает то, о чём лучше не знать.',
  setting: 'Москва, коворкинг, стартап-тусовка',
  year: '2025',
  themes: ['AI', 'этика', 'деньги', 'правда'],
  coverGradient: 'from-cyan-900/80 via-slate-900/60 to-black',

  beats: [
    {
      id: 1,
      type: 'opening',
      title: 'Баг',
      narration: 'Коворкинг на Красном Октябре. Три часа ночи. Ты пьёшь четвёртый скуратовский флэт-уайт и смотришь в дашборд. Твой стартап ReplyBot — AI который отвечает на отзывы для бизнеса — наконец взлетел. Крупный клиент, сеть клиник "МедЛайф", платит 200К в месяц. Но в логах — аномалия. ReplyBot генерирует ответы на отзывы, которых нет. Фейковые отзывы — восторженные, пятизвёздочные — появляются на Яндекс.Картах, а потом ReplyBot сам на них "отвечает". Кто-то использует твой API не по назначению. Ты открываешь код и видишь: это не баг. Кто-то добавил скрипт. И этот кто-то — твой сооснователь Макс.',
      imageHint: 'coworking night moscow laptop dashboard',
      allowCustom: true,
      choices: [
        {
          id: '1a',
          text: 'Позвонить Максу прямо сейчас и потребовать объяснений',
          traitEffects: [
            { trait: 'loyalty', delta: 1 },
            { trait: 'risk_taking', delta: 1 },
            { trait: 'empathy', delta: 1 },
          ],
          tags: ['direct', 'honest', 'confrontation'],
        },
        {
          id: '1b',
          text: 'Сначала собрать все логи и скриншоты. Доказательства — потом разговор',
          traitEffects: [
            { trait: 'pragmatism', delta: 2 },
            { trait: 'risk_taking', delta: 1 },
          ],
          tags: ['strategic', 'careful', 'evidence'],
        },
        {
          id: '1c',
          text: 'Тихо откатить скрипт, не говоря Максу. Проблема решена',
          traitEffects: [
            { trait: 'moral_flexibility', delta: 2 },
            { trait: 'pragmatism', delta: 1 },
          ],
          tags: ['avoidant', 'quiet_fix', 'denial'],
        },
      ],
    },
    {
      id: 2,
      type: 'development',
      title: 'Правда Макса',
      narration: 'Утро. Кофейня "Кооператив Чёрный". Макс приезжает на самокате, в худи с логотипом Y Combinator (они не попали, но худи остался). "Слушай, я хотел тебе сказать. МедЛайф попросили. Не впрямую — через менеджера. Сказали: нам нужен не просто ответ на отзывы, нам нужен рейтинг. Я написал модуль за ночь. Они заплатили 500К сверху. Разово." Он крутит стакан. "Я знаю, что это серая зона. Но у нас runway на два месяца. Без этих денег — всё. Команда. Офис. Три года работы." Он поднимает глаза: "Demo Day через неделю. Если мы покажем рост — раунд закроется."',
      imageHint: 'coffee shop moscow startup founder morning',
      allowCustom: true,
      choices: [
        {
          id: '2a',
          text: '"Макс, это подделка отзывов. Это конец репутации и возможно — суд."',
          traitEffects: [
            { trait: 'empathy', delta: 1 },
            { trait: 'loyalty', delta: -1 },
            { trait: 'pragmatism', delta: 1 },
          ],
          tags: ['ethical', 'worried', 'realistic'],
        },
        {
          id: '2b',
          text: '"500К? Ладно. Но это последний раз. И мы делим 50/50."',
          traitEffects: [
            { trait: 'moral_flexibility', delta: 2 },
            { trait: 'pragmatism', delta: 1 },
          ],
          tags: ['compromise', 'greedy', 'slippery_slope'],
        },
        {
          id: '2c',
          text: '"Я понимаю. Но давай найдём другой способ показать рост до Demo Day"',
          traitEffects: [
            { trait: 'empathy', delta: 2 },
            { trait: 'loyalty', delta: 1 },
          ],
          tags: ['supportive', 'creative', 'team_player'],
        },
      ],
    },
    {
      id: 3,
      type: 'development',
      title: 'Журналистка',
      narration: 'Telegram. Сообщение от Даши Волковой — журналистки VC.ru. "Привет! Пишу расследование о накрутке отзывов AI-сервисами. Хочу поговорить про ReplyBot. Несколько клиник жалуются, что конкуренты используют AI для фейковых отзывов. Есть подозрение что ваш сервис замешан. Можем встретиться?" У тебя холодеет живот. Если она копнёт — найдёт. И это будет не пост в Telegram, а статья на главной VC.ru. Команда ничего не знает. Макс в панике набирает тебе.',
      imageHint: 'telegram notification journalist investigation',
      allowCustom: true,
      choices: [
        {
          id: '3a',
          text: 'Встретиться с Дашей. Рассказать правду. Первым — лучше, чем пойманным',
          traitEffects: [
            { trait: 'risk_taking', delta: 2 },
            { trait: 'empathy', delta: 1 },
            { trait: 'loyalty', delta: -1 },
          ],
          tags: ['whistleblower', 'honest', 'brave'],
        },
        {
          id: '3b',
          text: 'Встретиться, но отрицать всё. Показать "чистый" код без модуля Макса',
          traitEffects: [
            { trait: 'moral_flexibility', delta: 2 },
            { trait: 'pragmatism', delta: 1 },
          ],
          tags: ['deception', 'cover_up', 'strategic'],
        },
        {
          id: '3c',
          text: 'Игнорировать. Не отвечать. Нет комментариев',
          traitEffects: [
            { trait: 'pragmatism', delta: 1 },
            { trait: 'risk_taking', delta: -1 },
          ],
          tags: ['avoidant', 'silent', 'ostrich'],
        },
      ],
    },
    {
      id: 4,
      type: 'development',
      title: 'Demo Day',
      narration: 'Сцена. Софиты. Двести человек в зале — инвесторы, основатели, журналисты. Ты выходишь с презентацией. Слайд: "ReplyBot — рост 340% за квартал". Это правда. Но часть роста — фейковые отзывы МедЛайф. В зале — партнёр фонда, который готов дать $500K. А в третьем ряду сидит Даша Волкова с блокнотом. Макс стоит за кулисами и показывает большой палец. У тебя три минуты на сцене. Микрофон включён.',
      imageHint: 'demo day stage presentation investors spotlight',
      allowCustom: true,
      choices: [
        {
          id: '4a',
          text: 'Показать честные метрики. Убрать МедЛайф из графиков. Рост 180% — тоже неплохо',
          traitEffects: [
            { trait: 'empathy', delta: 2 },
            { trait: 'loyalty', delta: -1 },
            { trait: 'risk_taking', delta: 1 },
          ],
          tags: ['honest', 'brave', 'sacrifice'],
        },
        {
          id: '4b',
          text: 'Показать 340%. Деньги решают. Потом разберёмся',
          traitEffects: [
            { trait: 'pragmatism', delta: 2 },
            { trait: 'moral_flexibility', delta: 2 },
          ],
          tags: ['fraud', 'ambitious', 'deceiver'],
        },
        {
          id: '4c',
          text: 'Сказать со сцены: "Мы нашли проблему в индустрии отзывов. И мы её решаем"',
          traitEffects: [
            { trait: 'risk_taking', delta: 2 },
            { trait: 'pragmatism', delta: 1 },
            { trait: 'empathy', delta: 1 },
          ],
          tags: ['pivot', 'creative', 'visionary'],
        },
      ],
    },
    {
      id: 5,
      type: 'development',
      title: 'Раскол',
      narration: 'После Demo Day. Бар на Патриках. Макс злой. "Ты нас похоронил. Фонд сказал «перезвоним». Это значит — нет." Аня — ваш дизайнер, которая работает за еду уже три месяца — молча смотрит в бокал. Дима — бэкендер — открывает ноут: "Ребят, мне предложили оффер в Яндекс. 450К в месяц. Мне нужен ответ до понедельника." Тишина. За окном — Москва мерцает. Ты построил эту команду. Каждого нашёл сам. И сейчас она разваливается.',
      imageHint: 'bar moscow night team conflict drinks',
      allowCustom: true,
      choices: [
        {
          id: '5a',
          text: '"Дима, я понимаю. Иди. Макс, нам надо поговорить честно. Без этого дальше никак."',
          traitEffects: [
            { trait: 'empathy', delta: 2 },
            { trait: 'loyalty', delta: 1 },
          ],
          tags: ['leader', 'honest', 'empathetic'],
        },
        {
          id: '5b',
          text: '"Никто никуда не уходит. Я найду деньги. Дайте мне неделю."',
          traitEffects: [
            { trait: 'loyalty', delta: 2 },
            { trait: 'risk_taking', delta: 2 },
          ],
          tags: ['desperate', 'leader', 'promises'],
        },
        {
          id: '5c',
          text: '"Может Макс прав. Давайте возьмём ещё клиентов. На любых условиях."',
          traitEffects: [
            { trait: 'moral_flexibility', delta: 2 },
            { trait: 'pragmatism', delta: 1 },
            { trait: 'empathy', delta: -1 },
          ],
          tags: ['dark_path', 'survival', 'compromise'],
        },
      ],
    },
    {
      id: 6,
      type: 'climax',
      title: 'Статья',
      narration: 'Утро понедельника. Телефон разрывается. VC.ru: "AI-сервис ReplyBot уличён в генерации фейковых отзывов для сети клиник МедЛайф." Статья Даши — с логами, скриншотами, комментариями пострадавших клиник. 200 комментариев за час. Телеграм горит. МедЛайф отключился и грозит судом. Фонд отзывает term sheet. Дима ушёл в Яндекс. Аня плачет в туалете коворкинга. Макс не берёт трубку. Ты сидишь один перед экраном. На почте — письмо от Даши: "Прости. Мне надо было это опубликовать."',
      imageHint: 'morning phone notifications crisis article',
      allowCustom: true,
      choices: [
        {
          id: '6a',
          text: 'Написать публичный пост: "Мы ошиблись. Вот что произошло и что мы делаем."',
          traitEffects: [
            { trait: 'empathy', delta: 2 },
            { trait: 'loyalty', delta: 1 },
            { trait: 'risk_taking', delta: 1 },
          ],
          tags: ['accountability', 'honest', 'brave', 'public_truth'],
        },
        {
          id: '6b',
          text: 'Свалить всё на Макса. Он написал код. Он взял деньги. Ты не знал',
          traitEffects: [
            { trait: 'moral_flexibility', delta: 2 },
            { trait: 'pragmatism', delta: 1 },
            { trait: 'loyalty', delta: -3 },
          ],
          tags: ['betrayal', 'survival', 'scapegoat'],
        },
        {
          id: '6c',
          text: 'Тишина. Удалить аккаунты. Начать заново под другим именем',
          traitEffects: [
            { trait: 'pragmatism', delta: 2 },
            { trait: 'violence', delta: 1 },
            { trait: 'empathy', delta: -2 },
          ],
          tags: ['escape', 'coward', 'rebrand'],
        },
      ],
    },
    {
      id: 7,
      type: 'resolution',
      title: 'Перезагрузка',
      narration: 'Месяц спустя. Кофейня у дома. Ноутбук открыт. Новый репозиторий, пустой. Ни одной строчки кода. За окном — весенняя Москва. На телефоне — сообщение от Ани: "Я придумала концепт. Хочешь посмотреть?" И от Макса: "Прости. Я был неправ. Давай поговорим." И от Даши: "Твой пост прочитали 50К человек. Тебе пишут. Люди хотят честный сервис." Ты смотришь на пустой экран. Курсор мигает. Что напишешь?',
      imageHint: 'coffee shop spring laptop new beginning cursor',
      allowCustom: true,
      choices: [
        {
          id: '7a',
          text: 'Открыть чат с Аней и Максом: "Завтра в 10. Начинаем заново. Правильно."',
          traitEffects: [
            { trait: 'loyalty', delta: 2 },
            { trait: 'empathy', delta: 1 },
          ],
          tags: ['forgiveness', 'team', 'hope', 'no_regret'],
        },
        {
          id: '7b',
          text: 'Написать Даше: "Давай сделаем вместе. Ты расследуй — я построю."',
          traitEffects: [
            { trait: 'risk_taking', delta: 2 },
            { trait: 'empathy', delta: 1 },
            { trait: 'pragmatism', delta: 1 },
          ],
          tags: ['innovator', 'new_alliance', 'pivot'],
        },
        {
          id: '7c',
          text: 'Закрыть ноутбук. Купить билет в один конец. Бали, Тбилиси, неважно.',
          traitEffects: [
            { trait: 'risk_taking', delta: 2 },
            { trait: 'moral_flexibility', delta: 1 },
            { trait: 'empathy', delta: -1 },
          ],
          tags: ['escape', 'lone_wolf', 'burnout'],
        },
      ],
    },
  ],

  endingTypes: [
    { id: 'faithful_protector', title: 'Команда — это святое', dominantTrait: 'loyalty', minValue: 7, rarity: 'common' },
    { id: 'compromise', title: 'Бизнес есть бизнес', dominantTrait: 'pragmatism', minValue: 7, rarity: 'common' },
    { id: 'selfless_saint', title: 'Совесть чиста', dominantTrait: 'empathy', minValue: 8, rarity: 'uncommon' },
    { id: 'lone_wolf', title: 'Сам себе фаундер', dominantTrait: 'risk_taking', minValue: 8, rarity: 'rare' },
    { id: 'cold_calculator', title: 'Growth любой ценой', dominantTrait: 'pragmatism', minValue: 8, rarity: 'rare' },
    { id: 'silent_revenge', title: 'Тихий пивот', dominantTrait: 'moral_flexibility', minValue: 8, rarity: 'epic' },
    { id: 'sacrifice', title: 'Сгорел на стартапе', dominantTrait: 'empathy', minValue: 9, rarity: 'epic' },
    { id: 'chaos_agent', title: 'Move fast & break things', dominantTrait: 'violence', minValue: 8, rarity: 'legendary' },
  ],
};
