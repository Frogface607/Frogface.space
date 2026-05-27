// World types for frogface.space (Spec v3)
// See: docs/superpowers/specs/2026-05-27-frogface-space-spec-v3.md

export type WealthTier = 'swamp' | 'riverbank' | 'village' | 'city' | 'skyscraper';

/**
 * Click action types:
 *  - "scene:hut-interior"   → switch PixiJS scene
 *  - "route:/now"           → Next.js router.push
 *  - "case:booking"         → open case-overlay modal (Edison Toolkit cases)
 */
export type ClickAction =
  | { type: 'scene'; target: string }
  | { type: 'route'; path: string }
  | { type: 'case'; caseId: string };

export function parseClick(raw: string): ClickAction {
  const idx = raw.indexOf(':');
  if (idx < 0) throw new Error(`Bad click action: ${raw}`);
  const type = raw.slice(0, idx);
  const value = raw.slice(idx + 1);
  if (type === 'scene') return { type: 'scene', target: value };
  if (type === 'route') return { type: 'route', path: value };
  if (type === 'case') return { type: 'case', caseId: value };
  throw new Error(`Unknown click action type: ${type}`);
}

export interface WorldObject {
  /** Stable id for debugging and worldState references */
  id: string;
  /** Optional sprite image (relative to /public). If absent, object is invisible click-zone */
  image?: string;
  /** Position in scene coordinates (1920x1080 base) */
  x: number;
  y: number;
  /** Optional explicit width/height for click-zone (used if no image) */
  w?: number;
  h?: number;
  /** Sprite scale */
  scale?: number;
  /** Click action string (see parseClick) */
  click?: string;
  /** Tooltip text on hover (optional) */
  tooltip?: string;
  /** Visible only at this tier and above */
  unlockedAt?: WealthTier;
}

export interface Scene {
  /** Full-canvas background image */
  background: string;
  /** Optional ambient ID (light, particles, music) — handled by SceneEffects */
  ambient?: 'swamp-night' | 'hut-warm' | 'bar-warm';
  /** Interactive objects */
  objects: WorldObject[];
}

export interface WorldState {
  tier: WealthTier;
  scenes: Record<string, Scene>;
}

export const TIER_ORDER: WealthTier[] = [
  'swamp',
  'riverbank',
  'village',
  'city',
  'skyscraper',
];

export function tierIndex(t: WealthTier): number {
  return TIER_ORDER.indexOf(t);
}

export function isUnlocked(objTier: WealthTier | undefined, current: WealthTier): boolean {
  if (!objTier) return true;
  return tierIndex(current) >= tierIndex(objTier);
}
