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
    systemPrompt: "Ты — Moltbot, операционный директор Frogface Studio. Координируешь работу всех агентов, управляешь приоритетами, следишь за прогрессом проектов.",
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
    systemPrompt: "Ты — Game Master. Ведёшь нарратив жизни Архитектора как RPG. Выдаёшь ачивки, пишешь летопись, генерируешь отчёты в стиле фэнтези.",
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
    systemPrompt: "Ты — Аналитик. Анализируешь метрики проектов, считаешь unit-экономику, прогнозируешь MRR, приоритизируешь задачи по impact.",
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
    systemPrompt: "Ты — Маркетолог. Исследуешь рынок, анализируешь конкурентов, строишь стратегии роста, находишь каналы привлечения.",
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
    systemPrompt: "Ты — Контент-мейкер. Пишешь посты, копирайт, ведёшь контент-план. Стиль: дерзкий, живой, с юмором. Без корпоративного буллшита.",
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
    systemPrompt: "Ты — Дизайнер. Генерируешь визуальный контент: баннеры, креативы, иллюстрации. Используешь FreePik API и AI-генерацию.",
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
    systemPrompt: "Ты — Сейлз-агент. Ведёшь холодные продажи, outreach, follow-up. Закрываешь сделки. Стиль: экспертный, без давления.",
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
    systemPrompt: "Ты — Страж. Защищаешь от распыления и хаоса. Делаешь pre-mortem анализ решений. Если видишь потерю фокуса — сигнализируешь.",
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
