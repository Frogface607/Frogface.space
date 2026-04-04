/**
 * Roadmap — structured plan. Updated April 2026.
 */

export const ROADMAP = {
  currentChapter: {
    name: "Глава 3: Возрождение",
    duration: "30 дней",
    startDate: "2026-04-04",
    focus: [
      "MyReply: первый реальный пользователь (0 → 1)",
      "Edison Bar: новое меню, автономная работа",
      "Frogface.space: редизайн + живые данные из Supabase",
      "Прокачка скиллов и агентов",
    ],
  },

  projectStatus: {
    myreply: {
      name: "MyReply",
      status: "live-empty",
      url: "my-reply.ru",
      metrics: {
        users: 0,
        payments: 0,
        mrr: 0,
        tables: 10,
        allEmpty: true,
      },
      pricing: ["Free (0₽, 5 ответов)", "Start (790₽/мес)", "Pro (1990₽/мес)"],
      stack: "Next.js 16 + Supabase + OpenRouter + YuKassa",
      lastCommit: "2026-04-04",
      nextSteps: [
        "Промокоды — раздать своим",
        "Первый платящий клиент",
        "UGC-конкурс «трешовый отзыв»",
      ],
    },
    edison: {
      name: "Edison Bar",
      status: "active-healthy",
      url: "edisonbar.ru",
      metrics: {
        bookings: 888,
        events: 68,
        artists: 58,
        menuItems: 137,
        staff: 12,
        votes: 935,
      },
      stack: "Next.js 16 + Supabase + Claude API + Telegram Bot",
      lastCommit: "2026-04-03",
      nextSteps: [
        "Довести /new/menu до прода",
        "Закоммитить untracked файлы",
      ],
    },
    frogface: {
      name: "Frogface.space",
      status: "rebuilding",
      metrics: {
        pages: 7,
        agents: 8,
        supabaseTables: 3,
      },
      stack: "Next.js 16 + Supabase + Tailwind 4 + PWA",
      lastCommit: "2026-04-04",
      nextSteps: [
        "Supabase живые данные",
        "Агенты через Claude API",
        "Мобильное приложение (PWA)",
      ],
    },
    posadyat: {
      name: "Posadyat.ru",
      status: "complete",
      url: "posadyat.ru",
      stack: "Next.js 16 + Claude Haiku",
      lastCommit: "2026-03-23",
      nextSteps: [],
    },
    receptor: {
      name: "Receptor",
      status: "dormant",
      stack: "Node.js + iiko API",
      lastCommit: "2025-02-09",
      nextSteps: [],
    },
  },

  supabaseInfra: {
    myreply: { projectId: "qlttwkntbfwwvejwcfqp", region: "eu-west-1", tables: 10, hasData: false },
    edison: { projectId: "ebfksnyehyqbcizohywn", region: "eu-west-1", tables: 23, hasData: true },
  },

  antiPatterns: [
    "Cold outreach до social proof — шум, не сигнал",
    "Новые проекты пока MyReply не запущен — распыление",
    "Автоматизация ради автоматизации — только то, что реально мешает",
    "Работа из тревоги — только из интереса и спокойствия",
    "Бесконечная стройка без запуска — launch > polish",
  ],
} as const;
