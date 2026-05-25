import { Hero } from "@/components/hero";
import { NowTicker } from "@/components/now-ticker";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative">
      <Hero />
      <NowTicker />
      <ManifestoBlock />
    </main>
  );
}

function ManifestoBlock() {
  return (
    <section className="relative px-6 md:px-10 py-24 md:py-32 max-w-6xl mx-auto">
      <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-paper-dim mb-6">
        / 00 / зачем это всё
      </div>
      <p className="font-display text-2xl md:text-4xl leading-snug max-w-4xl text-paper">
        Я Серёжа Орлов.
        <br />
        <span className="text-paper-dim">9.5 лет</span> держал бар в Иркутске.{" "}
        <span className="text-paper-dim">2 года</span> писал код по ночам.{" "}
        <span className="text-lime">Сейчас одно сливается в другое.</span>
      </p>
      <p className="mt-8 font-display text-lg md:text-xl text-paper-dim leading-relaxed max-w-3xl">
        Frogface — это студия одного панка. Здесь живёт всё: коммерческие
        системы для общепита, личные продукты, контент про лягух, и история
        как я ко всему этому пришёл.
      </p>
      <div className="mt-12 flex flex-wrap gap-3 font-mono text-[11px] uppercase tracking-[0.2em]">
        <Link href="/about" data-cursor="hover" className="px-4 py-2 border border-paper/30 rounded-full hover:border-lime hover:text-lime">
          → биография
        </Link>
        <Link href="/now" data-cursor="hover" className="px-4 py-2 border border-paper/30 rounded-full hover:border-lime hover:text-lime">
          → now / now / now
        </Link>
        <Link href="/projects" data-cursor="hover" className="px-4 py-2 border border-paper/30 rounded-full hover:border-lime hover:text-lime">
          → продукты
        </Link>
        <Link href="/studio" data-cursor="hover" className="px-4 py-2 border border-paper/30 rounded-full hover:border-lime hover:text-lime">
          → услуги
        </Link>
      </div>
    </section>
  );
}
