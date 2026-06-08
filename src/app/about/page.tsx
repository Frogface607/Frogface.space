import Link from 'next/link';
import AboutScroll from '@/components/about/AboutScroll';

export const metadata = { title: 'About — Frogface' };

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
            БИОГРАФИЯ
          </div>
          <Link href="/studio" className="font-mono text-xs uppercase tracking-[0.25em] hover:text-canon-olive">
            → STUDIO
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-16 md:py-24 max-w-3xl mx-auto">
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-canon-olive mb-3">
          / кто я
        </div>
        <h1
          className="font-display font-bold leading-[0.9] tracking-tight"
          style={{ fontSize: 'clamp(48px, 9vw, 120px)' }}
        >
          Серёжа Орлов.<br />
          <span className="text-canon-olive">Frogface.</span>
        </h1>
        <p className="mt-8 text-lg text-canon-grey leading-relaxed max-w-2xl">
          15 лет придумывал миры — одежду, студии, бар, бургерную, музыку. Было много
          вкуса, идей и души. Не хватало одного — системы. Теперь делаю так же
          интересно, но системно. Вот как я сюда добрался.
        </p>
      </section>

      {/* Scroll-comic panels */}
      <AboutScroll />

      {/* Footer CTA — warm dawn toward the Tower */}
      <section className="relative border-t border-canon-ink/15 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(244,244,240,0) 0%, rgba(212,184,134,0.18) 55%, rgba(107,122,63,0.22) 100%)',
          }}
        />
        <div className="relative px-6 py-20 max-w-3xl mx-auto">
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-canon-olive mb-3">
            / цель на горизонте
          </div>
          <h3 className="font-display font-bold text-3xl md:text-5xl mb-5 leading-tight">
            Дойти до башни.
          </h3>
          <p className="text-canon-ink/80 text-lg leading-relaxed mb-10 max-w-2xl">
            Это всё ещё пишется. Каждый новый проект — новое здание на карте, шаг к
            башне на горизонте. Хочешь следить — канал{' '}
            <a
              href="https://t.me/sergeyorlove"
              className="underline decoration-canon-olive/50 hover:text-canon-olive"
            >
              «С лицом лягушки»
            </a>
            . Хочешь сделать вместе —{' '}
            <Link href="/studio" className="underline decoration-canon-olive/50 hover:text-canon-olive">
              Frogface Studio
            </Link>
            .
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-[0.2em] bg-canon-ink text-canon-paper px-6 py-3 hover:bg-canon-olive transition-colors"
            >
              работать вместе →
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-[0.2em] text-canon-ink hover:text-canon-olive border-b border-canon-ink/40 hover:border-canon-olive py-1"
            >
              ← обратно в болото
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
