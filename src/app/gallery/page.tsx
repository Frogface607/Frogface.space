import Link from 'next/link';
import { StubPage } from '@/components/ui/StubPage';

export const metadata = { title: 'Gallery — Frogface' };

// Future: replace with real Edison poster archive
// (~150-200 concert posters by Серёжа over 9.5 years)
// For now — placeholder grid that shows the structure

const PLACEHOLDER_COUNT = 18;

export default function GalleryPage() {
  return (
    <main className="relative min-h-dvh bg-canon-paper text-canon-ink">
      <header className="sticky top-0 z-40 bg-canon-paper/90 backdrop-blur border-b border-canon-ink/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-mono text-xs uppercase tracking-[0.25em] hover:text-canon-olive">
            ← в болото
          </Link>
          <div className="font-mono text-xs uppercase tracking-[0.25em] text-canon-olive">
            02 / ГАЛЕРЕЯ
          </div>
          <Link href="/about" className="font-mono text-xs uppercase tracking-[0.25em] hover:text-canon-olive">
            → биография
          </Link>
        </div>
      </header>

      <section className="px-6 py-16 md:py-24 max-w-6xl mx-auto">
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-canon-olive mb-3">
          / 02 / афиши и дизайн
        </div>
        <h1
          className="font-display font-bold leading-[0.9] tracking-tight"
          style={{ fontSize: 'clamp(48px, 9vw, 120px)' }}
        >
          Галерея.
        </h1>
        <p className="mt-8 text-lg text-canon-grey leading-relaxed max-w-2xl">
          9.5 лет афиш Edison Bar, концертных постеров, обложек, фирменного стиля. Каждая работа — руками, в Procreate или Affinity. Архив пока загружается — увидишь скоро.
        </p>
        <div className="mt-8 inline-flex items-center gap-3 px-4 py-2 border border-canon-olive/40 rounded-full font-mono text-xs uppercase tracking-[0.25em] text-canon-olive">
          <span className="size-2 rounded-full bg-canon-olive animate-pulse" />
          архив подвозят
        </div>
      </section>

      {/* Placeholder grid */}
      <section className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] bg-canon-ink/5 border border-canon-ink/10 flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.25em] text-canon-ink/30"
            >
              poster {String(i + 1).padStart(3, '0')}
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-canon-ink/15 px-6 py-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs font-mono text-canon-grey">
          <Link href="/" className="hover:text-canon-olive">← в болото</Link>
          <span>frogface.space · gallery</span>
        </div>
      </footer>
    </main>
  );
}
