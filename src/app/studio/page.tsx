import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Frogface Studio — Автоматизация бизнеса',
  description:
    '9 лет управлял баром. Построил систему которая делала 90% операционки за меня. Закрыл бар. Теперь делаю такие системы под других. Пакеты $3K / $5K / $7.5-10K.',
};

const PAIN_CARDS = [
  {
    img: '/world/studio/pain-reviews.png',
    fallback: '/world/now/hero.png',
    title: 'Завалили отзывы',
    line: '87 непрочитанных. Каждый ждёт ответа.',
    fix: 'AI отвечает в твоём стиле, ты только апрувишь.',
  },
  {
    img: '/world/studio/pain-bookings.png',
    fallback: '/world/now/hero.png',
    title: 'Потеряли бронь',
    line: 'Гость пришёл — стол не готов. Звонят все вместе.',
    fix: 'Realtime схема зала. Гость сам выбирает — кухня видит сразу.',
  },
  {
    img: '/world/studio/pain-announcements.png',
    fallback: '/world/now/hero.png',
    title: 'Пишешь анонсы руками',
    line: '15 минут на пост. Концерт через 3 часа.',
    fix: 'Кнопка → AI пишет в твоём голосе → постится сама.',
  },
  {
    img: '/world/studio/pain-staff.png',
    fallback: '/world/now/hero.png',
    title: 'Стажёр на неделю',
    line: 'Каждого нового вводишь руками. Снова и снова.',
    fix: 'Staff-панель с базой знаний и сменами. День — и стажёр в строю.',
  },
];

const EDISON_MODULES = [
  { name: 'AI-генератор анонсов', tag: 'CONTENT' },
  { name: 'Social Media генератор', tag: 'CONTENT' },
  { name: 'Постер-генератор с QR', tag: 'CONTENT' },
  { name: 'Telegram автопостинг', tag: 'AUTOMATION' },
  { name: 'Бронирование с FloorPlan', tag: 'OPS' },
  { name: 'Меню/каталог с фильтрами', tag: 'OPS' },
  { name: 'Telegram-бот гость+админ', tag: 'AUTOMATION' },
  { name: 'Staff-панель', tag: 'OPS' },
  { name: 'Система доставки', tag: 'OPS' },
  { name: 'PWA — сайт как приложение', tag: 'TECH' },
  { name: 'Admin-панель «всё в одном»', tag: 'OPS' },
];

const PACKAGES = [
  {
    name: 'Lite',
    price: '$3K',
    duration: '2-3 недели',
    target: 'Небольшой бар/кафе до 30 столов',
    includes: [
      'AI-анонсы + Social генератор + Постер с QR',
      'Меню/каталог',
      'PWA',
      'Telegram-бот (базовый)',
      'Admin-панель',
    ],
  },
  {
    name: 'Pro',
    price: '$5K',
    duration: '3-4 недели',
    target: 'Средний бар с регулярными событиями',
    includes: [
      'Всё из Lite',
      'Бронирование с FloorPlan',
      'Telegram-бот расширенный',
      'Staff-панель',
      'Cron-автопостинг',
    ],
    featured: true,
  },
  {
    name: 'Full OS',
    price: '$7.5-10K',
    duration: '4-6 недель',
    target: 'Крупный ресторан, сеть, серьёзные операторы',
    includes: [
      'Всё из Pro',
      'Доставка',
      'Кастомизация под клиента',
      '1 месяц поддержки',
      'Обучение команды',
    ],
  },
];

const PROCESS = [
  { num: '01', name: 'Брифинг', desc: '30 мин звонок. Понимаю боль, объясняю что делаем.', time: '~1 неделя', img: '/world/process/01-briefing.png' },
  { num: '02', name: 'План', desc: 'Документ: модули, сроки, цена. Подписываем.', time: '~3 дня', img: '/world/process/02-plan.png' },
  { num: '03', name: 'Build', desc: 'Строю сам. Показываю недельные прогресс-видео.', time: '2-4 недели', img: '/world/process/03-build.png' },
  { num: '04', name: 'Handover', desc: 'Передаю владение. Обучение команды. 1 месяц поддержки.', time: 'неделя', img: '/world/process/04-handover.png' },
];

export default function StudioPage() {
  return (
    <main className="relative min-h-dvh bg-canon-paper text-canon-ink overflow-x-hidden">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-canon-paper/90 backdrop-blur border-b border-canon-ink/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-mono text-xs uppercase tracking-[0.25em] text-canon-ink hover:text-canon-olive">
            ← в болото
          </Link>
          <div className="font-mono text-xs uppercase tracking-[0.25em] text-canon-olive">
            FROGFACE STUDIO
          </div>
          <a
            href="#brief"
            className="font-mono text-xs uppercase tracking-[0.25em] px-4 py-2 bg-canon-ink text-canon-paper hover:bg-canon-olive transition-colors"
          >
            Брифинг →
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative px-6 py-20 md:py-32 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-canon-olive mb-4">
              / 00 / Frogface Studio
            </div>
            <h1
              className="font-display font-bold leading-[0.9] tracking-tight"
              style={{ fontSize: 'clamp(48px, 8vw, 112px)' }}
            >
              Автоматизация
              <br />
              <span className="text-canon-olive">и упаковка</span>
              <br />
              бизнеса.
            </h1>
            <p className="mt-8 text-lg md:text-xl text-canon-grey leading-relaxed max-w-xl">
              9.5 лет управлял баром. Построил систему которая делала{' '}
              <span className="text-canon-ink font-medium">90% операционки</span> за меня.
              Закрыл бар. Теперь делаю такие системы под других.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#brief"
                className="inline-flex items-center gap-2 bg-canon-ink text-canon-paper font-mono text-sm uppercase tracking-[0.2em] px-6 py-4 hover:bg-canon-olive transition-colors"
              >
                Брифинг бесплатно — 30 мин →
              </a>
              <a
                href="#cases"
                className="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-[0.2em] text-canon-ink border-b border-canon-ink/40 hover:border-canon-olive hover:text-canon-olive py-1"
              >
                Сначала посмотрю кейсы →
              </a>
            </div>
          </div>
          <div className="relative aspect-[4/3] w-full">
            <Image
              src="/world/studio/hero.png"
              alt="Frogface в студии"
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>
      </section>

      {/* PAIN CARDS */}
      <section className="bg-canon-ink text-canon-paper py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-canon-tan mb-3">
            / 01 / боли
          </div>
          <h2 className="font-display font-bold text-3xl md:text-5xl mb-12 max-w-3xl">
            Каждый день одна и та же ебанина.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PAIN_CARDS.map((p) => (
              <div key={p.title} className="bg-canon-ink/40 border border-canon-paper/15 p-5 hover:border-canon-tan transition-colors">
                <div className="relative aspect-square w-full mb-4 bg-canon-paper/5 overflow-hidden">
                  <Image src={p.img} alt={p.title} fill className="object-cover" />
                </div>
                <div className="font-display font-bold text-lg mb-2">{p.title}</div>
                <div className="text-sm text-canon-light leading-relaxed mb-3">{p.line}</div>
                <div className="text-xs font-mono uppercase tracking-wider text-canon-tan">
                  → {p.fix}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EDISON MODULES */}
      <section id="cases" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-canon-olive mb-3">
            / 02 / что умеем
          </div>
          <h2 className="font-display font-bold text-3xl md:text-5xl mb-4 max-w-3xl">
            11 модулей. 9.5 лет в проде.
          </h2>
          <p className="text-canon-grey max-w-2xl mb-12">
            Всё что ниже — реально работало в Edison Bar. Каждый модуль продаётся отдельно или в составе пакета.
            Если хочешь увидеть как — открой <a href="https://edisonbar.ru" className="underline hover:text-canon-olive">edisonbar.ru</a>.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {EDISON_MODULES.map((m, i) => (
              <div
                key={m.name}
                className="border border-canon-ink/15 p-5 hover:border-canon-olive hover:bg-canon-paper transition-colors"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-canon-tan mb-2">
                  {String(i + 1).padStart(2, '0')} · {m.tag}
                </div>
                <div className="font-display font-bold text-lg">{m.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <section className="bg-canon-paper-warm py-20 md:py-28" style={{ background: '#ece5d0' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-canon-olive mb-3">
            / 03 / пакеты
          </div>
          <h2 className="font-display font-bold text-3xl md:text-5xl mb-12 max-w-3xl">
            Цены явно. Сроки явно.
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.name}
                className={`p-6 ${
                  pkg.featured
                    ? 'bg-canon-ink text-canon-paper border-2 border-canon-olive'
                    : 'bg-canon-paper border-2 border-canon-ink/15'
                }`}
              >
                <div className={`font-mono text-[11px] uppercase tracking-[0.25em] mb-3 ${pkg.featured ? 'text-canon-tan' : 'text-canon-olive'}`}>
                  {pkg.name}
                </div>
                <div className="font-display font-bold text-5xl mb-2">{pkg.price}</div>
                <div className={`font-mono text-xs mb-4 ${pkg.featured ? 'text-canon-light' : 'text-canon-grey'}`}>
                  {pkg.duration} · {pkg.target}
                </div>
                <ul className="space-y-2 text-sm">
                  {pkg.includes.map((i) => (
                    <li key={i} className="flex gap-2">
                      <span className={pkg.featured ? 'text-canon-tan' : 'text-canon-olive'}>✓</span>
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#brief"
                  className={`mt-6 inline-block w-full text-center font-mono text-xs uppercase tracking-[0.2em] py-3 ${
                    pkg.featured
                      ? 'bg-canon-paper text-canon-ink hover:bg-canon-olive hover:text-canon-paper'
                      : 'bg-canon-ink text-canon-paper hover:bg-canon-olive'
                  } transition-colors`}
                >
                  Брифинг →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-canon-olive mb-3">
            / 04 / процесс
          </div>
          <h2 className="font-display font-bold text-3xl md:text-5xl mb-12 max-w-3xl">
            Четыре шага. Без сюрпризов.
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {PROCESS.map((p) => (
              <div key={p.num} className="border-t-2 border-canon-ink pt-4">
                <div className="relative aspect-square w-full mb-4 bg-canon-ink/5 overflow-hidden">
                  <Image src={p.img} alt={p.name} fill className="object-cover" />
                </div>
                <div className="font-mono text-xs uppercase tracking-[0.25em] text-canon-olive mb-2">
                  {p.num}
                </div>
                <div className="font-display font-bold text-2xl mb-2">{p.name}</div>
                <div className="text-sm text-canon-grey mb-3">{p.desc}</div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-canon-tan">
                  {p.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT WHO */}
      <section className="bg-canon-ink text-canon-paper py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-canon-tan mb-3">
              / 05 / кто я
            </div>
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-6">
              Серёжа Орлов.<br />Frogface.
            </h2>
            <p className="text-canon-light leading-relaxed mb-4">
              9.5 лет директор Edison Bar в Иркутске. Закрыл его в мае 2026. Сам строил всю операционную систему — все 11 модулей, которые сейчас продаю.
            </p>
            <p className="text-canon-light leading-relaxed mb-4">
              Не агентство. Не команда. Один человек который реально умеет делать. Без аккаунт-менеджеров, водянных созвонов и буллшита.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 mt-4 font-mono text-sm uppercase tracking-[0.2em] text-canon-tan hover:text-canon-paper border-b border-canon-tan/40 hover:border-canon-paper py-1"
            >
              Полная история →
            </Link>
          </div>
          <div className="relative aspect-square w-full max-w-sm mx-auto">
            <Image
              src="/world/about/hero.png"
              alt="Сергей Орлов"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* BRIEF */}
      <section id="brief" className="py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-6">
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-canon-olive mb-3">
            / 06 / брифинг
          </div>
          <h2 className="font-display font-bold text-3xl md:text-5xl mb-4">
            30 мин звонок.<br />Без воды.
          </h2>
          <p className="text-canon-grey mb-8">
            Расскажи в двух словах про бизнес. Я прикину что тебе подойдёт и пришлю план + цену в течение суток.
          </p>
          <form className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-canon-grey mb-2">Бизнес</label>
              <input
                type="text"
                placeholder="Бар, ресторан, кафе, барбершоп..."
                className="w-full bg-canon-paper border-2 border-canon-ink/15 px-4 py-3 text-canon-ink focus:border-canon-olive outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-canon-grey mb-2">Боль (1-2 предложения)</label>
              <textarea
                rows={3}
                placeholder="Что тебя заёбывает каждый день?"
                className="w-full bg-canon-paper border-2 border-canon-ink/15 px-4 py-3 text-canon-ink focus:border-canon-olive outline-none resize-none"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-canon-grey mb-2">Бюджет</label>
                <select className="w-full bg-canon-paper border-2 border-canon-ink/15 px-4 py-3 text-canon-ink focus:border-canon-olive outline-none">
                  <option>$3K (Lite)</option>
                  <option>$5K (Pro)</option>
                  <option>$7.5-10K (Full)</option>
                  <option>не знаю — обсудим</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-canon-grey mb-2">Контакт</label>
                <input
                  type="text"
                  placeholder="@telegram или email"
                  className="w-full bg-canon-paper border-2 border-canon-ink/15 px-4 py-3 text-canon-ink focus:border-canon-olive outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled
              className="w-full bg-canon-ink text-canon-paper font-mono text-sm uppercase tracking-[0.2em] py-4 hover:bg-canon-olive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Отправить (форма будет подключена в релизе)
            </button>
          </form>
          <p className="text-xs text-canon-grey mt-4 text-center">
            Пока форма не подключена — пиши в Telegram: <a href="https://t.me/sergey_orlove" className="underline hover:text-canon-olive">@sergey_orlove</a>
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-canon-ink/15 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-canon-grey">
          <div>© {new Date().getFullYear()} Frogface Studio · by Серёжа Орлов</div>
          <Link href="/" className="hover:text-canon-olive">← в болото</Link>
        </div>
      </footer>
    </main>
  );
}
