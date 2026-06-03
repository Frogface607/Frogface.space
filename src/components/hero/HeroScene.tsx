'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { Fireflies } from './Fireflies';

const HERO_IMG = '/world/hero.png';

/**
 * Главный кадр frogface.space.
 * Чистая картинка + CSS + Framer (без PixiJS) — грузится мгновенно.
 * Frogface слева на пирсе смотрит на Башню. Манифест в небе. Кнопка «В путь».
 */
export function HeroScene() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [leaving, setLeaving] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  // Subtle mouse / touch parallax on the background
  const onMove = (clientX: number, clientY: number) => {
    if (reduce || !wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const nx = (clientX - r.left) / r.width - 0.5;
    const ny = (clientY - r.top) / r.height - 0.5;
    setParallax({ x: -nx * 18, y: -ny * 12 });
  };

  const startJourney = () => {
    setLeaving(true);
    window.setTimeout(() => router.push('/world'), 900);
  };

  const ease = [0.2, 0.8, 0.2, 1] as const;

  return (
    <div
      ref={wrapRef}
      onMouseMove={(e) => onMove(e.clientX, e.clientY)}
      onTouchMove={(e) => e.touches[0] && onMove(e.touches[0].clientX, e.touches[0].clientY)}
      className="relative h-dvh w-full overflow-hidden bg-[#1a1230] text-[#f4ead5]"
    >
      {/* Background image with parallax + slow leave-zoom */}
      <motion.div
        className="absolute inset-[-4%]"
        style={{
          backgroundImage: `url(${HERO_IMG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 60%',
        }}
        animate={{
          x: parallax.x,
          y: parallax.y,
          scale: leaving ? 1.12 : 1.04,
        }}
        transition={{
          x: { type: 'spring', stiffness: 40, damping: 18 },
          y: { type: 'spring', stiffness: 40, damping: 18 },
          scale: { duration: leaving ? 0.9 : 0.6, ease },
        }}
      />

      {/* Top gradient so sky text reads; bottom gradient grounds the CTA */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(20,12,30,0.45) 0%, rgba(20,12,30,0) 32%, rgba(20,12,30,0) 60%, rgba(12,10,20,0.55) 100%)',
        }}
      />

      {/* Fireflies */}
      <Fireflies count={24} />

      {/* Film grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Leave flash */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[#0c0a14]"
        initial={{ opacity: 0 }}
        animate={{ opacity: leaving ? 1 : 0 }}
        transition={{ duration: 0.9, ease }}
      />

      {/* ===== TOP NAV ===== */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: leaving ? 0 : 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.7, ease }}
        className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-4 md:px-9 md:py-6"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.32em] text-[#f4ead5]/85 drop-shadow">
          frogface<span className="text-[#e9c46a]">.</span>space
        </span>
        <div className="flex items-center gap-5 font-mono text-[10px] uppercase tracking-[0.28em] text-[#f4ead5]/70 md:gap-7 md:text-[11px]">
          <a href="/world" className="transition-colors hover:text-[#f4ead5]">карта</a>
          <a href="/studio" className="transition-colors hover:text-[#b6ff3a]">studio</a>
          <a href="/now" className="hidden transition-colors hover:text-[#f4ead5] sm:inline">now</a>
        </div>
      </motion.nav>

      {/* ===== SKY MANIFEST ===== */}
      <div className="absolute inset-x-0 top-[12%] z-20 flex flex-col items-center px-6 text-center md:top-[14%]">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: leaving ? 0 : 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8, ease }}
          className="mb-4 font-mono text-[10px] uppercase tracking-[0.4em] text-[#e9c46a]/90 md:text-[11px]"
        >
          с лицом лягушки · est. 2026
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: leaving ? 0 : 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.9, ease }}
          className="font-display text-[clamp(38px,7vw,92px)] font-medium italic leading-[0.95] tracking-tight text-[#f9f1dd]"
          style={{ textShadow: '0 2px 30px rgba(10,8,20,0.55), 0 1px 3px rgba(10,8,20,0.6)' }}
        >
          Выбираюсь из болота.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: leaving ? 0 : 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8, ease }}
          className="mt-5 max-w-xl text-[13px] leading-relaxed text-[#f4ead5]/85 md:text-[15px]"
          style={{ textShadow: '0 1px 12px rgba(10,8,20,0.6)' }}
        >
          Личное пространство предпринимателя. 15 лет делаю своё — бары, музыку,
          дизайн, AI. Это моя легенда, мои проекты и путь к башне на горизонте.
        </motion.p>
      </div>

      {/* ===== FROG HOVER ZONE (lower-left) → /now ===== */}
      <a
        href="/now"
        aria-label="now — что я делаю сейчас"
        className="group absolute bottom-0 left-0 z-20 h-[42%] w-[34%] md:w-[26%]"
      >
        <span className="absolute bottom-[46%] left-[16%] -translate-x-1/2 rounded-full border border-[#f4ead5]/25 bg-black/60 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.28em] text-[#f4ead5]/90 opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100 md:text-[10px]">
          это я · now
        </span>
      </a>

      {/* ===== TOWER HOVER ZONE (right horizon) → $0/$10K teaser ===== */}
      <div className="group absolute right-[6%] top-[20%] z-20 h-[42%] w-[26%] cursor-help md:w-[20%]">
        <span className="absolute left-1/2 top-2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#e9c46a]/30 bg-black/65 px-3 py-1.5 text-center font-mono text-[9px] uppercase tracking-[0.22em] text-[#e9c46a] opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100 md:text-[10px]">
          башня · $0 / $10K mrr · locked
        </span>
      </div>

      {/* ===== CTA «В ПУТЬ» ===== */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: leaving ? 0 : 1, y: 0 }}
        transition={{ delay: 0.95, duration: 0.8, ease }}
        className="absolute inset-x-0 bottom-[7%] z-30 flex flex-col items-center"
      >
        <button
          onClick={startJourney}
          className="group relative inline-flex items-center gap-3 rounded-full border border-[#e9c46a]/40 bg-[#e9c46a]/10 px-8 py-4 backdrop-blur-sm transition-all duration-300 hover:border-[#e9c46a] hover:bg-[#e9c46a]/20"
        >
          {/* gentle pulse ring */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-full border border-[#e9c46a]/40"
            style={{ animation: 'heroPulse 2.8s ease-out infinite' }}
          />
          <span className="font-mono text-[12px] uppercase tracking-[0.32em] text-[#f9f1dd] md:text-[13px]">
            в путь
          </span>
          <span className="text-[#e9c46a] transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </button>
        <span className="mt-3 font-mono text-[9px] uppercase tracking-[0.3em] text-[#f4ead5]/45">
          прогуляться по болоту
        </span>
      </motion.div>

      <style jsx>{`
        @keyframes heroPulse {
          0% { transform: scale(1); opacity: 0.5; }
          70% { transform: scale(1.45); opacity: 0; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
