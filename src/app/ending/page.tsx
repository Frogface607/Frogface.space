'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { DEMO_STORY } from '@/lib/demo-story';
import type { GameSession } from '@/lib/types';
import { TRAIT_LABELS, TRAIT_ICONS } from '@/lib/types';
import { getRarityLabel, getRarityBorder, cn } from '@/lib/utils';

const MOCK_STATS = [
  { type: 'faithful_protector', title: 'Верность превыше всего', percent: 38.2, rarity: 'common' },
  { type: 'compromise', title: 'Компромисс ради всех', percent: 24.5, rarity: 'common' },
  { type: 'selfless_saint', title: 'Правда любой ценой', percent: 16.1, rarity: 'uncommon' },
  { type: 'lone_wolf', title: 'Путь одиночки', percent: 9.8, rarity: 'rare' },
  { type: 'cold_calculator', title: 'Холодный расчёт', percent: 5.4, rarity: 'rare' },
  { type: 'silent_revenge', title: 'Тихая месть', percent: 3.2, rarity: 'epic' },
  { type: 'sacrifice', title: 'Самопожертвование', percent: 2.1, rarity: 'epic' },
  { type: 'chaos_agent', title: 'Хаос и анархия', percent: 0.7, rarity: 'legendary' },
];

const RARITY_EMOJIS: Record<string, string> = {
  common: '⬜',
  uncommon: '🟩',
  rare: '🟦',
  epic: '🟪',
  legendary: '🟨',
};

export default function EndingPage() {
  const [session, setSession] = useState<GameSession | null>(null);
  const [revealStep, setRevealStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = localStorage.getItem(`8fates_session_${DEMO_STORY.id}`);
    if (data) {
      setSession(JSON.parse(data));
    }
  }, []);

  useEffect(() => {
    if (!session?.ending) return;
    const timers = [
      setTimeout(() => setRevealStep(1), 500),
      setTimeout(() => setRevealStep(2), 1500),
      setTimeout(() => setRevealStep(3), 2500),
      setTimeout(() => setRevealStep(4), 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [session]);

  const handleShare = async () => {
    if (!session?.ending) return;

    const shareText = [
      `🎭 8FATES — "${DEMO_STORY.title}"`,
      '',
      `Моя концовка: ${session.ending.title}`,
      `${RARITY_EMOJIS[session.ending.rarity] || '⬜'} Редкость: ${getRarityLabel(session.ending.rarity)} (${session.ending.rarityPercent.toFixed(1)}%)`,
      '',
      `А ты на что способен?`,
      `👉 8fates.app`,
    ].join('\n');

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
        return;
      } catch {}
    }

    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!session?.ending) {
    return (
      <div className="min-h-screen bg-bg-deep flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-dim mb-4">Нет данных об игре</p>
          <Link href="/" className="text-purple hover:underline text-sm">
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  const { ending } = session;
  const myStatIdx = MOCK_STATS.findIndex((s) => s.type === ending.type);

  return (
    <div className="min-h-screen bg-bg-deep relative overflow-hidden">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[0%] w-[50%] h-[50%] bg-gold/5 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 max-w-lg mx-auto px-6 py-12">
        {/* Reveal: Title */}
        {revealStep >= 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center mb-10"
          >
            <div className="text-4xl mb-4">🎭</div>
            <p className="text-xs uppercase tracking-widest text-text-dim mb-3">
              Твоя судьба
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-text-bright mb-2">
              {ending.title}
            </h1>
            <span
              className={cn(
                'inline-block text-xs px-3 py-1 rounded-full border',
                getRarityBorder(ending.rarity)
              )}
            >
              {RARITY_EMOJIS[ending.rarity]} {getRarityLabel(ending.rarity)} —{' '}
              {ending.rarityPercent.toFixed(1)}% игроков
            </span>
          </motion.div>
        )}

        {/* Reveal: Description */}
        {revealStep >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <div
              ref={shareCardRef}
              className="p-6 rounded-2xl glass-strong border border-border"
            >
              <p className="text-sm md:text-base leading-relaxed text-text/90 mb-4">
                {ending.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-text-dim">
                <span>🧠</span>
                <span>Психотип: {ending.psychotype}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Reveal: Traits */}
        {revealStep >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <h3 className="text-xs uppercase tracking-widest text-text-dim mb-4">
              Твой профиль
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {(
                Object.entries(session.traits) as [
                  keyof typeof session.traits,
                  number,
                ][]
              ).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-sm">{TRAIT_ICONS[key]}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-dim">{TRAIT_LABELS[key]}</span>
                      <span className="text-text font-mono">{value}/10</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value * 10}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className={cn(
                          'h-full rounded-full',
                          value >= 7
                            ? 'bg-gradient-to-r from-purple to-pink'
                            : value >= 4
                            ? 'bg-purple/60'
                            : 'bg-white/20'
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Reveal: Global stats */}
        {revealStep >= 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <h3 className="text-xs uppercase tracking-widest text-text-dim mb-4">
              📊 Как сыграли сегодня
            </h3>
            <div className="space-y-2">
              {MOCK_STATS.map((stat, i) => {
                const isMe = stat.type === ending.type;
                return (
                  <motion.div
                    key={stat.type}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl transition-colors',
                      isMe
                        ? 'glass-strong border border-purple/30'
                        : 'bg-white/2'
                    )}
                  >
                    <span className="text-xs font-mono text-text-dim w-5">
                      {i + 1}.
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={cn(
                            'text-xs font-medium',
                            isMe ? 'text-text-bright' : 'text-text-dim'
                          )}
                        >
                          {stat.title}
                          {isMe && (
                            <span className="ml-2 text-purple text-[10px]">
                              ← ТЫ
                            </span>
                          )}
                        </span>
                        <span className="text-xs font-mono text-text-dim">
                          {stat.percent}%
                        </span>
                      </div>
                      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.percent}%` }}
                          transition={{ duration: 0.6, delay: i * 0.08 }}
                          className={cn(
                            'h-full rounded-full',
                            isMe
                              ? 'bg-gradient-to-r from-purple to-pink'
                              : 'bg-white/15'
                          )}
                        />
                      </div>
                    </div>
                    <span className="text-xs">
                      {RARITY_EMOJIS[stat.rarity]}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        {revealStep >= 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="space-y-3"
          >
            <button
              onClick={handleShare}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple to-pink text-white font-semibold text-sm tracking-wide transition-all duration-300 glow-purple hover:shadow-[0_0_40px_rgba(139,92,246,0.3)]"
            >
              {copied ? '✅ Скопировано!' : '📤 Поделиться результатом'}
            </button>

            <Link href="/world" className="block">
              <button className="w-full py-3 rounded-xl glass border border-border text-text-dim hover:text-text text-sm transition-colors">
                📰 Читать Living World
              </button>
            </Link>

            <Link href="/" className="block">
              <button className="w-full py-3 rounded-xl text-text-dim hover:text-text text-sm transition-colors">
                ← На главную
              </button>
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}
