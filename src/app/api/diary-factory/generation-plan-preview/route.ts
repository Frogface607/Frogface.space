import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { auditReferenceAssets, resolveDiaryEntryDir } from '@/lib/diaryAssets.server';
import {
  auditDiaryPrompts,
  auditDiaryTextSlides,
  buildDiaryPromptPack,
  diaryEntry,
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
      {
        ok: false,
        entry: diaryEntry.slug,
        writesFiles: false,
        readyToWrite: false,
        error: `Fix text first: ${validated.errors.join(', ')}`,
        errors: validated.errors,
      },
      { status: 400 },
    );
  }

  const textAudit = auditDiaryTextSlides(validated.slides);
  const referenceAudit = await auditReferenceAssets();
  const approvedCount = diaryEntry.slides.filter(
    (slide) => validated.slides[slide.id]?.approved,
  ).length;
  const allApproved = approvedCount === diaryEntry.slides.length;
  const promptSlides = buildDiaryPromptPack(validated.slides);
  const promptAudit = auditDiaryPrompts(
    promptSlides.flatMap((slide) => slide.variants.map((variant) => variant.prompt)),
  );
  const readyToWrite = allApproved && textAudit.ok && referenceAudit.ok && promptAudit.ok;
  const plan = {
    entry: diaryEntry.slug,
    status: 'prompts-only',
    rules: {
      format: '3:4 portrait',
      accent: 'red, not orange',
      tapeOrPlaster: 'not a repeating motif; use rarely if useful',
      tower: 'omit',
      frogface: 'optional per slide; use present-day etalon when present',
    },
    slides: promptSlides.map((slide) => ({
      id: slide.id,
      index: slide.index,
      heading: slide.heading,
      text: slide.text,
      variants: slide.variants.map(({ prompt, ...variant }) => {
        void prompt;
        return variant;
      }),
    })),
  };
  const promptSlotCount = promptSlides.reduce((total, slide) => total + slide.variants.length, 0);
  const blockedReason = !textAudit.ok
    ? `Apply + save line breaks first: ${textAudit.failedCount} slide(s).`
    : !referenceAudit.ok
      ? `Restore Frogface reference assets first: ${referenceAudit.failedCount} missing/invalid reference(s).`
    : !promptAudit.ok
      ? `Fix prompt contract first: ${promptAudit.failed.length} failed check(s).`
    : !allApproved
      ? `Approve text first: ${approvedCount} / ${diaryEntry.slides.length}.`
      : null;

  return NextResponse.json({
    ok: true,
    entry: diaryEntry.slug,
    writesFiles: false,
    readyToWrite,
    blockedReason,
    approvedCount,
    total: diaryEntry.slides.length,
    textFits: textAudit.ok,
    failedFitCount: textAudit.failedCount,
    referencesReady: referenceAudit.ok,
    failedReferenceCount: referenceAudit.failedCount,
    promptContractOk: promptAudit.ok,
    failedPromptContractCount: promptAudit.failed.length,
    promptContractChecks: promptAudit.checks,
    promptSlotCount,
    wouldWrite: {
      generationPlan: `public/diary/${diaryEntry.slug}/generation-plan.json`,
      promptsDir: `public/diary/${diaryEntry.slug}/prompts`,
      promptFiles: plan.slides.flatMap((slide) =>
        slide.variants.map((variant) => `public/diary/${diaryEntry.slug}/${variant.promptFile}`),
      ),
    },
    plan,
    api: {
      factory: '/diary-factory',
      generationPlanPost: '/api/diary-factory/generation-plan',
      prompts: '/api/diary-factory/prompts',
      generationQueue: '/api/diary-factory/generation-queue',
      generationBrief: '/api/diary-factory/generation-brief',
      health: '/api/diary-factory/health',
    },
  });
}
