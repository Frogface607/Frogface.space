export type FrogfaceOutfitId =
  | 'default'
  | 'studio'
  | 'presentation'
  | 'field'
  | 'bar';

export type FrogfaceSituationId =
  | 'biography'
  | 'studio-hero'
  | 'world-sprite'
  | 'project-card'
  | 'social-post';

export interface FrogfaceOutfit {
  id: FrogfaceOutfitId;
  name: string;
  clothing: string;
  useWhen: string;
}

export interface FrogfaceSituation {
  id: FrogfaceSituationId;
  name: string;
  framing: string;
  intent: string;
}

export const FROGFACE_CANON = {
  identity:
    'Frogface, a stylized anthropomorphic frog founder character: calm, observant, slightly tired, capable, creative, always thinking ahead.',
  anatomy:
    'Olive green frog skin with darker round spots, tan throat and belly, large amber-brown eyes with heavy eyelids, compact body, readable silhouette, expressive hands.',
  defaultClothes:
    'Black oversized hoodie with an open low neckline that reveals the tan throat, small frogface chest logo, gray jeans, white sneakers.',
  jewelry:
    'A silver chain forms a complete visible loop around the neck, with both chain sides coming from behind the neck and resting over the throat/chest area; the peace pendant hangs freely below the throat. The chain is separate jewelry, not attached to the hoodie, collar, jacket, blazer, chest logo, or fabric.',
  palette:
    'Olive green, swamp sage, warm tan, charcoal black, gray denim, off-white sneakers, small silver jewelry accents.',
  style:
    'Premium cartoon concept art with clean inked edges, painterly texture, grounded lighting, no generic mascot look.',
  invariants: [
    'Keep Frogface identity consistent across all images.',
    'The full necklace loop must be visible around the neck; do not draw the pendant or chain emerging from a hoodie, hood opening, jacket collar, blazer, chest, logo, pocket, or fabric seam.',
    'For hoodie outfits, keep the hoodie neckline open and low enough to show the tan throat and the necklace loop sitting on top of the character, not disappearing into the hood.',
    'Use gray jeans unless the selected outfit explicitly changes pants.',
    'Use white sneakers unless the selected outfit explicitly changes shoes.',
    'Only the default, studio, field, and bar outfits may include a hoodie. Presentation mode must not include a hoodie or hood.',
    'Do not make the character cute, childish, glossy, plastic, or hyper-muscular.',
    'No random text, watermark, extra logos, duplicated limbs, or distorted hands.',
  ],
} as const;

export const FROGFACE_OUTFITS: FrogfaceOutfit[] = [
  {
    id: 'default',
    name: 'Default Founder',
    clothing: FROGFACE_CANON.defaultClothes,
    useWhen: 'main world, biography, neutral portraits, default sprites',
  },
  {
    id: 'studio',
    name: 'Studio Operator',
    clothing:
      'Black hoodie under a dark work jacket, open low neckline showing the tan throat, gray jeans, white sneakers, optional phone or notebook.',
    useWhen: 'studio page, client work, dashboards, briefings',
  },
  {
    id: 'presentation',
    name: 'Presentation Mode',
    clothing:
      'Charcoal blazer over a plain black crew-neck shirt with the neck clearly visible, no hoodie, no hood, gray jeans, white sneakers.',
    useWhen: 'portfolio decks, serious project cards, public founder materials',
  },
  {
    id: 'field',
    name: 'Field Build',
    clothing:
      'Black hoodie with an open low neckline showing the tan throat, dark utility vest, gray jeans, white sneakers, subtle tool pouch.',
    useWhen: 'building products, debugging, behind-the-scenes materials',
  },
  {
    id: 'bar',
    name: 'Edison Night',
    clothing:
      'Black hoodie with an open low neckline showing the tan throat, dark bar apron, gray jeans, white sneakers.',
    useWhen: 'Edison Bar scenes, hospitality systems, music/bar story',
  },
];

export const FROGFACE_SITUATIONS: FrogfaceSituation[] = [
  {
    id: 'biography',
    name: 'Biography',
    framing: 'editorial portrait, half body or seated desk pose, quiet negative space',
    intent: 'tell Sergey/Frogface story without looking like a corporate headshot',
  },
  {
    id: 'studio-hero',
    name: 'Studio Hero',
    framing: 'wide website hero composition, character on one side, workspace atmosphere around him',
    intent: 'sell Frogface Studio as a capable one-person product workshop',
  },
  {
    id: 'world-sprite',
    name: 'World Sprite',
    framing: 'side-view game sprite, full body, clean silhouette, flat removable background',
    intent: 'produce frames or references for playable movement',
  },
  {
    id: 'project-card',
    name: 'Project Card',
    framing: 'single focused pose with one prop linked to the project',
    intent: 'create consistent portfolio/project thumbnails',
  },
  {
    id: 'social-post',
    name: 'Social Post',
    framing: 'square composition with strong readable pose and room for caption outside the artwork',
    intent: 'make repeatable social visuals without breaking character identity',
  },
];

export function getFrogfaceOutfit(id: FrogfaceOutfitId) {
  return FROGFACE_OUTFITS.find((item) => item.id === id) ?? FROGFACE_OUTFITS[0];
}

export function getFrogfaceSituation(id: FrogfaceSituationId) {
  return FROGFACE_SITUATIONS.find((item) => item.id === id) ?? FROGFACE_SITUATIONS[0];
}

export function buildFrogfaceImagePrompt({
  outfitId,
  situationId,
  extra = '',
}: {
  outfitId: FrogfaceOutfitId;
  situationId: FrogfaceSituationId;
  extra?: string;
}) {
  const outfit = getFrogfaceOutfit(outfitId);
  const situation = getFrogfaceSituation(situationId);

  return [
    `Use case: stylized-concept`,
    `Asset type: Frogface ${situation.name}`,
    `Primary request: create a consistent Frogface image for ${situation.intent}.`,
    `Character canon: ${FROGFACE_CANON.identity}`,
    `Anatomy: ${FROGFACE_CANON.anatomy}`,
    `Clothing: ${outfit.clothing}`,
    `Jewelry placement: ${FROGFACE_CANON.jewelry}`,
    `Style: ${FROGFACE_CANON.style}`,
    `Composition/framing: ${situation.framing}`,
    `Color palette: ${FROGFACE_CANON.palette}`,
    extra ? `Scene note: ${extra}` : '',
    `Constraints: ${FROGFACE_CANON.invariants.join(' ')}`,
  ].filter(Boolean).join('\n');
}

export function buildFrogfaceBiographySeed() {
  return [
    'Frogface is Sergey Orlov in myth form: a tired but capable founder climbing out of the swamp with almost no money, too many projects, and enough taste to keep going.',
    'He is not a mascot. He is a working operator: Edison Bar history, product building, AI systems, music, and a personal command center becoming a playable world.',
    'Tone: direct, self-aware, slightly noir, practical, warm underneath, never corporate.',
  ].join('\n\n');
}
