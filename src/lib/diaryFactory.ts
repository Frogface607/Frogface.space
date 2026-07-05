export type DiaryVariant = {
  id: string;
  label: string;
  fileName: string;
  src: string;
  prompt: string;
};

export type DiaryTextVariant = {
  id: string;
  label: string;
  heading: string;
  text: string;
};

export type DiarySlide = {
  id: string;
  index: number;
  title: string;
  text: string;
  textVariants: DiaryTextVariant[];
  variants: DiaryVariant[];
};

export type DiaryEntry = {
  slug: string;
  title: string;
  description: string;
  variantDir: string;
  finalDir: string;
  caption: string;
  slides: DiarySlide[];
};

export type DiaryDraftSlide = {
  heading: string;
  text: string;
  variantId?: string;
  approved: boolean;
};

export type DiaryDraftSlides = Record<string, DiaryDraftSlide>;

export type DiaryVisualDirection = {
  id: string;
  label: string;
  description: string;
};

export type DiaryVisualContract = {
  format: string;
  outputSize: string;
  outputDir: string;
  referenceDir: string;
  references: Array<{
    label: string;
    fileName: string;
    path: string;
    use: string;
  }>;
  palette: string[];
  requiredRules: string[];
  forbiddenRules: string[];
  characterLock: string;
  textRule: string;
};

export type DiaryTextAuditItem = {
  slideId: string;
  index: number;
  heading: string;
  approved: boolean;
  lineCount: number;
  maxLineLength: number;
  totalChars: number;
  ok: boolean;
  warnings: string[];
};

export type DiaryTextFitSuggestion = {
  slideId: string;
  index: number;
  heading: string;
  currentText: string;
  suggestedText: string;
  changed: boolean;
};

export type CarouselFactoryPreset = {
  id: string;
  label: string;
  title: string;
  purpose: string;
  input: string;
  output: string;
  status: 'active' | 'ready' | 'planned';
};

export type CarouselFactoryQueueItem = {
  id: string;
  label: string;
  title: string;
  status: 'waiting-for-source' | 'drafting' | 'ready-for-approval';
  generationLocked: boolean;
  sourceNeeds: string[];
};

export type CarouselFactoryConfig = {
  title: string;
  navLabel: string;
  description: string;
  apiNamespace: string;
  activePresetId: string;
  activeEntrySlug: string;
  voiceRules: string[];
  presets: CarouselFactoryPreset[];
  nextQueue: CarouselFactoryQueueItem[];
  flow: string[];
};

export const diaryTextLimits = {
  maxLineLength: 34,
  maxLineCount: 8,
  maxTotalChars: 190,
  maxHeadingLength: 28,
};

const entrySlug = '2026-07-04';
const frogfaceReferenceBase = '/world/frogface/character/present-day-etalon-2026-07-02';

export const diaryVisualContract = {
  format: 'portrait 3:4 Instagram carousel slide',
  outputSize: '1080x1440 or any exact 3:4 portrait equivalent',
  outputDir: `public/diary/${entrySlug}/variants`,
  referenceDir: `public${frogfaceReferenceBase}`,
  references: [
    {
      label: 'primary 3/4 with coffee',
      fileName: 'frogface-present-day-coffee-3q.png',
      path: `${frogfaceReferenceBase}/frogface-present-day-coffee-3q.png`,
      use: 'primary character reference when Frogface appears',
    },
    {
      label: 'front pose',
      fileName: 'frogface-present-day-front.png',
      path: `${frogfaceReferenceBase}/frogface-present-day-front.png`,
      use: 'front-facing expression and outfit reference',
    },
    {
      label: 'side pose',
      fileName: 'frogface-present-day-side.png',
      path: `${frogfaceReferenceBase}/frogface-present-day-side.png`,
      use: 'side profile reference',
    },
    {
      label: 'walking pose',
      fileName: 'frogface-present-day-walk-3q.png',
      path: `${frogfaceReferenceBase}/frogface-present-day-walk-3q.png`,
      use: 'movement / walking pose reference',
    },
  ],
  palette: [
    'off-white sketchbook paper',
    'black ink',
    'olive/sage greens',
    'warm tan',
    'strong red accents',
    'tiny lime secondary accents',
    'graphite grey',
  ],
  requiredRules: [
    'Use red accents instead of orange.',
    'Keep Cyrillic text large, exact, and readable on a phone.',
    'Keep safe margins for Instagram carousel cropping.',
    'Use present-day Frogface etalon when the character appears.',
    'Keep the page feeling like a handmade diary/sketchbook.',
  ],
  forbiddenRules: [
    'No orange accents.',
    'No tower, skyscraper, or skyline goal imagery.',
    'No tape/plaster strips as a repeating motif.',
    'No extra Frogface arms or hands.',
    'No logos, watermarks, hoodie text, or random readable words.',
    'No photorealism, 3D, Pixar, Ghibli drift, glossy SaaS UI, or corporate deck style.',
  ],
  characterLock:
    'Present-day Frogface: olive/sage frog, tired kind brown half-lidded eyes, tan throat/chin, dark olive spots, clean grey hoodie with drawstrings and no logo, white undershirt, dark loose pants, white sneakers, coffee when useful.',
  textRule: 'Use the supplied Russian Cyrillic text verbatim. Do not add, translate, shorten, or invent readable words.',
} as const satisfies DiaryVisualContract;

export const diaryVisualDirections = [
  {
    id: 'a',
    label: 'character-scene',
    description: 'small Frogface scene, lived-in diary moment, character supports the text',
  },
  {
    id: 'b',
    label: 'typographic-cover',
    description: 'strong hand-lettered typography, minimal character or no character',
  },
  {
    id: 'c',
    label: 'diagram-page',
    description: 'sketchbook diagram, arrows, objects and structure, no corporate UI',
  },
  {
    id: 'd',
    label: 'object-still-life',
    description: 'tabletop/notebook objects, mood and details, Frogface optional',
  },
] as const satisfies DiaryVisualDirection[];

export const carouselFactoryConfig = {
  title: 'Carousel Factory',
  navLabel: 'carousel factory',
  description:
    'Универсальная фабрика каруселей: голос, факты и агентские апдейты превращаются в текстовые варианты, промпты, визуальные слоты, выбор и финальный экспорт.',
  apiNamespace: '/api/diary-factory',
  activePresetId: 'diary-day-04',
  activeEntrySlug: entrySlug,
  voiceRules: [
    'Do not force an audience greeting like "Друзья" at the start of diary slides.',
    'Default diary opening: "Дорогой дневник, сегодня..." or a direct "День N" setup.',
    'Stay close to Boss voice notes; edit for rhythm and clarity, but do not invent extra story beats.',
    'Keep the tone personal, alive, slightly tired, and honest.',
  ],
  presets: [
    {
      id: 'diary',
      label: 'дневник',
      title: 'Миллион с нуля',
      purpose: 'Живая ежедневная история пути, без глянца и мотивационного шума.',
      input: 'Голос Босса, итоги агентов, факты дня, личная мысль.',
      output: 'Instagram carousel 3:4, 4 текста и 4 визуала на каждый слайд.',
      status: 'active',
    },
    {
      id: 'receptor',
      label: 'Receptor',
      title: 'Продуктовые апдейты',
      purpose: 'Показывать прогресс операционной системы для ресторана понятным языком.',
      input: 'Фичи, пилот, ресторанные боли, демо-сценарии, решения.',
      output: 'Карусель для личного бренда, продаж, пилотных ресторанов и кейсов.',
      status: 'ready',
    },
    {
      id: 'launch',
      label: 'запуск',
      title: 'Анонсы и офферы',
      purpose: 'Собирать запуск, оффер или новую страницу в короткую визуальную историю.',
      input: 'Что запустили, для кого, почему сейчас, какой следующий шаг.',
      output: 'Промо-карусель с понятным CTA и вариантами подачи.',
      status: 'planned',
    },
    {
      id: 'case-study',
      label: 'кейс',
      title: 'Разбор результата',
      purpose: 'Упаковывать сделанную работу в доказательную историю.',
      input: 'Было, сделали, что изменилось, цифры, выводы, следующий шаг.',
      output: 'Кейс-карусель для сайта, Telegram, Instagram и продаж.',
      status: 'planned',
    },
  ],
  nextQueue: [
    {
      id: 'diary-day-04',
      label: 'день 4',
      title: 'Карусель четвертого дня',
      status: 'ready-for-approval',
      generationLocked: true,
      sourceNeeds: [
        'текст зафиксирован Боссом 4 июля',
        'перед генерацией проверить переносы строк и explicit approval',
        'визуалы не генерировать автоматически',
        'тон: дневник, ролики, Receptor, контент-фабрика, Edison-ностальгия',
      ],
    },
  ],
  flow: [
    'Собрать сырье: голос, факты, апдейты агентов.',
    'Сделать по 4 варианта заголовка и текста на каждый слайд.',
    'Отредактировать и утвердить текст прямо в фабрике.',
    'Только после утверждения подготовить промпты и очередь генерации.',
    'Сгенерировать или загрузить 4 визуала на каждый слайд.',
    'Выбрать лучшие чекбоксами и собрать финальную папку.',
  ],
} as const satisfies CarouselFactoryConfig;

const fixedTextVariant = (heading: string, text: string): DiaryTextVariant[] => [
  {
    id: 'fixed',
    label: 'Fixed',
    heading,
    text,
  },
];

export const diaryEntry: DiaryEntry = {
  slug: entrySlug,
  title: '4 июля: стратегическая сессия на роликах',
  description: 'Зафиксированный текст дневниковой карусели Frogface за день 4.',
  variantDir: `public/diary/${entrySlug}/variants`,
  finalDir: `public/diary/${entrySlug}/final`,
  caption:
    'Дорогой дневник, сегодня день 4. Стратегическая сессия на роликах, Receptor перед пилотом, контент-фабрика и немного Edison-ностальгии.',
  slides: [
    {
      id: 'slide-01',
      index: 1,
      title: 'Слайд 1',
      text: 'Дорогой дневник, сегодня день 4.\nВ субботу провел потрясающе\nпродуктивную стратегическую\nсессию.\nКатаясь на роликах.',
      textVariants: fixedTextVariant(
        'День 4',
        'Дорогой дневник, сегодня день 4.\nВ субботу провел потрясающе\nпродуктивную стратегическую\nсессию.\nКатаясь на роликах.',
      ),
      variants: [],
    },
    {
      id: 'slide-02',
      index: 2,
      title: 'Слайд 2',
      text: 'Болтал со своими агентами,\nдоговаривался с людьми\nи заодно сжег 1700 калорий.',
      textVariants: fixedTextVariant(
        '1700 калорий',
        'Болтал со своими агентами,\nдоговаривался с людьми\nи заодно сжег 1700 калорий.',
      ),
      variants: [],
    },
    {
      id: 'slide-03',
      index: 3,
      title: 'Слайд 3',
      text: 'Проект Receptor допиливаем.\nСейчас убираем строительные леса,\nкоторые нагородили,\nи готовим систему к пилотному\nподключению реального ресторана\nв понедельник.',
      textVariants: fixedTextVariant(
        'Receptor',
        'Проект Receptor допиливаем.\nСейчас убираем строительные леса,\nкоторые нагородили,\nи готовим систему к пилотному\nподключению реального ресторана\nв понедельник.',
      ),
      variants: [],
    },
    {
      id: 'slide-04',
      index: 4,
      title: 'Слайд 4',
      text: 'Нужно все упрощать.\nНужно, чтобы пьяный человек\nмог понять, что там происходит,\nи сказать:\n“Вау, мне такое надо!”',
      textVariants: fixedTextVariant(
        'Упрощать',
        'Нужно все упрощать.\nНужно, чтобы пьяный человек\nмог понять, что там происходит,\nи сказать:\n“Вау, мне такое надо!”',
      ),
      variants: [],
    },
    {
      id: 'slide-05',
      index: 5,
      title: 'Слайд 5',
      text: 'Сегодня не снял видео.\nЗато доделали контент-фабрику.\nТеперь буду постить\nвот таких лягушек.',
      textVariants: fixedTextVariant(
        'Контент-фабрика',
        'Сегодня не снял видео.\nЗато доделали контент-фабрику.\nТеперь буду постить\nвот таких лягушек.',
      ),
      variants: [],
    },
    {
      id: 'slide-06',
      index: 6,
      title: 'Слайд 6',
      text: 'Вчера под пиво смотрел видео\nс концерта Синего Бита\nна закрытии EDISON BAR.\nОчень душевно.\nСкучаю.',
      textVariants: fixedTextVariant(
        'Edison Bar',
        'Вчера под пиво смотрел видео\nс концерта Синего Бита\nна закрытии EDISON BAR.\nОчень душевно.\nСкучаю.',
      ),
      variants: [],
    },
  ],
};

export function validateDiaryDraftSlides(slides: unknown) {
  const errors: string[] = [];
  const normalized: DiaryDraftSlides = {};

  if (!slides || typeof slides !== 'object' || Array.isArray(slides)) {
    return {
      ok: false,
      errors: ['Missing slides object'],
      slides: normalized,
    };
  }

  const input = slides as Record<string, Partial<DiaryDraftSlide> | undefined>;

  for (const slide of diaryEntry.slides) {
    const draftSlide = input[slide.id];
    const heading = typeof draftSlide?.heading === 'string' ? draftSlide.heading.trim() : '';
    const text = typeof draftSlide?.text === 'string' ? draftSlide.text.trim() : '';
    const variantId =
      typeof draftSlide?.variantId === 'string' && draftSlide.variantId.trim()
        ? draftSlide.variantId.trim()
        : undefined;

    if (!draftSlide) errors.push(`${slide.id}: missing`);
    if (!heading) errors.push(`${slide.id}: empty heading`);
    if (!text) errors.push(`${slide.id}: empty text`);

    normalized[slide.id] = {
      heading,
      text,
      variantId,
      approved: Boolean(draftSlide?.approved),
    };
  }

  return {
    ok: errors.length === 0,
    errors,
    slides: normalized,
  };
}

export function auditDiaryTextSlides(slides: DiaryDraftSlides) {
  const limits = diaryTextLimits;
  const items: DiaryTextAuditItem[] = diaryEntry.slides.map((slide) => {
    const current = slides[slide.id];
    const heading = current?.heading ?? slide.title;
    const text = current?.text ?? slide.text;
    const lines = [heading, ...text.split('\n')].map((line) => line.trim()).filter(Boolean);
    const maxLineLength = Math.max(...lines.map((line) => line.length), 0);
    const totalChars = lines.join('\n').length;
    const warnings = [
      heading.length > limits.maxHeadingLength
        ? `heading ${heading.length}/${limits.maxHeadingLength}`
        : null,
      lines.length > limits.maxLineCount ? `lines ${lines.length}/${limits.maxLineCount}` : null,
      maxLineLength > limits.maxLineLength
        ? `longest line ${maxLineLength}/${limits.maxLineLength}`
        : null,
      totalChars > limits.maxTotalChars ? `chars ${totalChars}/${limits.maxTotalChars}` : null,
    ].filter((warning): warning is string => Boolean(warning));

    return {
      slideId: slide.id,
      index: slide.index,
      heading,
      approved: Boolean(current?.approved),
      lineCount: lines.length,
      maxLineLength,
      totalChars,
      ok: warnings.length === 0,
      warnings,
    };
  });
  const failed = items.filter((item) => !item.ok);

  return {
    ok: failed.length === 0,
    limits,
    failedCount: failed.length,
    failed,
    items,
  };
}

export function wrapDiaryLine(line: string, maxLineLength = diaryTextLimits.maxLineLength) {
  const words = line.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [''];

  const wrapped: string[] = [];
  let current = '';

  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }

    const next = `${current} ${word}`;
    if (next.length <= maxLineLength) {
      current = next;
      continue;
    }

    wrapped.push(current);
    current = word;
  }

  if (current) wrapped.push(current);
  return wrapped;
}

export function wrapDiaryText(text: string, maxLineLength = diaryTextLimits.maxLineLength) {
  return text
    .split('\n')
    .flatMap((line) => wrapDiaryLine(line, maxLineLength))
    .join('\n');
}

export function suggestDiaryTextFit(slides: DiaryDraftSlides) {
  const suggestedSlides: DiaryDraftSlides = {};
  const suggestions: DiaryTextFitSuggestion[] = [];

  for (const slide of diaryEntry.slides) {
    const current = slides[slide.id];
    const heading = current?.heading ?? slide.title;
    const currentText = current?.text ?? slide.text;
    const suggestedText = wrapDiaryText(currentText);
    const changed = suggestedText !== currentText;

    suggestedSlides[slide.id] = {
      heading,
      text: suggestedText,
      variantId: current?.variantId,
      approved: changed ? false : Boolean(current?.approved),
    };

    if (changed) {
      suggestions.push({
        slideId: slide.id,
        index: slide.index,
        heading,
        currentText,
        suggestedText,
        changed,
      });
    }
  }

  const auditBefore = auditDiaryTextSlides(slides);
  const auditAfter = auditDiaryTextSlides(suggestedSlides);

  return {
    ok: auditAfter.ok,
    writesFiles: false,
    changedCount: suggestions.length,
    auditBefore,
    auditAfter,
    suggestions,
    slides: suggestedSlides,
  };
}

export function buildDiaryPrompt({
  index,
  heading,
  text,
  direction,
}: {
  index: number;
  heading: string;
  text: string;
  direction: DiaryVisualDirection;
}) {
  const referenceList = diaryVisualContract.references
    .map((reference) => `- ${reference.path} (${reference.use})`)
    .join('\n');
  const slideSceneInstruction =
    index === 1
      ? '\nSlide 1 scene: Frogface must be present, sitting at a small desk or open sketchbook, writing in a diary with one pen. Two arms only. Keep Frogface compact and let the Russian diary text remain dominant.'
      : '';
  const frogfacePresence = index === 1 ? 'required' : 'optional';

  return `Use case: ads-marketing
Asset type: Instagram carousel diary slide ${index}, variant ${direction.id.toUpperCase()}, portrait 3:4 (1080x1440 feel)
Primary request: Create a Frogface diary carousel slide in Russian.
Scene/backdrop: warm off-white sketchbook paper, subtle square grid, thick imperfect black frame, coffee stains, pencil marks, small arrows, restrained red marker accents, tiny lime secondary accents. Do not use orange accents. Do not use tape/plaster strips as a repeating motif. No tower, no skyscraper, no skyline goal imagery.
Visual direction: ${direction.description}.${slideSceneInstruction}
Reference images for Frogface if character appears:
${referenceList}
Frogface character rule: If Frogface appears, use the present-day etalon: olive/sage frog, tired kind brown half-lidded eyes, tan throat/chin, dark olive spots, clean grey hoodie with drawstrings and no logo, white undershirt, dark loose pants, white sneakers, coffee when useful. Frogface is ${frogfacePresence} for this slide.
Style/medium: clean 2D comic sketchbook, hand-drawn black ink and marker, rough but intentional, premium personal diary/worldbuilding. Not photorealistic, not 3D, not Pixar, not glossy, not corporate SaaS.
Composition/framing: generous safe margins for 3:4 Instagram carousel, readable on phone, no fake clutter.
Color palette: off-white paper, black ink, olive/sage greens, warm tan, strong red accents, firefly lime secondary accents, graphite grey.
Text (verbatim, Russian Cyrillic, large readable hand-lettering, no extra words):
"${heading}
${text}"
Constraints: Cyrillic text must be correctly spelled and legible; keep exact wording; no extra readable text; no logos; no watermark; Frogface must not have extra arms/hands; no tower or skyscraper imagery.`;
}

export function buildDiaryPromptPack(slides: DiaryDraftSlides) {
  return diaryEntry.slides.map((slide) => {
    const approved = slides[slide.id];
    const heading = approved?.heading ?? slide.title;
    const text = approved?.text ?? slide.text;
    const variants = diaryVisualDirections.map((direction) => {
      const fileBase = `${slide.id}-${direction.id}`;

      return {
        id: direction.id,
        label: direction.label,
        outputFile: `variants/${fileBase}.png`,
        promptFile: `prompts/${fileBase}.prompt.txt`,
        prompt: buildDiaryPrompt({
          index: slide.index,
          heading,
          text,
          direction,
        }),
      };
    });

    return {
      id: slide.id,
      index: slide.index,
      heading,
      text,
      variants,
    };
  });
}

export function auditDiaryPrompts(prompts: string[]) {
  const checks = {
    redAccent: (prompt: string) => prompt.includes('red accents'),
    noOrangeRule: (prompt: string) => prompt.includes('Do not use orange accents'),
    noTapeAsMotif: (prompt: string) =>
      prompt.includes('Do not use tape/plaster strips as a repeating motif'),
    noTowerRule: (prompt: string) => prompt.includes('No tower'),
    noSkyscraperRule: (prompt: string) => prompt.includes('no skyscraper'),
    noExtraHandsRule: (prompt: string) => prompt.includes('must not have extra arms/hands'),
    cyrillicRule: (prompt: string) =>
      prompt.includes('Cyrillic text must be correctly spelled and legible'),
    formatRule: (prompt: string) => prompt.includes('portrait 3:4'),
    presentDayEtalon: (prompt: string) => prompt.includes('present-day etalon'),
  };
  const failed = prompts.flatMap((prompt, index) =>
    Object.entries(checks)
      .filter(([, check]) => !check(prompt))
      .map(([rule]) => ({
        promptIndex: index,
        rule,
      })),
  );

  return {
    ok: failed.length === 0,
    promptCount: prompts.length,
    failed,
    checks: Object.keys(checks),
  };
}
