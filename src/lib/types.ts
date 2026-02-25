export interface Traits {
  loyalty: number;
  pragmatism: number;
  empathy: number;
  violence: number;
  risk_taking: number;
  moral_flexibility: number;
}

export const TRAIT_LABELS: Record<keyof Traits, string> = {
  loyalty: 'Верность',
  pragmatism: 'Прагматизм',
  empathy: 'Эмпатия',
  violence: 'Агрессия',
  risk_taking: 'Рисковость',
  moral_flexibility: 'Моральная гибкость',
};

export const TRAIT_ICONS: Record<keyof Traits, string> = {
  loyalty: '🛡️',
  pragmatism: '⚖️',
  empathy: '💜',
  violence: '🔥',
  risk_taking: '🎲',
  moral_flexibility: '🌀',
};

export interface TraitEffect {
  trait: keyof Traits;
  delta: number;
}

export interface Choice {
  id: string;
  text: string;
  traitEffects: TraitEffect[];
  tags: string[];
  consequence?: string;
}

export interface Beat {
  id: number;
  type: 'opening' | 'development' | 'climax' | 'resolution';
  title: string;
  narration: string;
  imageHint?: string;
  choices: Choice[];
  allowCustom: boolean;
}

export interface Story {
  id: string;
  title: string;
  subtitle: string;
  setting: string;
  year: string;
  themes: string[];
  coverGradient: string;
  beats: Beat[];
  endingTypes: EndingType[];
}

export interface EndingType {
  id: string;
  title: string;
  dominantTrait: keyof Traits;
  minValue: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface GeneratedEnding {
  type: string;
  title: string;
  description: string;
  psychotype: string;
  dominantTrait: keyof Traits;
  rarity: string;
  rarityPercent: number;
}

export interface GameSession {
  storyId: string;
  startedAt: string;
  traits: Traits;
  choiceHistory: { beatId: number; choiceId: string; text: string }[];
  tags: string[];
  ending?: GeneratedEnding;
  completedAt?: string;
}

export interface DailyStats {
  storyId: string;
  date: string;
  totalPlayers: number;
  endingDistribution: {
    type: string;
    title: string;
    count: number;
    percent: number;
    rarity: string;
  }[];
}

export interface Newspaper {
  storyId: string;
  day: number;
  date: string;
  headline: string;
  content: string;
}
