import Link from 'next/link';

export function StubPage({
  num,
  title,
  kicker,
  hint,
  backTo = '/',
  backLabel = '← в болото',
}: {
  num: string;
  title: string;
  kicker: string;
  hint: string;
  backTo?: string;
  backLabel?: string;
}) {
  return (
    <main className="relative min-h-dvh px-6 md:px-10 pt-24 md:pt-32 pb-24">
      <div className="max-w-4xl mx-auto stub-card rounded-2xl p-8 md:p-12">
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-canon-tan/80 mb-4">
          / {num} / {kicker}
        </div>
        <h1
          className="font-display font-bold leading-[0.9] tracking-tight text-canon-paper"
          style={{ fontSize: 'clamp(48px, 9vw, 140px)' }}
        >
          {title}
        </h1>
        <div className="mt-8 inline-flex items-center gap-3 px-4 py-2 border border-firefly/40 rounded-full font-mono text-xs uppercase tracking-[0.25em] text-firefly">
          <span className="size-2 rounded-full bg-firefly animate-pulse" />
          под стройкой
        </div>
        <p className="mt-6 text-canon-light max-w-2xl text-lg leading-relaxed">{hint}</p>
        <Link
          href={backTo}
          className="mt-12 inline-flex items-center gap-2 font-mono text-sm uppercase tracking-[0.2em] text-canon-light hover:text-firefly border-b border-canon-light/40 hover:border-firefly py-1"
        >
          {backLabel}
        </Link>
      </div>
    </main>
  );
}
