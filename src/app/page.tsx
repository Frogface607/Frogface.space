'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { DEMO_STORY } from '@/lib/demo-story';
import { getTimeUntilMidnight } from '@/lib/utils';

export default function HomePage() {
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tick = () => setCountdown(getTimeUntilMidnight());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const story = DEMO_STORY;

  return (
    <div className="min-h-screen bg-bg-deep relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-pink/5 rounded-full blur-[120px]" />
        <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-gold/3 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <span className="text-2xl">🎭</span>
          <span className="text-xl font-bold tracking-tight text-text-bright">
            8<span className="text-gradient-purple">FATES</span>
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4"
        >
          <Link
            href="/world"
            className="text-sm text-text-dim hover:text-text transition-colors"
          >
            📰 Living World
          </Link>
        </motion.div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center px-6 pt-8 pb-20 md:pt-16">
        {/* Daily Timer */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
          <span className="text-xs text-text-dim uppercase tracking-widest">
            Сегодняшняя история
          </span>
          {mounted && (
            <span className="text-xs text-gold font-mono ml-2">
              {String(countdown.hours).padStart(2, '0')}:
              {String(countdown.minutes).padStart(2, '0')}:
              {String(countdown.seconds).padStart(2, '0')}
            </span>
          )}
        </motion.div>

        {/* Story Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="w-full max-w-lg"
        >
          <div className="relative rounded-2xl overflow-hidden glass-strong group cursor-pointer">
            {/* Gradient background */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${story.coverGradient} opacity-40 group-hover:opacity-50 transition-opacity duration-500`}
            />

            {/* Content */}
            <div className="relative z-10 p-8 md:p-10">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {story.themes.map((theme) => (
                  <span
                    key={theme}
                    className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-white/5 text-text-dim"
                  >
                    {theme}
                  </span>
                ))}
                <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-purple/20 text-purple">
                  {story.year}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight text-text-bright mb-3">
                {story.title}
              </h1>

              <p className="text-text-dim text-sm md:text-base leading-relaxed mb-8">
                {story.subtitle}
              </p>

              {/* Stats preview */}
              <div className="flex items-center gap-6 mb-8 text-xs text-text-dim">
                <div className="flex items-center gap-1.5">
                  <span>⏱</span>
                  <span>~10 минут</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>🎯</span>
                  <span>7 выборов</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>🎭</span>
                  <span>8 судеб</span>
                </div>
              </div>

              {/* Play Button */}
              <Link href="/play">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-purple to-pink text-white font-semibold text-base tracking-wide transition-all duration-300 glow-purple hover:shadow-[0_0_40px_rgba(139,92,246,0.3)]"
                >
                  Начать историю
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 w-full max-w-lg"
        >
          <h2 className="text-sm uppercase tracking-widest text-text-dim text-center mb-8">
            Как это работает
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: '🎲',
                title: '7 выборов',
                desc: 'Моральные дилеммы без правильных ответов',
              },
              {
                icon: '🤖',
                title: 'AI концовка',
                desc: 'Уникальная — только для тебя, на основе твоих решений',
              },
              {
                icon: '📊',
                title: 'Сравни',
                desc: 'Узнай, как поступили другие. Поделись своей судьбой',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.15, duration: 0.5 }}
                className="p-5 rounded-xl glass text-center"
              >
                <div className="text-2xl mb-3">{item.icon}</div>
                <div className="text-sm font-semibold text-text-bright mb-1">
                  {item.title}
                </div>
                <div className="text-xs text-text-dim leading-relaxed">
                  {item.desc}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="mt-16 text-xs text-text-dim/50 text-center"
        >
          Новая история каждый день в 00:00 МСК
        </motion.p>
      </main>
    </div>
  );
}
