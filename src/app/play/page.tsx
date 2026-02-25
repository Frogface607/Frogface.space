'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { DEMO_STORY } from '@/lib/demo-story';
import {
  createSession,
  applyChoice,
  determineEndingType,
  getTraitProfile,
} from '@/lib/game-engine';
import type { GameSession, Choice, Beat } from '@/lib/types';
import { TRAIT_LABELS, TRAIT_ICONS } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function PlayPage() {
  const router = useRouter();
  const story = DEMO_STORY;

  const [session, setSession] = useState<GameSession>(() =>
    createSession(story.id)
  );
  const [currentBeat, setCurrentBeat] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showConsequence, setShowConsequence] = useState(false);
  const [customText, setCustomText] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [traitFlash, setTraitFlash] = useState<string[]>([]);

  const beat = story.beats[currentBeat];
  const progress = ((currentBeat + 1) / story.beats.length) * 100;

  const handleChoice = useCallback(
    async (choice: Choice) => {
      if (selectedChoice) return;
      setSelectedChoice(choice.id);
      setValidationError(null);

      const changedTraits = choice.traitEffects.map((e) => e.trait);
      setTraitFlash(changedTraits);

      const newSession = applyChoice(session, beat, choice);
      setSession(newSession);

      setShowConsequence(true);

      setTimeout(() => {
        setTraitFlash([]);
        setShowConsequence(false);
        setSelectedChoice(null);
        setShowCustomInput(false);
        setCustomText('');

        if (currentBeat < story.beats.length - 1) {
          setCurrentBeat((b) => b + 1);
        } else {
          finishGame(newSession);
        }
      }, 1800);
    },
    [session, beat, currentBeat, selectedChoice, story.beats.length]
  );

  const handleCustomAction = useCallback(async () => {
    if (!customText.trim() || validating) return;
    setValidating(true);
    setValidationError(null);

    try {
      const res = await fetch('/api/validate-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: customText.trim(),
          beat: {
            id: beat.id,
            title: beat.title,
            narration: beat.narration,
          },
          story: {
            title: story.title,
            setting: story.setting,
            year: story.year,
          },
          currentTraits: session.traits,
        }),
      });

      const data = await res.json();

      if (data.valid) {
        const customChoice: Choice = {
          id: `custom_${beat.id}`,
          text: customText.trim(),
          traitEffects: data.traitEffects || [],
          tags: data.tags || ['custom_action'],
        };
        handleChoice(customChoice);
      } else {
        setValidationError(
          data.reason || 'Это действие невозможно в данной ситуации'
        );
      }
    } catch {
      setValidationError('Ошибка проверки. Попробуй один из готовых вариантов.');
    } finally {
      setValidating(false);
    }
  }, [customText, validating, beat, story, session.traits, handleChoice]);

  const finishGame = async (finalSession: GameSession) => {
    setGenerating(true);

    const endingType = determineEndingType(finalSession.traits, finalSession.tags);
    const profile = getTraitProfile(finalSession.traits);

    try {
      const res = await fetch('/api/generate-ending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyTitle: story.title,
          setting: story.setting,
          endingType,
          traitProfile: profile,
          choiceHistory: finalSession.choiceHistory,
          tags: finalSession.tags,
        }),
      });

      const ending = await res.json();

      const completedSession: GameSession = {
        ...finalSession,
        ending,
        completedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        `8fates_session_${story.id}`,
        JSON.stringify(completedSession)
      );
      router.push('/ending');
    } catch {
      const fallbackSession: GameSession = {
        ...finalSession,
        ending: {
          type: endingType,
          title: story.endingTypes.find((e) => e.id === endingType)?.title || 'Твоя судьба',
          description:
            'Твои решения определили уникальный путь. Каждый выбор отразился на финале этой истории.',
          psychotype: 'Определяющий свою судьбу',
          dominantTrait: finalSession.traits.loyalty >= finalSession.traits.pragmatism ? 'loyalty' : 'pragmatism',
          rarity: story.endingTypes.find((e) => e.id === endingType)?.rarity || 'common',
          rarityPercent: Math.random() * 30 + 5,
        },
        completedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        `8fates_session_${story.id}`,
        JSON.stringify(fallbackSession)
      );
      router.push('/ending');
    }
  };

  if (generating) {
    return (
      <div className="min-h-screen bg-bg-deep flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center px-8"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-5xl mb-6 inline-block"
          >
            🎭
          </motion.div>
          <h2 className="text-xl font-bold text-text-bright mb-2">
            Судьба решается...
          </h2>
          <p className="text-sm text-text-dim">
            AI анализирует твои решения и создаёт уникальную концовку
          </p>
          <div className="mt-6 h-1 w-48 mx-auto rounded-full overflow-hidden bg-white/5">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 4, ease: 'easeInOut' }}
              className="h-full bg-gradient-to-r from-purple to-pink rounded-full"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-deep relative">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple/3 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink/3 rounded-full blur-[100px]" />
      </div>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-purple to-pink"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-dim">
            {currentBeat + 1}/{story.beats.length}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-text-dim capitalize">
            {beat.type === 'opening'
              ? 'Завязка'
              : beat.type === 'development'
              ? 'Развитие'
              : beat.type === 'climax'
              ? 'Кульминация'
              : 'Развязка'}
          </span>
        </div>

        {/* Mini trait bar */}
        <div className="flex items-center gap-1.5">
          {(Object.keys(session.traits) as Array<keyof typeof session.traits>).map(
            (key) => (
              <motion.div
                key={key}
                animate={
                  traitFlash.includes(key)
                    ? { scale: [1, 1.4, 1], opacity: [0.5, 1, 0.7] }
                    : {}
                }
                transition={{ duration: 0.4 }}
                title={`${TRAIT_LABELS[key]}: ${session.traits[key]}`}
                className="text-xs cursor-default"
              >
                {TRAIT_ICONS[key]}
              </motion.div>
            )
          )}
        </div>
      </div>

      {/* Beat content */}
      <main className="relative z-10 max-w-lg mx-auto px-6 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={beat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {/* Beat title */}
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg font-bold text-text-bright mb-6"
            >
              {beat.title}
            </motion.h2>

            {/* Narration */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-10"
            >
              <p className="text-sm md:text-base leading-relaxed text-text/90">
                {beat.narration}
              </p>
            </motion.div>

            {/* Choices */}
            <div className="space-y-3">
              {beat.choices.map((choice, idx) => (
                <motion.button
                  key={choice.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                  onClick={() => handleChoice(choice)}
                  disabled={!!selectedChoice}
                  className={cn(
                    'w-full text-left p-4 rounded-xl transition-all duration-300',
                    'border',
                    selectedChoice === choice.id
                      ? 'border-purple bg-purple/10 glass-strong'
                      : selectedChoice
                      ? 'border-transparent bg-white/2 opacity-40'
                      : 'border-border bg-white/3 hover:border-purple/50 hover:bg-white/5'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                        selectedChoice === choice.id
                          ? 'bg-purple text-white'
                          : 'bg-white/5 text-text-dim'
                      )}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-sm text-text leading-relaxed">
                      {choice.text}
                    </span>
                  </div>

                  {/* Trait effects preview on selection */}
                  <AnimatePresence>
                    {selectedChoice === choice.id && showConsequence && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0 }}
                        className="mt-3 ml-9 flex flex-wrap gap-2"
                      >
                        {choice.traitEffects.map((effect) => (
                          <span
                            key={effect.trait}
                            className={cn(
                              'text-xs px-2 py-0.5 rounded-full',
                              effect.delta > 0
                                ? 'bg-green/10 text-green'
                                : 'bg-red/10 text-red'
                            )}
                          >
                            {TRAIT_ICONS[effect.trait]}{' '}
                            {effect.delta > 0 ? '+' : ''}
                            {effect.delta} {TRAIT_LABELS[effect.trait]}
                          </span>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}

              {/* Custom action */}
              {beat.allowCustom && !selectedChoice && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  {!showCustomInput ? (
                    <button
                      onClick={() => setShowCustomInput(true)}
                      className="w-full text-left p-4 rounded-xl border border-dashed border-border/50 hover:border-gold/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs bg-gold/10 text-gold">
                          ✦
                        </span>
                        <span className="text-sm text-text-dim">
                          Свой вариант...
                        </span>
                      </div>
                    </button>
                  ) : (
                    <div className="p-4 rounded-xl border border-gold/20 bg-gold/5">
                      <textarea
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder="Опиши своё действие..."
                        maxLength={200}
                        rows={2}
                        className="w-full bg-transparent text-sm text-text placeholder:text-text-dim/40 focus:outline-none resize-none"
                      />
                      {validationError && (
                        <p className="text-xs text-red mt-2">
                          ⚠️ {validationError}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[10px] text-text-dim">
                          {customText.length}/200
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setShowCustomInput(false);
                              setCustomText('');
                              setValidationError(null);
                            }}
                            className="text-xs text-text-dim hover:text-text px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Отмена
                          </button>
                          <button
                            onClick={handleCustomAction}
                            disabled={!customText.trim() || validating}
                            className="text-xs text-gold bg-gold/10 hover:bg-gold/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
                          >
                            {validating ? 'Проверяю...' : 'Отправить'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
