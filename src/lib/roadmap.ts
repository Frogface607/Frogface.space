/**
 * Roadmap — structured plan extracted from voice streams.
 * Used by agents for context-aware decision making.
 */

export const ROADMAP = {
  currentChapter: {
    name: "Глава 1: Фундамент",
    duration: "30 дней",
    startDate: "2026-01-28",
    focus: [
      "MyReply soft launch → 10 платящих клиентов",
      "Edison Bar сайт → дедлайн 11 дней",
      "YouTube «Идущий к руке» → начать съёмки",
      "Frogface.space → довести до рабочего состояния",
    ],
  },

  streams: {
    "2102": {
      date: "2026-01-21",
      title: "Потоки 2102",
      keyInsights: [
        "Freepik Pipeline: Spaces (сложные сцены) + API (batch). Tinder-модель: generate → gallery → approve/reject → autopost/print",
        "Edison: industrial стиль, лого справа сверху, фото + вывески через Freepik batch",
        "MyReply soft launch: промокоды 7 дней, пост от Frogface-бота, UGC «трешовый отзыв»",
        "Anti-pattern: НЕ делать cold outreach до social proof. НЕ строить Playwright-автоматизацию",
        "Workflow: гулять → наговаривать → структурировать с ChatGPT → задачи агентам → approve/reject",
        "YouTube: стартовая фраза «Я устал бежать», съёмки ср-чт-пт",
        "Ценность: не автоматизировать ради автоматизации, 20% ручного творчества оставить",
        "Планёрка с Машей по стратегии Edison сайта",
      ],
      actionItems: [
        { task: "Настроить Freepik Spaces для Edison batch", status: "pending" },
        { task: "Промокоды MyReply — раздать своим", status: "pending" },
        { task: "Пост soft launch от Frogface-бота", status: "pending" },
        { task: "UGC-конкурс «самый трешовый отзыв»", status: "pending" },
        { task: "Съёмки первого выпуска YouTube", status: "pending" },
        { task: "Планёрка с Машей", status: "pending" },
      ],
    },
  },

  completedDay2: [
    "Zen Mode — фокус на одном квесте, минимум отвлечений",
    "Мана чек-ин — ежедневная энергия 1-5",
    "Голосовой Поток — наговаривай → AI структурирует → лог",
    "Интерактивная Летопись — Game Master ведёт ритуал закрытия дня",
    "Голосовой режим Moltbot — микрофон + TTS, замена ChatGPT Voice",
    "Квесты из чата — создавай/завершай голосом или текстом",
    "OpenClaw Gateway поднят на VPS (probe: OK)",
    "HTTP-мост создан (нужно допилить WS-протокол)",
  ],

  futurePipeline: [
    {
      name: "Допилить HTTP-мост OpenClaw",
      description: "Подогнать WS RPC протокол в bridge.mjs, добавить env в Vercel → единая память",
      priority: "high",
      blockedBy: "WS protocol debug (10-15 мин)",
    },
    {
      name: "Freepik Integration",
      description: "Tinder-модель для визуального контента: batch generate → approve/reject → autopost",
      priority: "high",
      blockedBy: "Freepik API access",
    },
    {
      name: "RAG для агентов",
      description: "OpenClaw LanceDB → агенты ищут по базе знаний. Автоматически после моста.",
      priority: "high",
      blockedBy: "HTTP-мост OpenClaw",
    },
    {
      name: "Telegram ↔ Frogface синхронизация",
      description: "Единая память и квесты между Telegram-ботом и веб-дашбордом",
      priority: "medium",
      blockedBy: "HTTP-мост OpenClaw",
    },
    {
      name: "Chrome Extension MyReply",
      description: "Расширение для публикации ответов прямо на площадках",
      priority: "medium",
      blockedBy: "Soft launch validation",
    },
    {
      name: "Уведомления (Push)",
      description: "Браузерные push-уведомления для напоминаний и дедлайнов",
      priority: "low",
      blockedBy: null,
    },
  ],

  antiPatterns: [
    "Cold outreach до social proof — шум, не сигнал",
    "Playwright-автоматизация — хрупко, дорого в поддержке",
    "Fully autonomous factory — оставить роль арт-директора",
    "Автоматизация ради автоматизации — только то, что реально мешает",
    "Работа из тревоги — только из интереса и спокойствия",
  ],
} as const;
