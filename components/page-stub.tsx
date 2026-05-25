import Link from "next/link";

export function PageStub({
  num,
  title,
  kicker,
  hint,
}: {
  num: string;
  title: string;
  kicker: string;
  hint: string;
}) {
  return (
    <main className="relative min-h-[100dvh] px-6 md:px-10 pt-32 md:pt-40 pb-24">
      <div className="zerno" />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-paper-dim mb-4">
          / {num} / {kicker}
        </div>
        <h1
          className="font-display font-bold leading-[0.9] tracking-tight"
          style={{ fontSize: "clamp(56px, 12vw, 200px)" }}
        >
          {title}
        </h1>
        <div className="mt-10 inline-flex items-center gap-3 bg-graphite-soft border border-graphite-line rounded-full px-5 py-3 font-mono text-xs uppercase tracking-[0.25em] text-paper-dim">
          <span className="size-2 rounded-full bg-punk blink" />
          под стройкой / coming back with the voice tape
        </div>
        <p className="mt-8 text-paper-dim max-w-2xl text-lg">
          {hint}
        </p>
        <Link
          href="/"
          data-cursor="hover"
          className="mt-12 inline-flex items-center gap-2 font-mono text-sm uppercase tracking-[0.2em] text-paper-dim hover:text-lime border-b border-paper-dim/40 hover:border-lime py-1"
        >
          ← обратно на главную
        </Link>
      </div>
    </main>
  );
}
