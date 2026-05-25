"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { GlitchTitle } from "./glitch-title";
import { ParallaxFrog } from "./parallax-frog";

export function Hero() {
  return (
    <section className="relative min-h-[100dvh] w-full overflow-hidden bg-graphite text-paper pt-24 md:pt-28 pb-16">
      <div className="zerno" />
      <div className="scanline" />

      {/* corner crosshairs — комикс-метки */}
      <Crosshair className="top-24 left-6 md:left-10" />
      <Crosshair className="top-24 right-6 md:right-10" rotate={90} />
      <Crosshair className="bottom-10 left-6 md:left-10" rotate={-90} />
      <Crosshair className="bottom-10 right-6 md:right-10" rotate={180} />

      {/* top kicker */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="relative z-10 px-6 md:px-10 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.25em] text-paper-dim"
      >
        <span>est. 2026 / no. 002</span>
        <span className="hidden md:inline">студия одного панка</span>
        <span>иркутск ↔ бкк</span>
      </motion.div>

      {/* main stage */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 lg:gap-10 px-6 md:px-10 mt-10 md:mt-16">
        {/* huge title */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.2, 0.9, 0.2, 1] }}
            className="relative"
          >
            <h1
              data-text="FROGFACE"
              className="glitch relative font-display font-bold leading-[0.85] tracking-tight text-paper select-none"
              style={{ fontSize: "clamp(72px, 16vw, 280px)" }}
            >
              <GlitchTitle text="FROGFACE" />
            </h1>
            <div
              className="absolute -bottom-2 left-1 right-1 h-px bg-paper/20"
              aria-hidden
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7 }}
            className="mt-6 max-w-2xl font-display text-xl md:text-2xl leading-snug text-paper/90"
          >
            <span className="text-paper-dim">/ manifest /</span>{" "}
            делаю продукты руками одного человека.{" "}
            <span className="text-lime">9.5 лет бара</span>,{" "}
            <span className="text-punk">сотни ночей кода</span>,{" "}
            один лягушачий мордоворот вместо логотипа.
            <span className="block mt-3 text-base text-paper-dim font-mono">
              wizl.space · edisonbar.ru · my-reply.ru · posadyat.ru · 8fates
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85, duration: 0.6 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/studio"
              data-cursor="hover"
              className="group inline-flex items-center gap-3 bg-lime text-graphite font-mono text-sm uppercase tracking-[0.2em] px-6 py-4 rounded-full hover:bg-paper transition-colors"
            >
              <span className="size-2 rounded-full bg-graphite group-hover:bg-punk transition-colors" />
              нужна такая же система
              <span className="text-base">→</span>
            </Link>
            <Link
              href="/about"
              data-cursor="hover"
              className="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-[0.2em] text-paper-dim hover:text-paper border-b border-paper-dim/40 hover:border-paper py-1"
            >
              сначала кто я →
            </Link>
          </motion.div>
        </div>

        {/* frog stage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.9, ease: [0.2, 0.9, 0.2, 1] }}
          className="relative aspect-square w-full max-w-[520px] mx-auto"
        >
          <ParallaxFrog />
          {/* speech bubble */}
          <motion.div
            initial={{ opacity: 0, y: 8, rotate: -3 }}
            animate={{ opacity: 1, y: 0, rotate: -3 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="absolute top-6 -left-2 md:-left-8 bg-paper text-graphite font-display font-bold text-sm md:text-base px-4 py-2 rounded-2xl shadow-[6px_6px_0_#0e0e10]"
          >
            привет, я frogface.
            <span className="absolute -bottom-2 left-8 size-4 bg-paper rotate-45" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8, rotate: 4 }}
            animate={{ opacity: 1, y: 0, rotate: 4 }}
            transition={{ delay: 1.4, duration: 0.5 }}
            className="absolute bottom-10 -right-2 md:-right-6 bg-lime text-graphite font-display font-bold text-sm md:text-base px-4 py-2 rounded-2xl shadow-[6px_6px_0_#0e0e10]"
          >
            строю студию. ★★★★★
            <span className="absolute -top-2 right-6 size-4 bg-lime rotate-45" />
          </motion.div>
        </motion.div>
      </div>

      {/* bottom strip — featured projects pre-teaser */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="relative z-10 mt-20 md:mt-24 px-6 md:px-10"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { tag: "флагман-кейс", name: "Edison Toolkit", desc: "OS для бара" },
            { tag: "креатив", name: "WIZL Space", desc: "cannabis-вселенная" },
            { tag: "продукт", name: "MyReply", desc: "AI для маркетплейсов" },
            { tag: "viral", name: "Posadyat", desc: "законы РФ → понятно" },
          ].map((p) => (
            <Link
              key={p.name}
              href="/projects"
              data-cursor="hover"
              className="group block p-4 border border-graphite-line rounded-2xl hover:border-lime hover:bg-graphite-soft transition-colors"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-paper-dim group-hover:text-lime">
                {p.tag}
              </div>
              <div className="font-display font-bold text-lg mt-2">{p.name}</div>
              <div className="text-paper-dim text-sm mt-1">{p.desc}</div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 font-mono text-[10px] uppercase tracking-[0.3em] text-paper-dim flex flex-col items-center gap-1"
      >
        <span>scroll</span>
        <span className="block h-6 w-px bg-paper-dim/60" />
      </motion.div>
    </section>
  );
}

function Crosshair({ className = "", rotate = 0 }: { className?: string; rotate?: number }) {
  return (
    <svg
      aria-hidden
      width="22"
      height="22"
      viewBox="0 0 22 22"
      className={`absolute z-10 text-paper/40 ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <path d="M 0 11 L 22 11 M 11 0 L 11 22" stroke="currentColor" strokeWidth="1" />
      <circle cx="11" cy="11" r="2" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
