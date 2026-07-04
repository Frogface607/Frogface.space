import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { auditReferenceAssets, resolveDiaryEntryDir } from '@/lib/diaryAssets.server';
import {
  auditDiaryTextSlides,
  auditDiaryPrompts,
  buildDiaryPromptPack,
  diaryEntry,
  diaryVisualContract,
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

  if (!validated.ok) {
    return NextResponse.json(
      { ok: false, error: `Fix text first: ${validated.errors.join(', ')}` },
      { status: 400 },
    );
  }

  const approvedCount = diaryEntry.slides.filter(
    (slide) => validated.slides[slide.id]?.approved,
  ).length;
  const allApproved = approvedCount === diaryEntry.slides.length;
  const textAudit = auditDiaryTextSlides(validated.slides);
  const referenceAudit = await auditReferenceAssets();
  const promptReady = allApproved && textAudit.ok && referenceAudit.ok;
  const slides = buildDiaryPromptPack(validated.slides);
  const promptCount = promptReady
    ? slides.reduce((total, slide) => total + slide.variants.length, 0)
    : 0;
  const audit = auditDiaryPrompts(
    promptReady ? slides.flatMap((slide) => slide.variants.map((variant) => variant.prompt)) : [],
  );

  return NextResponse.json({
    ok: true,
    entry: diaryEntry.slug,
    status: promptReady
      ? 'preview-only'
      : allApproved && textAudit.ok && !referenceAudit.ok
        ? 'blocked-reference-assets'
      : allApproved
        ? 'blocked-text-fit'
        : 'blocked-text-approval',
    writesFiles: false,
    readyForPromptUse: promptReady,
    blockedReason: promptReady
      ? null
      : allApproved && textAudit.ok && !referenceAudit.ok
        ? `Restore Frogface reference assets first: ${referenceAudit.failedCount} missing/invalid reference(s).`
      : allApproved
        ? `Apply + save line breaks first: ${textAudit.failedCount} slide(s).`
      : `Approve text first: ${approvedCount} / ${diaryEntry.slides.length}.`,
    approvedCount,
    total: diaryEntry.slides.length,
    allApproved,
    textFits: textAudit.ok,
    failedFitCount: textAudit.failedCount,
    referencesReady: referenceAudit.ok,
    failedReferenceCount: referenceAudit.failedCount,
    rules: {
      visualContract: diaryVisualContract,
      format: '3:4 portrait',
      accent: 'red, not orange',
      tapeOrPlaster: 'not a repeating motif; use rarely if useful',
      tower: 'omit',
      frogface: 'optional per slide; use present-day etalon when present',
    },
    audit,
    promptCount,
    api: {
      visualContract: '/api/diary-factory/visual-contract',
      generationBrief: '/api/diary-factory/generation-brief',
      generationQueue: '/api/diary-factory/generation-queue',
    },
    slides: promptReady
      ? slides
      : slides.map((slide) => ({
          id: slide.id,
          index: slide.index,
          heading: slide.heading,
          text: slide.text,
          variants: slide.variants.map(({ prompt, ...variant }) => {
            void prompt;

            return variant;
          }),
        })),
  });
}
