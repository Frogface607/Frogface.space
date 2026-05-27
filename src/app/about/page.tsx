import Image from 'next/image';
import Link from 'next/link';

export const metadata = { title: 'About — Frogface' };

const PANELS = [
  {
    num: '01',
    year: '~1995',
    place: 'Иркутск, Новоленино',
    title: 'Откуда всё начиналось',
    image: '/world/about/01-irkutsk.png',
    text: 'Советский двор, панельки, зимы по -30. Филфак ИГУ — литература и язык. Музыка, рэп, стихи. С детства тянуло строить и рассказывать истории.',
  },
  {
    num: '02',
    year: '~2014',
    place: 'Сбер / дизайн-студия',
    title: 'Первый бизнес — на третьем курсе',
    image: '/world/about/02-sber.png',
    text: 'Сначала корпорат — недолго, не моё. Потом своя дизайн-студия. Выгорел от заказов «логотип на завтра». Понял что хочу строить что-то своё с душой, а не на конвейере.',
  },
  {
    num: '03',
    year: '2016 — 2026',
    place: 'Edison Bar, Иркутск',
    title: '9.5 лет своего места',
    image: '/world/about/03-edison.png',
    text: 'Бар. Музыкальная сцена. Концерты, джемы, поэтические вечера. Сам учился всему — обслуживание, найм, продажи, маркетинг, IT, бухгалтерия, кризисы. К концу — построил систему из 11 модулей, которая делала 90% операционки за меня. Закрыл бар 31 мая 2026 потому что арендодатели окончательно выселили. Но система осталась.',
  },
  {
    num: '04',
    year: 'сейчас',
    place: 'Бангкок / Иркутск / куда занесёт',
    title: 'Frogface Studio + всё что хочется',
    image: '/world/about/04-bangkok.png',
    text: 'Перешёл на режим — где живу, там и работаю. Frogface Studio — упаковываю системы из Edison в продукт для других баров и ресторанов. Параллельно делаю что нравится: 8FATES (RPG), Operator (личный AI-коуч), Posadyat (viral checker), WIZL (cannabis-вселенная для EN/TH рынков). Frogface.space — это пространство для всего.',
  },
];

export default function AboutPage() {
  return (
    <main className="relative min-h-dvh bg-canon-paper text-canon-ink">
      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-canon-paper/90 backdrop-blur border-b border-canon-ink/10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-mono text-xs uppercase tracking-[0.25em] hover:text-canon-olive">
            ← в болото
          </Link>
          <div className="font-mono text-xs uppercase tracking-[0.25em] text-canon-olive">
            03 / БИОГРАФИЯ
          </div>
          <Link href="/studio" className="font-mono text-xs uppercase tracking-[0.25em] hover:text-canon-olive">
            → STUDIO
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-16 md:py-24 max-w-3xl mx-auto">
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-canon-olive mb-3">
          / 03 / кто я
        </div>
        <h1
          className="font-display font-bold leading-[0.9] tracking-tight"
          style={{ fontSize: 'clamp(48px, 9vw, 120px)' }}
        >
          Серёжа Орлов.<br />
          <span className="text-canon-olive">Frogface.</span>
        </h1>
        <p className="mt-8 text-lg text-canon-grey leading-relaxed max-w-2xl">
          Уставший предприниматель с нулём денег, пытается выбраться из болота. Собственно, вот история, как добрался досюда.
        </p>
      </section>

      {/* Panels */}
      <section className="px-6 pb-24 max-w-3xl mx-auto space-y-24 md:space-y-32">
        {PANELS.map((p) => (
          <article key={p.num} className="space-y-6">
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-canon-tan">
              <span className="text-canon-olive">/ {p.num} /</span>
              <span>{p.year}</span>
              <span className="opacity-60">·</span>
              <span>{p.place}</span>
            </div>
            <h2 className="font-display font-bold text-3xl md:text-5xl leading-tight">
              {p.title}
            </h2>
            <div className="relative aspect-video w-full bg-canon-ink/5 overflow-hidden">
              <Image src={p.image} alt={p.title} fill className="object-cover" />
            </div>
            <p className="text-lg text-canon-ink/85 leading-relaxed max-w-2xl">
              {p.text}
            </p>
          </article>
        ))}
      </section>

      {/* Footer CTA */}
      <section className="border-t border-canon-ink/15 px-6 py-16 max-w-3xl mx-auto">
        <h3 className="font-display font-bold text-2xl md:text-4xl mb-4">
          Это всё ещё пишется.
        </h3>
        <p className="text-canon-grey mb-8">
          Если хочешь следить — канал <a href="https://t.me/sergeyorlove" className="underline hover:text-canon-olive">@sergeyorlove</a> «С Лицом Лягушки».
          Если хочешь работать вместе — <Link href="/studio" className="underline hover:text-canon-olive">Frogface Studio</Link>.
          Если просто посмотреть — <Link href="/" className="underline hover:text-canon-olive">в болото</Link>.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-[0.2em] text-canon-ink hover:text-canon-olive border-b border-canon-ink/40 hover:border-canon-olive py-1"
        >
          ← обратно в болото
        </Link>
      </section>
    </main>
  );
}
