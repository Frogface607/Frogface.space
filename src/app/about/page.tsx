import Link from 'next/link';
import AboutScroll from '@/components/about/AboutScroll';
import TowerClimax from '@/components/about/TowerClimax';
import ScrollProgress from '@/components/about/ScrollProgress';
import SmoothScroll from '@/components/about/SmoothScroll';
import DawnBackdrop from '@/components/about/DawnBackdrop';

export const metadata = { title: 'About — Frogface' };

export default function AboutPage() {
  return (
    <main className="relative min-h-dvh text-canon-ink font-body">
      <SmoothScroll />
      <ScrollProgress />
      <DawnBackdrop />

      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-canon-paper/80 backdrop-blur border-b border-canon-ink/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-mono text-xs uppercase tracking-[0.25em] hover:text-canon-olive transition-colors">
            ← в болото
          </Link>
          <div className="font-mono text-xs uppercase tracking-[0.25em] text-canon-olive">
            биография
          </div>
          <Link href="/studio" className="font-mono text-xs uppercase tracking-[0.25em] hover:text-canon-olive transition-colors">
            → studio
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 md:pt-28 md:pb-24 max-w-4xl mx-auto">
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-canon-olive mb-4">
          / кто я
        </div>
        <h1
          className="font-display font-bold leading-[0.9] tracking-tight text-canon-ink"
          style={{ fontSize: 'clamp(48px, 9vw, 120px)' }}
        >
          Серёжа Орлов.<br />
          <span className="text-canon-olive">Frogface.</span>
        </h1>
        <p className="mt-8 font-body text-lg md:text-xl text-canon-ink/70 leading-[1.7] max-w-2xl">
          15 лет придумывал миры — одежду, студии, бар, бургерную, музыку. Было
          много вкуса, идей и души. Не хватало одного — системы. Теперь делаю так же
          интересно, но системно. Вот как я сюда добрался.
        </p>
        <div className="mt-10 font-mono text-[11px] uppercase tracking-[0.3em] text-canon-ink/40">
          ↓ листай вниз
        </div>
      </section>

      {/* Scroll-comic panels 01–09 */}
      <AboutScroll />

      {/* Pinned finale → the Tower */}
      <TowerClimax />
    </main>
  );
}
