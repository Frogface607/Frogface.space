import Image from 'next/image';
import Link from 'next/link';

export const metadata = { title: 'Now — Frogface' };

// Update this object to update /now page (Release 2 — pipe to Telegram autoposter)
const NOW = {
  updated: '27 мая 2026',
  location: 'Бангкок ↔ Иркутск (по обстоятельствам)',
  mood: 'tired but moving',
  body: [
    'Перезапускаю **frogface.space** — переписал с нуля под cartoon-мир, по которому можно ходить. Хижина моя, бар Edison рядом. Внутри хижины — рабочий стол с лавовой лампой и кружкой "NO FUNDS". Этой ночью добил MVP с маскотом, Studio-лендингом и /about-комиксом.',
    'Параллельно — **Edison Bar закрывается 31 мая** (через 4 дня). 9.5 лет музыкальной сцены Иркутска. Делаю последний фестиваль 29-31 мая.',
    '**Frogface Studio** — упаковываю систему Edison (11 модулей) в продукт для других баров и ресторанов. Первые клиенты — после релиза.',
    'В фоне — **8FATES** (RPG-проект), **Operator** (личный AI-коуч), **WIZL** (cannabis-вселенная для EN/TH рынков).',
  ],
};

const STACK_NOW = [
  { name: 'Frogface Studio', state: 'launch in 7-14 days', tag: '$$' },
  { name: 'Edison Bar', state: 'closing 31 May 2026', tag: 'CLOSED' },
  { name: '8FATES', state: 'Sprint 2 in progress', tag: 'R&D' },
  { name: 'Operator', state: 'prod-ready local', tag: 'R&D' },
  { name: 'WIZL', state: 'EN/TH only, content phase', tag: 'CONTENT' },
];

export default function NowPage() {
  return (
    <main className="relative min-h-dvh bg-canon-paper text-canon-ink">
      <header className="sticky top-0 z-40 bg-canon-paper/90 backdrop-blur border-b border-canon-ink/10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-mono text-xs uppercase tracking-[0.25em] hover:text-canon-olive">
            ← в болото
          </Link>
          <div className="font-mono text-xs uppercase tracking-[0.25em] text-canon-olive">
            01 / NOW
          </div>
          <Link href="/about" className="font-mono text-xs uppercase tracking-[0.25em] hover:text-canon-olive">
            → биография
          </Link>
        </div>
      </header>

      <section className="px-6 py-16 md:py-24 max-w-3xl mx-auto">
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-canon-olive mb-3">
          / 01 / now / now / now
        </div>
        <h1
          className="font-display font-bold leading-[0.9] tracking-tight"
          style={{ fontSize: 'clamp(48px, 9vw, 120px)' }}
        >
          Над чем<br />
          я <span className="text-canon-olive">работаю</span><br />
          прямо сейчас
        </h1>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <div className="font-mono text-xs uppercase tracking-[0.2em]">
            <span className="text-canon-grey">обновлено:</span>{' '}
            <span className="text-canon-ink">{NOW.updated}</span>
          </div>
          <div className="font-mono text-xs uppercase tracking-[0.2em]">
            <span className="text-canon-grey">где я:</span>{' '}
            <span className="text-canon-ink">{NOW.location}</span>
          </div>
          <div className="font-mono text-xs uppercase tracking-[0.2em]">
            <span className="text-canon-grey">состояние:</span>{' '}
            <span className="text-canon-ink">{NOW.mood}</span>
          </div>
        </div>
      </section>

      <section className="px-6 max-w-3xl mx-auto">
        <div className="relative aspect-video w-full mb-12 bg-canon-ink/5 overflow-hidden">
          <Image src="/world/now/hero.png" alt="Frogface at work" fill className="object-cover" />
        </div>

        <div className="space-y-6 text-lg leading-relaxed text-canon-ink/85">
          {NOW.body.map((p, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
          ))}
        </div>
      </section>

      <section className="px-6 py-16 md:py-24 max-w-3xl mx-auto">
        <h2 className="font-display font-bold text-3xl md:text-4xl mb-8">
          Стек проектов сейчас
        </h2>
        <div className="space-y-3">
          {STACK_NOW.map((s) => (
            <div
              key={s.name}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-canon-ink/10 py-3"
            >
              <div className="font-display font-bold text-lg">{s.name}</div>
              <div className="text-canon-grey text-sm flex-1 ml-4 hidden md:block">{s.state}</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] px-2 py-1 bg-canon-ink/8">
                {s.tag}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-canon-grey italic">
          Эта страница обновляется руками. Релизом 2 подключу автопостинг в Telegram-канал{' '}
          <a href="https://t.me/sergeyorlove" className="underline hover:text-canon-olive">
            @sergeyorlove
          </a>
          .
        </p>
      </section>

      <footer className="border-t border-canon-ink/15 px-6 py-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-xs font-mono text-canon-grey">
          <Link href="/" className="hover:text-canon-olive">← в болото</Link>
          <span>frogface.space · now</span>
          <Link href="/studio" className="hover:text-canon-olive">→ studio</Link>
        </div>
      </footer>
    </main>
  );
}
