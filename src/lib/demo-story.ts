import type { Story } from './types';

export const DEMO_STORY: Story = {
  id: 'the-last-call',
  title: 'Последний звонок',
  subtitle: 'Школа №47. Май 2008. Правда или верность?',
  setting: 'Провинциальный город, выпускной класс',
  year: '2008',
  themes: ['верность', 'предательство', 'правда', 'система'],
  coverGradient: 'from-purple-900/80 via-indigo-900/60 to-black',

  beats: [
    {
      id: 1,
      type: 'opening',
      title: 'Компромат',
      narration:
        'Перемена. Ты сидишь в классе 11-А, листая ВКонтакте на Nokia. В коридоре шум — Алина Соколова, первая отличница школы, влетает в класс с красными глазами. "Кто-то слил мои фотки директору Беляеву. Он шантажирует меня — молчи про его схемы с ремонтом, или вылетишь перед ЕГЭ." Она смотрит прямо на тебя. Вы дружите с первого класса.',
      imageHint: 'school classroom 2008 nokia vkontakte',
      allowCustom: true,
      choices: [
        {
          id: '1a',
          text: 'Обнять Алину и пообещать помочь разобраться',
          traitEffects: [
            { trait: 'loyalty', delta: 2 },
            { trait: 'empathy', delta: 1 },
            { trait: 'risk_taking', delta: 1 },
          ],
          tags: ['loyal', 'supportive'],
        },
        {
          id: '1b',
          text: 'Сказать: "Не лезь к директору, потерпи до выпускного"',
          traitEffects: [
            { trait: 'pragmatism', delta: 2 },
            { trait: 'moral_flexibility', delta: 1 },
          ],
          tags: ['cautious', 'pragmatic'],
        },
        {
          id: '1c',
          text: 'Спросить: "А что за схемы? Расскажи всё"',
          traitEffects: [
            { trait: 'risk_taking', delta: 2 },
            { trait: 'pragmatism', delta: 1 },
          ],
          tags: ['curious', 'investigator'],
        },
      ],
    },
    {
      id: 2,
      type: 'development',
      title: 'Союзники',
      narration:
        'Денис Волков — главный бунтарь класса — перехватывает тебя после уроков у старого крыла. "Я знаю про Беляева. У меня есть доступ к бухгалтерии через тётку-секретаршу. Но мне нужен кто-то, кому доверяет Алина." Денис — харизматичный, но ненадёжный. В прошлом году он подставил одноклассника ради шутки.',
      imageHint: 'old school wing corridor shadows',
      allowCustom: true,
      choices: [
        {
          id: '2a',
          text: 'Согласиться работать с Денисом — вместе сильнее',
          traitEffects: [
            { trait: 'risk_taking', delta: 2 },
            { trait: 'pragmatism', delta: 1 },
          ],
          tags: ['alliance', 'risky_trust'],
        },
        {
          id: '2b',
          text: 'Действовать в одиночку — Денису нельзя доверять',
          traitEffects: [
            { trait: 'loyalty', delta: 1 },
            { trait: 'pragmatism', delta: 1 },
          ],
          tags: ['lone_wolf', 'cautious'],
        },
        {
          id: '2c',
          text: 'Рассказать Алине о предложении Дениса — пусть решает сама',
          traitEffects: [
            { trait: 'empathy', delta: 2 },
            { trait: 'loyalty', delta: 1 },
          ],
          tags: ['honest', 'respectful'],
        },
      ],
    },
    {
      id: 3,
      type: 'development',
      title: 'Улики',
      narration:
        'Ночь. Ты проник в учительскую — или получил доступ через Дениса. На столе Беляева — папка "Ремонт спортзала": накладные на 2 миллиона рублей, а реальных работ на 300 тысяч. Но в папке ещё кое-что — список учеников, которые "добровольно" сдавали деньги на ремонт. Там фамилии из бедных семей. Ты слышишь шаги в коридоре.',
      imageHint: 'dark office documents night tension',
      allowCustom: true,
      choices: [
        {
          id: '3a',
          text: 'Сфотографировать всё на Nokia и тихо уйти',
          traitEffects: [
            { trait: 'pragmatism', delta: 2 },
            { trait: 'risk_taking', delta: 1 },
          ],
          tags: ['evidence', 'smart'],
        },
        {
          id: '3b',
          text: 'Забрать папку целиком — без оригиналов Беляев бессилен',
          traitEffects: [
            { trait: 'risk_taking', delta: 3 },
            { trait: 'violence', delta: 1 },
          ],
          tags: ['bold', 'reckless'],
        },
        {
          id: '3c',
          text: 'Уйти без улик — слишком опасно, нужен другой план',
          traitEffects: [
            { trait: 'pragmatism', delta: 1 },
            { trait: 'empathy', delta: -1 },
          ],
          tags: ['retreat', 'fear'],
        },
      ],
    },
    {
      id: 4,
      type: 'development',
      title: 'Давление',
      narration:
        'Следующий день. Беляев вызывает тебя к себе. Кабинет пахнет кожей и страхом. "Я знаю, что ты копаешь. У меня есть связи в РОНО. Одно слово — и ни один вуз тебя не примет." Он кладёт на стол характеристику с твоей фамилией. Внизу — место для подписи. "Подпиши, что Соколова списывала на олимпиаде. И забудем обо всём."',
      imageHint: 'principal office intimidation document',
      allowCustom: true,
      choices: [
        {
          id: '4a',
          text: 'Отказаться и уйти молча, хлопнув дверью',
          traitEffects: [
            { trait: 'loyalty', delta: 3 },
            { trait: 'risk_taking', delta: 1 },
          ],
          tags: ['defiant', 'loyal', 'brave'],
        },
        {
          id: '4b',
          text: 'Подписать. Защитить себя. Найти другой способ помочь Алине',
          traitEffects: [
            { trait: 'pragmatism', delta: 2 },
            { trait: 'moral_flexibility', delta: 2 },
            { trait: 'loyalty', delta: -2 },
          ],
          tags: ['betrayal', 'survival', 'compromise'],
        },
        {
          id: '4c',
          text: '"У меня тоже есть кое-что на вас, Виктор Петрович"',
          traitEffects: [
            { trait: 'risk_taking', delta: 3 },
            { trait: 'violence', delta: 1 },
            { trait: 'pragmatism', delta: 1 },
          ],
          tags: ['bluff', 'confrontation', 'gamble'],
        },
      ],
    },
    {
      id: 5,
      type: 'development',
      title: 'Раскол',
      narration:
        'Школа гудит. Кто-то (Денис?) написал в школьном чате ВКонтакте: "Беляев — вор. Доказательства скоро." 200 сообщений за час. Класс разделился: одни хотят справедливости, другие боятся последствий. Алина звонит тебе: "Мама узнала. Она плачет. Говорит, что я разрушаю семью. Может, стоит остановиться?" Ты слышишь, как у неё дрожит голос.',
      imageHint: 'phone call night tears decision',
      allowCustom: true,
      choices: [
        {
          id: '5a',
          text: '"Мы зашли слишком далеко, чтобы сдаваться. Я с тобой"',
          traitEffects: [
            { trait: 'loyalty', delta: 2 },
            { trait: 'risk_taking', delta: 1 },
            { trait: 'empathy', delta: 1 },
          ],
          tags: ['determined', 'loyal', 'brave'],
        },
        {
          id: '5b',
          text: '"Может, твоя мама права. Давай подумаем ещё раз"',
          traitEffects: [
            { trait: 'empathy', delta: 2 },
            { trait: 'pragmatism', delta: 1 },
          ],
          tags: ['doubt', 'empathetic', 'cautious'],
        },
        {
          id: '5c',
          text: '"Отправь улики журналистам анонимно. Пусть они разбираются"',
          traitEffects: [
            { trait: 'pragmatism', delta: 2 },
            { trait: 'moral_flexibility', delta: 1 },
          ],
          tags: ['strategic', 'delegator'],
        },
      ],
    },
    {
      id: 6,
      type: 'climax',
      title: 'Выпускной',
      narration:
        'Актовый зал. Последний звонок. Гирлянды, слёзы, "Школьные годы чудесные" из колонок. Беляев на сцене произносит речь о "наших замечательных выпускниках". В зале — родители, учителя, местное ТВ. У тебя в кармане телефон с фотографиями документов. Алина стоит рядом, бледная. Денис подмигивает из задних рядов. Микрофон свободен.',
      imageHint: 'school graduation ceremony stage microphone',
      allowCustom: true,
      choices: [
        {
          id: '6a',
          text: 'Выйти к микрофону и рассказать правду при всех',
          traitEffects: [
            { trait: 'risk_taking', delta: 3 },
            { trait: 'loyalty', delta: 2 },
            { trait: 'violence', delta: 1 },
          ],
          tags: ['public_truth', 'hero', 'reckless'],
        },
        {
          id: '6b',
          text: 'Передать флешку журналистке в зале — тихо и эффективно',
          traitEffects: [
            { trait: 'pragmatism', delta: 3 },
            { trait: 'risk_taking', delta: 1 },
          ],
          tags: ['strategic', 'calculated', 'smart'],
        },
        {
          id: '6c',
          text: 'Промолчать. Отпраздновать выпускной. Завтра будет новый день',
          traitEffects: [
            { trait: 'moral_flexibility', delta: 2 },
            { trait: 'empathy', delta: -1 },
            { trait: 'pragmatism', delta: 1 },
          ],
          tags: ['silence', 'conformist', 'surrender'],
        },
      ],
    },
    {
      id: 7,
      type: 'resolution',
      title: 'Точка невозврата',
      narration:
        'После церемонии. Школьный двор. Фонари. Запах сирени. Алина подходит к тебе. "Спасибо. Или не спасибо. Я ещё не решила." Она молчит. Потом: "Что бы ты сделал, если бы мог начать сначала?" Ты понимаешь — это не вопрос про школу. Это вопрос про то, кто ты есть.',
      imageHint: 'school yard night lilac lanterns farewell',
      allowCustom: true,
      choices: [
        {
          id: '7a',
          text: '"Сделал бы то же самое. Мы поступили правильно"',
          traitEffects: [
            { trait: 'loyalty', delta: 2 },
            { trait: 'empathy', delta: 1 },
          ],
          tags: ['conviction', 'no_regret'],
        },
        {
          id: '7b',
          text: '"Не знаю. Но я бы хотел, чтобы никто не пострадал"',
          traitEffects: [
            { trait: 'empathy', delta: 3 },
            { trait: 'moral_flexibility', delta: 1 },
          ],
          tags: ['regret', 'empathetic', 'sacrifice'],
        },
        {
          id: '7c',
          text: '"Я бы думал только о себе. Мир не стоит того, чтобы его спасать"',
          traitEffects: [
            { trait: 'pragmatism', delta: 2 },
            { trait: 'violence', delta: 1 },
            { trait: 'empathy', delta: -2 },
          ],
          tags: ['cynical', 'lone_wolf', 'cold'],
        },
      ],
    },
  ],

  endingTypes: [
    {
      id: 'faithful_protector',
      title: 'Верность превыше всего',
      dominantTrait: 'loyalty',
      minValue: 7,
      rarity: 'common',
    },
    {
      id: 'compromise',
      title: 'Компромисс ради всех',
      dominantTrait: 'pragmatism',
      minValue: 7,
      rarity: 'common',
    },
    {
      id: 'selfless_saint',
      title: 'Правда любой ценой',
      dominantTrait: 'empathy',
      minValue: 8,
      rarity: 'uncommon',
    },
    {
      id: 'lone_wolf',
      title: 'Путь одиночки',
      dominantTrait: 'risk_taking',
      minValue: 8,
      rarity: 'rare',
    },
    {
      id: 'cold_calculator',
      title: 'Холодный расчёт',
      dominantTrait: 'pragmatism',
      minValue: 8,
      rarity: 'rare',
    },
    {
      id: 'silent_revenge',
      title: 'Тихая месть',
      dominantTrait: 'moral_flexibility',
      minValue: 8,
      rarity: 'epic',
    },
    {
      id: 'sacrifice',
      title: 'Самопожертвование',
      dominantTrait: 'empathy',
      minValue: 9,
      rarity: 'epic',
    },
    {
      id: 'chaos_agent',
      title: 'Хаос и анархия',
      dominantTrait: 'violence',
      minValue: 8,
      rarity: 'legendary',
    },
  ],
};
