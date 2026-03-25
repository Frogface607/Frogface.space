'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { getAllStories, getTodayStory } from '@/lib/story-catalog';
import '@/lib/register-stories';

export default function StoriesPage() {
  const stories = getAllStories();
  const todayStory = getTodayStory();

  return (
    <div className="min-h-screen bg-bg-deep relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple/3 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink/3 rounded-full blur-[100px]" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12">
        <Link href="/" className="flex items-center gap-3 text-text-dim hover:text-text transition-colors">
          <span className="text-sm">←</span>
          <span className="text-2xl">🎭</span>
          <span className="text-xl font-bold tracking-tight text-text-bright">
            8<span className="text-gradient-purple">FATES</span>
          </span>
        </Link>
      </header>

      <main className="relative z-10 max-w-lg mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="text-3xl mb-3">📚</div>
          <h1 className="text-2xl font-bold text-text-bright mb-2">
            Архив историй
          </h1>
          <p className="text-sm text-text-dim">
            {stories.length} {stories.length === 1 ? 'история' : stories.length < 5 ? 'истории' : 'историй'} в коллекции
          </p>
        </motion.div>

        <div className="space-y-4">
          {stories.map((story, i) => {
            const isToday = story.id === todayStory.id;
            return (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
              >
                <Link href={`/play?story=${story.id}`}>
                  <div className={`relative rounded-xl overflow-hidden glass-strong group cursor-pointer transition-all duration-300 hover:border-purple/30 ${isToday ? 'border border-purple/40' : 'border border-transparent'}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${story.coverGradient} opacity-30 group-hover:opacity-40 transition-opacity duration-500`} />
                    <div className="relative z-10 p-6">
                      <div className="flex items-center gap-2 mb-3">
                        {isToday && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green/10 text-green border border-green/20">
                            СЕГОДНЯ
                          </span>
                        )}
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple/20 text-purple">
                          {story.year}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-text-bright mb-1">
                        {story.title}
                      </h3>
                      <p className="text-xs text-text-dim mb-3">{story.subtitle}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {story.themes.map((theme) => (
                          <span
                            key={theme}
                            className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-text-dim"
                          >
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
