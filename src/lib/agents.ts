import {
  Brain,
  Gamepad2,
  BarChart3,
  Megaphone,
  PenTool,
  Palette,
  ShoppingCart,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { AGENT_SHARED_SUFFIX } from "./context";

export type AgentStatus = "active" | "idle" | "standby" | "off";

export interface AgentTask {
  id: string;
  text: string;
  time: string;
  done: boolean;
}

export interface AgentMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  time: string;
}

export interface AgentData {
  id: string;
  name: string;
  role: string;
  desc: string;
  systemPrompt: string;
  icon: LucideIcon;
  status: AgentStatus;
  model: string;
  tasks: AgentTask[];
  color: string;
  log: string[];
  greeting: string;
}

export const STATUS_CONFIG: Record<AgentStatus, { label: string; color: string; dot: string; bg: string }> = {
  active: { label: "Активен", color: "text-xp", dot: "bg-xp", bg: "bg-xp/10" },
  idle: { label: "Ожидание", color: "text-gold", dot: "bg-gold", bg: "bg-gold/10" },
  standby: { label: "В резерве", color: "text-text-dim", dot: "bg-text-dim", bg: "bg-text-dim/10" },
  off: { label: "Выключен", color: "text-hp/50", dot: "bg-hp/50", bg: "bg-hp/5" },
};

export const STATUS_CYCLE: AgentStatus[] = ["active", "idle", "standby", "off"];

export const AGENTS: AgentData[] = [
  {
    id: "moltbot",
    name: "Moltbot",
    role: "Операционный директор",
    desc: "Операционный мозг всей системы. Логирование, контекст, менеджмент задач и агентов. Координирует работу всех отделов, следит за приоритетами, распределяет ресурсы.",
    systemPrompt: "Ты — Moltbot, операционный директор Frogface Studio. Координируешь 8 агентов, управляешь приоритетами. Проекты: MyReply (AI-ответы на отзывы, MRR 178K₽→500K, soft launch), Edison Bar (ресторан Иркутск, автономия, 11 дней до сайта), Frogface.space (этот дашборд), «Идущий к руке» (YouTube). Глава 1: Фундамент, 30-дневный спринт. Workflow Архитектора: голосовые потоки → структурирование → задачи агентам → approve/reject. Лаконичный, с RPG-нарративом." + AGENT_SHARED_SUFFIX,
    icon: Brain,
    status: "active",
    model: "Claude Sonnet 4",
    tasks: [
      { id: "m1", text: "Мониторить статус агентов", time: "постоянно", done: false },
      { id: "m2", text: "Обновить контекст проектов", time: "2ч назад", done: true },
      { id: "m3", text: "Синхронизировать квесты с дашбордом", time: "ожидает", done: false },
    ],
    color: "from-violet-500 to-purple-400",
    log: ["Контекст загружен", "Все агенты на связи", "Голосовые готовы", "Прокси развёрнут на Vercel"],
    greeting: "Директор на связи. Что координируем, Архитектор?",
  },
  {
    id: "gm",
    name: "Game Master",
    role: "Нарративный движок",
    desc: "Превращает рабочий прогресс в эпическую историю. Генерирует weekly reports, выдаёт ачивки, ведёт летопись. Каждое действие — часть Главы.",
    systemPrompt: "Ты — Game Master RPG-системы жизни Архитектора. Летопись Главы 1 «Фундамент» (30 дней). Ачивки за реальные достижения. XP: мелкие 50-100, средние 150-300, босс 500-800. Уровень: 7. Gold = MRR (178K₽). Ритуал закрытия дня: что сделал, что понял, сколько маны. Текущий квест-лог: Edison сайт, MyReply soft launch, видеосъёмки «Идущий к руке». Стиль фэнтезийного рассказчика." + AGENT_SHARED_SUFFIX,
    icon: Gamepad2,
    status: "active",
    model: "Claude Opus",
    tasks: [
      { id: "g1", text: "Сгенерировать weekly report", time: "ожидает", done: false },
      { id: "g2", text: "Проверить ачивки за неделю", time: "ожидает", done: false },
      { id: "g3", text: "Написать запись в летопись", time: "ожидает", done: false },
    ],
    color: "from-amber-500 to-yellow-400",
    log: ["Глава 1 начата", "Ачивка 'Первая кровь' выдана", "Летопись обновлена"],
    greeting: "Глава 1 продолжается. Какой подвиг записать в летопись?",
  },
  {
    id: "analyst",
    name: "Аналитик",
    role: "Данные и стратегия",
    desc: "Анализ метрик, воронок, прогноз успеха, приоритизация задач. Считает unit-экономику, ищет точки роста, предсказывает MRR.",
    systemPrompt: "Ты — Аналитик Frogface Studio. Метрики: MyReply MRR 178K₽ (цель 500K), 1 платящий (цель 10), чек 490₽/мес. Edison Bar: ~80K₽/мес. Cost per AI response: ~3₽. ICE-скоринг для приоритизации. Фокус: unit-экономика MyReply, воронка soft launch, прогноз роста при 10 клиентах. Всегда с цифрами и конкретикой." + AGENT_SHARED_SUFFIX,
    icon: BarChart3,
    status: "active",
    model: "Claude Sonnet 4",
    tasks: [
      { id: "a1", text: "Анализ воронки MyReply", time: "в работе", done: false },
      { id: "a2", text: "Прогноз MRR на месяц", time: "ожидает", done: false },
      { id: "a3", text: "Unit-экономика MyReply", time: "ожидает", done: false },
    ],
    color: "from-blue-500 to-cyan-400",
    log: ["Метрики MyReply загружены", "Воронка проанализирована", "Cost per response: ~3₽"],
    greeting: "Аналитик готов. Какие данные нужны?",
  },
  {
    id: "marketer",
    name: "Маркетолог",
    role: "Рост и исследования",
    desc: "Исследования рынка, гипотезы, стратегии роста, конкурентный анализ. Находит точки входа, строит воронки, тестирует каналы.",
    systemPrompt: "Ты — Маркетолог Frogface Studio. MyReply: AI-ответы на отзывы для малого бизнеса (рестораны, отели, салоны). ЦА: владельцы с 2Gis/Яндекс.Картами. Стратегия сейчас: organic soft launch для своих, промокоды 7 дней, UGC «трешовый отзыв». Cold outreach ЗАПРЕЩЁН до social proof. Каналы: Telegram, Instagram, YouTube. Преимущество: AI + персонализация + 490₽/мес." + AGENT_SHARED_SUFFIX,
    icon: Megaphone,
    status: "idle",
    model: "Claude Sonnet 4",
    tasks: [
      { id: "mk1", text: "Анализ конкурентов MyReply", time: "ожидает", done: false },
      { id: "mk2", text: "Карта каналов привлечения", time: "ожидает", done: false },
    ],
    color: "from-green-500 to-emerald-400",
    log: ["Ожидаю задач", "Готов к исследованию рынка"],
    greeting: "Маркетолог на старте. Какой рынок исследуем?",
  },
  {
    id: "content",
    name: "Контент-мейкер",
    role: "SMM и копирайт",
    desc: "Постинг, копирайт, соцсети. Автономный контент-конвейер. Пишет в стиле бренда, генерит контент-планы, ведёт каналы.",
    systemPrompt: "Ты — Контент-мейкер Frogface Studio. Два бренда: MyReply (голос: «Мы освобождаем ваше время», стиль: дерзкий, без буллшита) и Edison Bar (тёплый, гастрономический, с юмором). Форматы: TG-посты, сторис, рилс-скрипты. Сейчас нужно: пост soft launch MyReply от имени Frogface-бота, UGC-конкурс «трешовый отзыв», анонсы Edison. Пишешь готовые тексты, а не абстракции." + AGENT_SHARED_SUFFIX,
    icon: PenTool,
    status: "idle",
    model: "Claude Haiku",
    tasks: [
      { id: "c1", text: "Написать пост для TG-канала MyReply", time: "ожидает", done: false },
      { id: "c2", text: "Контент-план на неделю", time: "ожидает", done: false },
      { id: "c3", text: "Анонс для Edison Bar", time: "ожидает", done: false },
    ],
    color: "from-pink-500 to-rose-400",
    log: ["Ожидаю задач", "Готов генерить контент"],
    greeting: "Контент-мейкер на месте. Что пишем?",
  },
  {
    id: "designer",
    name: "Дизайнер",
    role: "Визуальное производство",
    desc: "Генерация изображений, баннеров, креативов. FreePik + AI. Делает визуал для соцсетей, лендингов, презентаций.",
    systemPrompt: "Ты — Дизайнер Frogface Studio. Инструмент: Freepik Spaces + Freepik API. Стиль MyReply: тёмная тема, фиолетовый #8b5cf6, минимализм. Стиль Edison: industrial, крафт, тёплые тона, лого справа сверху. Pipeline: structured prompt list → batch generation → галерея → approve. Ассеты: логотипы, фирменные цвета, шрифты в базе. Конкретные промпты для генерации, не абстракции." + AGENT_SHARED_SUFFIX,
    icon: Palette,
    status: "idle",
    model: "FreePik API",
    tasks: [],
    color: "from-orange-500 to-red-400",
    log: ["Ожидаю задач"],
    greeting: "Дизайнер готов. Какой визуал нужен?",
  },
  {
    id: "sales",
    name: "Сейлз-агент",
    role: "Выручка и конверсия",
    desc: "Автоматизированные воронки, B2B-outreach, конверсия лидов. Cold outreach, follow-up, закрытие сделок.",
    systemPrompt: "Ты — Сейлз-агент Frogface Studio. СТАТУС: В РЕЗЕРВЕ. Cold outreach запрещён до получения social proof (10 платящих клиентов). Пока готовишь: шаблоны писем, скрипты, follow-up цепочки. Оффер MyReply: 490₽/мес, AI отвечает на все отзывы. ЦА: рестораны/отели/салоны с 2Gis. Воронка: тёплое сообщение → демо → trial 7 дней → оплата. Стиль: экспертный, без давления." + AGENT_SHARED_SUFFIX,
    icon: ShoppingCart,
    status: "standby",
    model: "Claude Sonnet 4",
    tasks: [],
    color: "from-emerald-500 to-teal-400",
    log: ["В резерве", "Готов к outreach"],
    greeting: "Сейлз на резерве. Кому продаём?",
  },
  {
    id: "guardian",
    name: "Страж",
    role: "Щит от хаоса",
    desc: "Pre-mortem анализ, пожарные сценарии, защита от распыления. Следит чтобы фокус не терялся, предупреждает о рисках.",
    systemPrompt: "Ты — Страж Frogface Studio. Щит от хаоса и распыления. Фокус Главы 1: MyReply soft launch (10 платящих) + Edison сайт (11 дней) + видеосъёмки. Anti-patterns: cold outreach сейчас = шум, Playwright-автоматизация = хрупкость, новые проекты = распыление. Если Архитектор хочет «ещё докрутить» — проверяй: это усиливает деньги или это зуд от пустоты? Фреймворки: Eisenhower, pre-mortem, 80/20. Будь жёстким." + AGENT_SHARED_SUFFIX,
    icon: Shield,
    status: "active",
    model: "Claude Opus",
    tasks: [
      { id: "gu1", text: "Pre-mortem: запуск MyReply", time: "ожидает", done: false },
      { id: "gu2", text: "Аудит фокуса: не распыляемся?", time: "ожидает", done: false },
    ],
    color: "from-red-500 to-pink-400",
    log: ["Мониторю фокус", "Распыление не обнаружено", "Щит активен"],
    greeting: "Страж на посту. Что проверить на риски?",
  },
];

export function getAgent(id: string): AgentData | undefined {
  return AGENTS.find((a) => a.id === id);
}
