// Edison Toolkit cases — content for in-world bar overlay modals
// Source of truth: D:\PROJECTS\FROGFACE-VAULT\canonical\edison-toolkit-catalog.md

export interface CaseModule {
  id: string;
  title: string;
  tag: 'CONTENT' | 'AUTOMATION' | 'OPS' | 'TECH';
  edisonResult: string;
  whatItDoes: string;
  applies: string[];
  priceModule: string;
  pricePackage: string;
  hero?: string;
}

export const CASES: Record<string, CaseModule> = {
  booking: {
    id: 'booking',
    title: 'Бронирование с FloorPlan',
    tag: 'OPS',
    edisonResult: '80% всех броней через сайт. Звонков почти нет.',
    whatItDoes:
      'Гость видит карту зала, выбирает стол, бронирует. Realtime синк свободных/занятых. Подтверждение в Telegram.',
    applies: ['Рестораны', 'Бары', 'Кинотеатры', 'Коворкинги', 'Бани', 'Барбершопы', 'Салоны'],
    priceModule: '$1500',
    pricePackage: '$1000 в пакете',
  },
  menu: {
    id: 'menu',
    title: 'Меню / каталог с фото и фильтрами',
    tag: 'OPS',
    edisonResult: 'Realtime обновление меню. PWA installable как приложение.',
    whatItDoes:
      'Realtime меню — фото, цены, аллергены, состав. Категории, поиск, фильтры. PWA installable.',
    applies: ['Общепит', 'Retail', 'Доставка', 'Цветочные', 'Тур-операторы'],
    priceModule: '$700',
    pricePackage: '$500 в пакете',
  },
  announcements: {
    id: 'announcements',
    title: 'AI-генератор анонсов событий',
    tag: 'CONTENT',
    edisonResult: 'Анонс концерта пишется за 5 секунд вместо 15 минут.',
    whatItDoes:
      'Кнопка «✨ Сгенерировать текст» в админке → Claude Sonnet пишет 2-3 предложения в стиле владельца. Обучен на 200+ постах из его ТГ-канала.',
    applies: ['Музыкальные бары', 'Event-площадки', 'Образование', 'Фитнес', 'Культурные пространства'],
    priceModule: '$500',
    pricePackage: '$300 в пакете',
  },
  posters: {
    id: 'posters',
    title: 'Постер-генератор с QR',
    tag: 'CONTENT',
    edisonResult: 'Готовая афиша с QR на запись. Брендированная. Один клик.',
    whatItDoes:
      'html2canvas + jspdf + кастомизируемые шаблоны. Дизайн под бренд клиента.',
    applies: ['Концертные площадки', 'Тренинги', 'Event-агентства', 'Retail-промо'],
    priceModule: '$600',
    pricePackage: '$300 в пакете',
  },
  pwa: {
    id: 'pwa',
    title: 'PWA — сайт как мобильное приложение',
    tag: 'TECH',
    edisonResult: 'Гость добавляет сайт на главный экран — открывается как приложение.',
    whatItDoes:
      'Service Worker + manifest.json + install prompt. Offline-first. Без App Store и Google Play.',
    applies: ['Любой бизнес желающий «приложение» без $10K разработки'],
    priceModule: '$300',
    pricePackage: 'Включён в любой пакет',
  },
  'tg-bot': {
    id: 'tg-bot',
    title: 'Telegram-бот для гостей и админа',
    tag: 'AUTOMATION',
    edisonResult: 'Гость бронит, заказывает мерч, видит расписание. Админ получает уведомления, статистику дня.',
    whatItDoes:
      'Webhook + Telegraf.js или прямой Telegram Bot API. Гость-бот + Админ-бот в одном.',
    applies: ['Любой SMB с customer-service'],
    priceModule: '$600',
    pricePackage: '$400 в пакете',
  },
  staff: {
    id: 'staff',
    title: 'Staff-панель',
    tag: 'OPS',
    edisonResult: 'Стажёра вводят в работу за день вместо недели.',
    whatItDoes:
      'Команда видит свои смены, базу знаний (как готовить, как отвечать), внутренний чат. Authentication + RLS на Supabase.',
    applies: ['Бизнес со штатом 5+', 'Бары', 'Кафе', 'Барбершопы', 'Фитнес'],
    priceModule: '$800',
    pricePackage: '$600 в пакете',
  },
  music: {
    id: 'music',
    title: 'Музыка / трек «Исчезая»',
    tag: 'CONTENT',
    edisonResult: 'Easter egg: трек Серёжи. 9 лет музыкальной сцены Иркутска.',
    whatItDoes:
      'Frogface — не только предприниматель. Filolog, rapper, rock-музыкант. Edison был музыкальным баром потому что Серёжа сам музыкант.',
    applies: ['—'],
    priceModule: '—',
    pricePackage: '—',
  },
};

export function getCase(id: string): CaseModule | null {
  return CASES[id] ?? null;
}
