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

  futurePipeline: [
    {
      name: "Freepik Integration",
      description: "Tinder-модель для визуального контента: batch generate → approve/reject → autopost",
      priority: "high",
      blockedBy: "Freepik API access",
    },
    {
      name: "VPS Persistence",
      description: "Перенос данных с localStorage на VPS (рядом с Moltbot). SQLite или JSON.",
      priority: "medium",
      blockedBy: "VPS setup",
    },
    {
      name: "RAG для агентов",
      description: "Retrieval Augmented Generation — агенты ищут по базе знаний перед ответом",
      priority: "low",
      blockedBy: "Нужен объём контекста",
    },
    {
      name: "Ритуал закрытия дня",
      description: "Ежедневный UI в Frogface: что сделал, что понял, сколько маны осталось",
      priority: "medium",
      blockedBy: null,
    },
    {
      name: "Chrome Extension MyReply",
      description: "Расширение для публикации ответов прямо на площадках",
      priority: "medium",
      blockedBy: "Soft launch validation",
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
