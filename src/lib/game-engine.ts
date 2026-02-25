import type { Traits, TraitEffect, GameSession, Choice, Beat } from './types';

export function createInitialTraits(): Traits {
  return {
    loyalty: 5,
    pragmatism: 5,
    empathy: 5,
    violence: 3,
    risk_taking: 5,
    moral_flexibility: 5,
  };
}

export function applyChoice(
  session: GameSession,
  beat: Beat,
  choice: Choice
): GameSession {
  const newTraits = { ...session.traits };

  for (const effect of choice.traitEffects) {
    newTraits[effect.trait] = clamp(newTraits[effect.trait] + effect.delta, 0, 10);
  }

  return {
    ...session,
    traits: newTraits,
    tags: [...new Set([...session.tags, ...choice.tags])],
    choiceHistory: [
      ...session.choiceHistory,
      { beatId: beat.id, choiceId: choice.id, text: choice.text },
    ],
  };
}

export function getDominantTrait(traits: Traits): keyof Traits {
  let maxKey: keyof Traits = 'loyalty';
  let maxVal = -Infinity;

  for (const [key, val] of Object.entries(traits)) {
    if (val > maxVal) {
      maxVal = val;
      maxKey = key as keyof Traits;
    }
  }

  return maxKey;
}

export function getTraitProfile(traits: Traits): string {
  const dominant = getDominantTrait(traits);
  const high = Object.entries(traits)
    .filter(([, v]) => v >= 7)
    .map(([k]) => k);
  const low = Object.entries(traits)
    .filter(([, v]) => v <= 3)
    .map(([k]) => k);

  return JSON.stringify({ dominant, high, low, values: traits });
}

export function determineEndingType(traits: Traits, tags: string[]): string {
  const d = getDominantTrait(traits);

  if (traits.loyalty >= 8 && traits.empathy >= 6) return 'faithful_protector';
  if (traits.pragmatism >= 8 && traits.moral_flexibility >= 7) return 'cold_calculator';
  if (traits.empathy >= 8 && traits.violence <= 2) return 'selfless_saint';
  if (traits.violence >= 8 && traits.moral_flexibility >= 6) return 'chaos_agent';
  if (traits.risk_taking >= 8) return 'lone_wolf';
  if (traits.moral_flexibility >= 8 && traits.empathy <= 3) return 'silent_revenge';
  if (tags.includes('sacrifice') && traits.empathy >= 6) return 'sacrifice';
  if (traits.pragmatism >= 7 && traits.empathy >= 6) return 'compromise';

  const typeMap: Record<string, string> = {
    loyalty: 'faithful_protector',
    pragmatism: 'compromise',
    empathy: 'selfless_saint',
    violence: 'chaos_agent',
    risk_taking: 'lone_wolf',
    moral_flexibility: 'cold_calculator',
  };

  return typeMap[d] || 'compromise';
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function createSession(storyId: string): GameSession {
  return {
    storyId,
    startedAt: new Date().toISOString(),
    traits: createInitialTraits(),
    choiceHistory: [],
    tags: [],
  };
}
