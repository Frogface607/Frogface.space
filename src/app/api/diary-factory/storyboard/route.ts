import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { resolveDiaryEntryDir } from '@/lib/diaryAssets.server';
import {
  auditDiaryTextSlides,
  diaryEntry,
  diaryVisualContract,
  diaryVisualDirections,
  type DiaryDraftSlide,
  validateDiaryDraftSlides,
} from '@/lib/diaryFactory';

export const dynamic = 'force-dynamic';

type DraftPayload = {
  slides?: Record<string, DiaryDraftSlide>;
};

const readDraft = async () => {
  try {
    const entryDir = await resolveDiaryEntryDir();
    const raw = await readFile(path.join(entryDir, 'draft.json'), 'utf8');
    return JSON.parse(raw.replace(/^\uFEFF/, '')) as DraftPayload;
  } catch {
    return undefined;
  }
};

export async function GET() {
  const draft = await readDraft();
  const validated = validateDiaryDraftSlides(draft?.slides);
  const textAudit = validated.ok ? auditDiaryTextSlides(validated.slides) : undefined;
  const approvedCount = validated.ok
    ? diaryEntry.slides.filter((slide) => validated.slides[slide.id]?.approved).length
    : 0;
  const allApproved = validated.ok && approvedCount === diaryEntry.slides.length;
  const slides = diaryEntry.slides.map((slide) => {
    const current = validated.slides[slide.id];
    const heading = current?.heading ?? slide.title;
    const text = current?.text ?? slide.text;

    return {
      id: slide.id,
      index: slide.index,
      heading,
      text,
      approved: Boolean(current?.approved),
      textVariantId: current?.variantId,
      visualOptions: diaryVisualDirections.map((direction) => ({
        variantId: direction.id,
        label: direction.label,
        description: direction.description,
        outputFile: `public/diary/${diaryEntry.slug}/variants/${slide.id}-${direction.id}.png`,
        promptFile: `public/diary/${diaryEntry.slug}/prompts/${slide.id}-${direction.id}.prompt.txt`,
      })),
    };
  });

  return NextResponse.json({
    ok: validated.ok,
    entry: diaryEntry.slug,
    writesFiles: false,
    goal: 'Million from zero in 80 days.',
    workingTitle: diaryEntry.title,
    storyline: [
      'Set the challenge goal and admit the sleep fight.',
      'Show the white-night / rain / idea overload state.',
      'Move into Receptor as the main project.',
      'Connect Receptor to 10 years of restaurant experience.',
      'Point toward the friends-restaurant pilot.',
      'Introduce the diary content factory.',
      'Mention the personal portfolio site and Frogface character.',
      'End with the personal creative principle: doing it differently is more interesting.',
    ],
    status: {
      validDraft: validated.ok,
      errors: validated.errors,
      approvedCount,
      total: diaryEntry.slides.length,
      allApproved,
      textFits: Boolean(textAudit?.ok),
      failedFitCount: textAudit?.failedCount ?? 0,
      readyForPromptPlan: allApproved && Boolean(textAudit?.ok),
    },
    visualContract: {
      format: diaryVisualContract.format,
      outputSize: diaryVisualContract.outputSize,
      accent: 'red, not orange',
      referenceDir: diaryVisualContract.referenceDir,
      references: diaryVisualContract.references,
      requiredRules: diaryVisualContract.requiredRules,
      forbiddenRules: diaryVisualContract.forbiddenRules,
    },
    slides,
    caption: slides.map((slide) => `${slide.heading}\n${slide.text}`).join('\n\n'),
    api: {
      factory: '/diary-factory',
      script: '/api/diary-factory/script',
      textVariants: '/api/diary-factory/text-variants',
      approvalSheet: '/api/diary-factory/approval-sheet',
      visualContract: '/api/diary-factory/visual-contract',
      generationPlanPreview: '/api/diary-factory/generation-plan-preview',
      generationBrief: '/api/diary-factory/generation-brief',
      health: '/api/diary-factory/health',
    },
  });
}
