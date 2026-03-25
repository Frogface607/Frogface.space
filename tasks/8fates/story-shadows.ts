import type { Story } from './types';

export const STORY_SHADOWS: Story = {
  id: 'shadows-of-97',
  title: 'Тени девяносто седьмого',
  subtitle: 'Провинциальный город. Рынок. Выбор между семьёй и свободой.',
  setting: 'Провинциальный город, Сибирь',
  year: '1997',
  themes: ['семья', 'криминал', 'выживание', 'честь'],
  coverGradient: 'from-red-900/80 via-gray-900/60 to-black',

  beats: [
    {
      id: 1,
      type: 'opening',
      title: 'Долг',
      narration: 'Февраль. Минус тридцать. Ты стоишь за прилавком на рынке "Шанхай" — продаёшь турецкие куртки, которые мать привезла из Новосибирска. Пейджер вибрирует в кармане: "Серый ищет. Срочно." Серый — это Сергей Колмаков, местный авторитет. Ты ему должен. Не ты — отец. Год назад он занял у Серого на операцию для матери. Двести тысяч. Проценты капают. Отец пьёт и не работает. А Серый не любит ждать. Из-за соседнего ряда выходит Витёк — вечный шестёрка Серого, в адидасовском костюме и с золотой цепью. "Поехали, Серый зовёт. Базар есть."',
      imageHint: 'russian market 90s winter cold',
      allowCustom: true,
      choices: [
        {
          id: '1a',
          text: 'Закрыть прилавок и поехать к Серому — долг есть долг',
          traitEffects: [
            { trait: 'loyalty', delta: 1 },
            { trait: 'pragmatism', delta: 1 },
          ],
          tags: ['obedient', 'dutiful'],
        },
        {
          id: '1b',
          text: 'Сказать Витьку: "Передай — приеду вечером, товар не брошу"',
          traitEffects: [
            { trait: 'pragmatism', delta: 2 },
            { trait: 'risk_taking', delta: 1 },
          ],
          tags: ['independent', 'business_first'],
        },
        {
          id: '1c',
          text: 'Спросить у Витька: "А чё за базар? Может по телефону решим?"',
          traitEffects: [
            { trait: 'risk_taking', delta: 1 },
            { trait: 'pragmatism', delta: 1 },
            { trait: 'moral_flexibility', delta: 1 },
          ],
          tags: ['cautious', 'negotiator'],
        },
      ],
    },
    {
      id: 2,
      type: 'development',
      title: 'Предложение',
      narration: 'Гараж Серого. Пахнет бензином и сигаретами "Бонд". На столе — бутылка "Абсолюта" и три стакана. Серый сидит в кожаной куртке, крутит ключи от шестёрки. "Слушай сюда. Отец твой — лох. Но ты — нормальный пацан. Предлагаю работу. Есть маршрут — Красноярск-Иркутск, Газель с товаром. Два рейса в месяц. Долг закроешь за три месяца. А дальше — в долю войдёшь." Он наливает водку. "Или я приду к матери. Она же адрес знает, да?"',
      imageHint: 'garage 90s criminal meeting vodka',
      allowCustom: true,
      choices: [
        {
          id: '2a',
          text: 'Выпить и согласиться — мать трогать нельзя',
          traitEffects: [
            { trait: 'loyalty', delta: 2 },
            { trait: 'moral_flexibility', delta: 1 },
            { trait: 'risk_taking', delta: 1 },
          ],
          tags: ['deal', 'protective', 'criminal'],
        },
        {
          id: '2b',
          text: '"Дай месяц. Я сам найду деньги. Без рейсов."',
          traitEffects: [
            { trait: 'pragmatism', delta: 2 },
            { trait: 'risk_taking', delta: 2 },
          ],
          tags: ['independent', 'gambler', 'proud'],
        },
        {
          id: '2c',
          text: '"Один рейс. Закрою долг и разойдёмся. Никакой доли."',
          traitEffects: [
            { trait: 'pragmatism', delta: 1 },
            { trait: 'moral_flexibility', delta: 2 },
          ],
          tags: ['negotiator', 'cautious', 'one_time'],
        },
      ],
    },
    {
      id: 3,
      type: 'development',
      title: 'Груз',
      narration: 'Ночь. Трасса М53. Газель гудит на каждой кочке. В кузове — коробки с надписью "бытовая техника". Ты знаешь, что внутри не техника. Рядом сидит Лёха — водитель, тридцать лет, тихий мужик с дочкой-инвалидом. На заправке перед Тулуном он говорит: "Братан, я знаю что в коробках. Палёная водка. Литров пятьсот. Если менты остановят — нам обоим конец. Но если откроют последний ряд... там ещё кое-что. Я заглянул." Он молчит. "Стволы. Три ствола."',
      imageHint: 'night road truck siberia highway',
      allowCustom: true,
      choices: [
        {
          id: '3a',
          text: 'Продолжить ехать молча. Ты уже здесь — назад пути нет',
          traitEffects: [
            { trait: 'risk_taking', delta: 2 },
            { trait: 'pragmatism', delta: 1 },
          ],
          tags: ['committed', 'silent', 'risk'],
        },
        {
          id: '3b',
          text: 'Остановить Газель. Выкинуть стволы в тайгу у дороги',
          traitEffects: [
            { trait: 'moral_flexibility', delta: -1 },
            { trait: 'empathy', delta: 1 },
            { trait: 'risk_taking', delta: 2 },
          ],
          tags: ['principled', 'reckless', 'brave'],
        },
        {
          id: '3c',
          text: 'Позвонить Серому с таксофона: "Ты не говорил про стволы"',
          traitEffects: [
            { trait: 'loyalty', delta: -1 },
            { trait: 'pragmatism', delta: 2 },
            { trait: 'violence', delta: 1 },
          ],
          tags: ['confrontation', 'demanding', 'angry'],
        },
      ],
    },
    {
      id: 4,
      type: 'development',
      title: 'Засада',
      narration: 'Иркутск. Склад на окраине. Выгрузка идёт. И тут — менты. Не обычные — СОБР, маски, автоматы. "Лежать! На пол!" Лёху бросают лицом в грязный бетон. Тебя — к стене. Офицер снимает маску. Это Ковалёв — знакомый. Учился в параллельном классе, теперь капитан. "Ну привет. Я давно за Серым наблюдаю. И ты мне нужен. Как свидетель. Дашь показания — отпущу. Прямо сейчас. Откажешься — поедешь с Серым на одну нару." Он смотрит в глаза. "Решай быстро. У тебя минута."',
      imageHint: 'police raid warehouse night masks',
      allowCustom: true,
      choices: [
        {
          id: '4a',
          text: 'Согласиться. Серый заслужил. А у тебя мать',
          traitEffects: [
            { trait: 'pragmatism', delta: 2 },
            { trait: 'loyalty', delta: -2 },
            { trait: 'empathy', delta: 1 },
          ],
          tags: ['betrayal', 'witness', 'survival'],
        },
        {
          id: '4b',
          text: 'Молчать. Ты не крыса. Даже если Серый — тварь',
          traitEffects: [
            { trait: 'loyalty', delta: 3 },
            { trait: 'risk_taking', delta: 1 },
          ],
          tags: ['honor', 'silent', 'code'],
        },
        {
          id: '4c',
          text: '"Отпусти Лёху. У него дочь. Я дам показания, но он чистый."',
          traitEffects: [
            { trait: 'empathy', delta: 3 },
            { trait: 'moral_flexibility', delta: 1 },
            { trait: 'loyalty', delta: -1 },
          ],
          tags: ['sacrifice', 'empathetic', 'deal'],
        },
      ],
    },
    {
      id: 5,
      type: 'development',
      title: 'Последствия',
      narration: 'Две недели спустя. Ты дома. Мать варит пельмени на кухне, не знает ничего. Отец сидит у телевизора — показывают "Поле чудес". Звонок в дверь. На пороге — Витёк. Без улыбки. "Серый всё знает. Или знает, или думает что знает. Он на нервах. Говорит, если ты чистый — приходи завтра в гараж. Поговорим. Если не придёшь — значит крыса." Витёк уходит. Мать из кухни: "Кто там был?" Пельмени дымятся на тарелке. За окном — февральская темнота.',
      imageHint: 'apartment night tv kitchen darkness',
      allowCustom: true,
      choices: [
        {
          id: '5a',
          text: 'Пойти к Серому. Посмотреть в глаза и сказать правду',
          traitEffects: [
            { trait: 'risk_taking', delta: 3 },
            { trait: 'loyalty', delta: 1 },
          ],
          tags: ['brave', 'confrontation', 'honest'],
        },
        {
          id: '5b',
          text: 'Собрать вещи ночью. Уехать с матерью к тётке в Новосибирск',
          traitEffects: [
            { trait: 'empathy', delta: 2 },
            { trait: 'pragmatism', delta: 1 },
            { trait: 'loyalty', delta: -1 },
          ],
          tags: ['escape', 'family', 'coward'],
        },
        {
          id: '5c',
          text: 'Позвонить Ковалёву: "Мне нужна защита. Серый вычислил"',
          traitEffects: [
            { trait: 'pragmatism', delta: 2 },
            { trait: 'moral_flexibility', delta: 1 },
            { trait: 'violence', delta: 1 },
          ],
          tags: ['police', 'strategic', 'double_agent'],
        },
      ],
    },
    {
      id: 6,
      type: 'climax',
      title: 'Гараж',
      narration: 'Гараж Серого. Те же стены, тот же запах. Но теперь — напряжение. Серый стоит у верстака, за ним — двое. Витёк у двери. "Ну, расскажи мне. Что было на складе. Кто тебя отпустил и почему." Тишина. Слышно как капает вода из крана. Серый берёт монтировку со стола. Не угрожает — просто крутит в руках. "У меня на нарах друзья. Они говорят — менты знали точное время. ТОЧНОЕ. Кто слил, как думаешь?" Он смотрит на тебя.',
      imageHint: 'garage confrontation tension metal tools',
      allowCustom: true,
      choices: [
        {
          id: '6a',
          text: '"Я не крыса. Меня отпустили потому что я никто. Пешка."',
          traitEffects: [
            { trait: 'pragmatism', delta: 2 },
            { trait: 'moral_flexibility', delta: 2 },
          ],
          tags: ['lie', 'survival', 'clever'],
        },
        {
          id: '6b',
          text: '"Да, я дал показания. Ты подставил меня со стволами. Мы квиты."',
          traitEffects: [
            { trait: 'risk_taking', delta: 3 },
            { trait: 'violence', delta: 1 },
            { trait: 'loyalty', delta: -1 },
          ],
          tags: ['truth', 'defiant', 'confrontation'],
        },
        {
          id: '6c',
          text: '"Проверь Витька. Я видел его с Ковалёвым у заправки в Тулуне."',
          traitEffects: [
            { trait: 'moral_flexibility', delta: 3 },
            { trait: 'violence', delta: 2 },
            { trait: 'empathy', delta: -2 },
          ],
          tags: ['frame', 'manipulator', 'dark'],
        },
      ],
    },
    {
      id: 7,
      type: 'resolution',
      title: 'Весна',
      narration: 'Март. Первая капель. Ты сидишь на лавке у подъезда. В руке — сигарета и пейджер, который молчит уже неделю. Рынок "Шанхай" работает, куртки висят, жизнь продолжается. Мать выздоровела. Отец ушёл к другой. Серый... у Серого свои проблемы. А ты — ты сидишь и думаешь. Тебе девятнадцать. Впереди — вся жизнь. Или то, что от неё осталось. Из подъезда выходит Наташа — соседка, медсестра, двадцать три года, добрые глаза. "Чего грустный? Пошли чай пить." Она улыбается. Первая улыбка за месяц.',
      imageHint: 'spring thaw bench apartment building hope',
      allowCustom: true,
      choices: [
        {
          id: '7a',
          text: '"Пошли. Расскажу тебе всё. Мне нужен кто-то, кто послушает."',
          traitEffects: [
            { trait: 'empathy', delta: 2 },
            { trait: 'loyalty', delta: 1 },
          ],
          tags: ['open', 'trust', 'hope', 'no_regret'],
        },
        {
          id: '7b',
          text: '"Нет. Мне скоро ехать. Я уезжаю из этого города."',
          traitEffects: [
            { trait: 'risk_taking', delta: 2 },
            { trait: 'pragmatism', delta: 1 },
          ],
          tags: ['escape', 'lone_wolf', 'new_life'],
        },
        {
          id: '7c',
          text: 'Молча затушить сигарету. Достать телефон Ковалёва. Набрать номер.',
          traitEffects: [
            { trait: 'pragmatism', delta: 2 },
            { trait: 'moral_flexibility', delta: 1 },
            { trait: 'violence', delta: 1 },
          ],
          tags: ['cold', 'system', 'power'],
        },
      ],
    },
  ],

  endingTypes: [
    { id: 'faithful_protector', title: 'Своих не сдаю', dominantTrait: 'loyalty', minValue: 7, rarity: 'common' },
    { id: 'compromise', title: 'Выжил и ладно', dominantTrait: 'pragmatism', minValue: 7, rarity: 'common' },
    { id: 'selfless_saint', title: 'Чужая боль — моя боль', dominantTrait: 'empathy', minValue: 8, rarity: 'uncommon' },
    { id: 'lone_wolf', title: 'Волк-одиночка', dominantTrait: 'risk_taking', minValue: 8, rarity: 'rare' },
    { id: 'cold_calculator', title: 'Серый кардинал', dominantTrait: 'pragmatism', minValue: 8, rarity: 'rare' },
    { id: 'silent_revenge', title: 'Тихая вендетта', dominantTrait: 'moral_flexibility', minValue: 8, rarity: 'epic' },
    { id: 'sacrifice', title: 'Сгорел за других', dominantTrait: 'empathy', minValue: 9, rarity: 'epic' },
    { id: 'chaos_agent', title: 'Пацан сказал — пацан сделал', dominantTrait: 'violence', minValue: 8, rarity: 'legendary' },
  ],
};
