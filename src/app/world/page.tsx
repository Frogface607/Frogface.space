'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import type { Newspaper } from '@/lib/types';

const FALLBACK_PAPERS: Newspaper[] = [
  {
    storyId: 'the-last-call',
    day: 1,
    date: new Date().toISOString(),
    headline: 'Школу №47 ждут перемены',
    content:
      'Алина Соколова больше не появляется в школе. Одноклассники говорят, что она уехала к тёте в Москву. Но Максим клянётся, что видел её вчера у старого крыла — она разговаривала с незнакомым мужчиной в костюме.\n\nДенис Волков опубликовал пост ВКонтакте: "Иногда правда дороже дружбы. Иногда — нет." 83 комментария. Школа разделилась на два лагеря.\n\nА директор Беляев неожиданно взял больничный. Второй день подряд. Секретарша Нина Павловна говорит — "сердце". Но кто-то видел его машину у здания прокуратуры.',
  },
  {
    storyId: 'the-last-call',
    day: 2,
    date: new Date(Date.now() - 86400000).toISOString(),
    headline: 'В школьном чате война',
    content:
      'Анонимный аккаунт "Правда_47" выложил скан каких-то документов. Половина считает это фейком, половина — бомбой. Классная Мария Ивановна попросила всех "не распространять слухи и готовиться к экзаменам".\n\nАлина вернулась. Но что-то изменилось — она больше не разговаривает с Денисом. Совсем. А ведь они были неразлучны с девятого класса.\n\nСтранная деталь: в старом крыле заменили замок. Никто не помнит, чтобы его меняли последние лет пять. Зачем сейчас?',
  },
  {
    storyId: 'the-last-call',
    day: 3,
    date: new Date(Date.now() - 172800000).toISOString(),
    headline: 'Неожиданный визит в школу №47',
    content:
      'Утром к школе подъехала чёрная Волга с московскими номерами. Два человека в костюмах прошли прямо к кабинету директора. Беляев вернулся из "больничного" как по волшебству.\n\nДенис написал в личку классу: "Завтра всё узнаете. Просто будьте в школе." Никаких объяснений.\n\nАлина сменила аватарку ВКонтакте на чёрный квадрат. 47 человек поставили лайк. Совпадение? Школа №47. 47 лайков.',
  },
];

export default function WorldPage() {
  const [papers, setPapers] = useState<Newspaper[]>(FALLBACK_PAPERS);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  return (
    <div className="min-h-screen bg-bg-deep relative">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/3 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple/3 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12">
        <Link
          href="/"
          className="flex items-center gap-3 text-text-dim hover:text-text transition-colors"
        >
          <span className="text-sm">←</span>
          <span className="text-2xl">🎭</span>
          <span className="text-xl font-bold tracking-tight text-text-bright">
            8<span className="text-gradient-purple">FATES</span>
          </span>
        </Link>
      </header>

      <main className="relative z-10 max-w-lg mx-auto px-6 py-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="text-3xl mb-3">📰</div>
          <h1 className="text-2xl font-bold text-text-bright mb-2">
            Living World
          </h1>
          <p className="text-sm text-text-dim">
            Мир живёт, даже когда ты не играешь
          </p>
        </motion.div>

        {/* Story selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="p-4 rounded-xl glass-strong border border-border">
            <div className="flex items-center gap-3">
              <span className="text-lg">🏫</span>
              <div>
                <p className="text-sm font-semibold text-text-bright">
                  Последний звонок
                </p>
                <p className="text-xs text-text-dim">
                  Школа №47 • День {papers.length} после событий
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Newspaper entries */}
        <div className="space-y-4">
          {papers.map((paper, i) => (
            <motion.div
              key={paper.day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <button
                onClick={() =>
                  setExpandedDay(expandedDay === paper.day ? null : paper.day)
                }
                className="w-full text-left"
              >
                <div
                  className={`p-4 rounded-xl transition-all duration-300 ${
                    expandedDay === paper.day
                      ? 'glass-strong border border-gold/20'
                      : 'glass border border-transparent hover:border-border'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gold">
                        День {paper.day}
                      </span>
                      {paper.day === 1 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green/10 text-green">
                          НОВОЕ
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-text-dim">
                      {expandedDay === paper.day ? '▲' : '▼'}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-text-bright">
                    {paper.headline}
                  </h3>

                  <AnimatePresence>
                    {expandedDay === paper.day && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-border/30">
                          {paper.content.split('\n\n').map((paragraph, pi) => (
                            <p
                              key={pi}
                              className="text-sm text-text/80 leading-relaxed mb-3 last:mb-0"
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-10 text-xs text-text-dim/50 text-center"
        >
          Новая заметка каждый день в 00:00 МСК
        </motion.p>
      </main>
    </div>
  );
}
