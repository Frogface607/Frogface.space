'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion';

/**
 * Pinned finale: the swamp -> Tower frame holds full-screen while the
 * manifest and CTA rise over it. The climax of the scroll-comic.
 */
export default function TowerClimax() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.06, 1.2]);
  const overlay = useTransform(scrollYProgress, [0, 0.4, 1], [0.25, 0.55, 0.72]);
  const contentOpacity = useTransform(scrollYProgress, [0.12, 0.4], [0, 1]);
  const contentY = useTransform(
    scrollYProgress,
    [0.12, 0.45],
    reduce ? [0, 0] : [48, 0],
  );

  return (
    <section ref={ref} className="relative h-[230vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Artwork */}
        <motion.div style={{ scale }} className="absolute inset-0">
          <Image
            src="/about/p10-swamp-to-tower-v2.webp"
            alt="Болото и башня на горизонте"
            fill
            sizes="100vw"
            className="object-cover"
            priority={false}
          />
        </motion.div>

        {/* Legibility scrim */}
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{
            opacity: overlay,
            background:
              'linear-gradient(180deg, rgba(20,26,18,0.1) 0%, rgba(20,26,18,0.35) 55%, rgba(12,16,12,0.92) 100%)',
          }}
        />

        {/* Manifest + CTA */}
        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="absolute inset-x-0 bottom-0 px-6 pb-16 md:pb-24"
        >
          <div className="max-w-4xl mx-auto">
            <div className="font-mono text-[11px] uppercase tracking-[0.35em] text-canon-tan mb-4">
              / цель на горизонте — $10K MRR
            </div>
            <h2 className="font-display font-bold text-canon-paper leading-[0.95] tracking-tight text-[clamp(40px,7vw,92px)]">
              Дойти до башни.
            </h2>
            <p className="mt-6 font-body text-lg md:text-xl leading-relaxed text-canon-paper/85 max-w-2xl">
              Это всё ещё пишется. Каждый новый проект — новое здание на карте, ещё
              один шаг к башне на горизонте. Но башня строится не из тревоги: я учусь
              жить уже сейчас — ходить, думать, делать своё и параллельно собирать
              систему.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/studio"
                className="group inline-flex items-center gap-2 font-mono text-sm uppercase tracking-[0.2em] bg-canon-paper text-canon-ink px-7 py-3.5 rounded-sm transition-colors hover:bg-canon-tan"
              >
                работать вместе
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <a
                href="https://t.me/sergeyorlove"
                className="font-mono text-sm uppercase tracking-[0.18em] text-canon-paper/80 border-b border-canon-paper/40 hover:text-canon-paper hover:border-canon-paper py-1 transition-colors"
              >
                канал «С лицом лягушки»
              </a>
              <Link
                href="/"
                className="font-mono text-sm uppercase tracking-[0.18em] text-canon-paper/60 hover:text-canon-paper py-1 transition-colors"
              >
                ← в болото
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
