import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import {
  auditReferenceAssets,
  auditVisualAssets,
  readReadyVisualSlides,
  resolveDiaryEntryDir,
} from '@/lib/diaryAssets.server';
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

  const readySlides = await readReadyVisualSlides();
  const assetAudit = await auditVisualAssets();
  const promptSlides = buildDiaryPromptPack(validated.slides);
  const queue = promptSlides.flatMap((slide) => {
    return slide.variants
      .map((variant) => {
        const auditItem = assetAudit.items.find(
          (item) => item.slideId === slide.id && item.variantId === variant.id,
        );

        return {
          slideId: slide.id,
          slideIndex: slide.index,
          variantId: variant.id,
          label: variant.label,
          outputFile: variant.outputFile,
          promptFile: variant.promptFile,
          heading: slide.heading,
          text: slide.text,
          prompt: variant.prompt,
          reason: auditItem?.ready ? 'regenerate-invalid-asset' : 'generate-missing-asset',
          issue: auditItem?.issue,
          ready: Boolean(auditItem?.ready),
        };
      })
      .filter((variant) => {
        const auditItem = assetAudit.items.find(
          (item) => item.slideId === slide.id && item.variantId === variant.variantId,
        );

        return !auditItem?.ok;
      });
  });
  const approvedCount = diaryEntry.slides.filter(
    (slide) => validated.slides[slide.id]?.approved,
  ).length;
  const allApproved = approvedCount === diaryEntry.slides.length;
  const textAudit = auditDiaryTextSlides(validated.slides);
  const referenceAudit = await auditReferenceAssets();
  const promptReady = allApproved && textAudit.ok && referenceAudit.ok;
  const audit = auditDiaryPrompts(promptReady ? queue.map((item) => item.prompt) : []);

  return NextResponse.json({
    ok: true,
    entry: diaryEntry.slug,
    status: promptReady
      ? 'queue-preview-only'
      : allApproved && textAudit.ok && !referenceAudit.ok
        ? 'blocked-reference-assets'
      : allApproved
        ? 'blocked-text-fit'
        : 'blocked-text-approval',
    writesFiles: false,
    readyForGeneration: promptReady,
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
    visualContract: diaryVisualContract,
    api: {
      visualContract: '/api/diary-factory/visual-contract',
      generationBrief: '/api/diary-factory/generation-brief',
      prompts: '/api/diary-factory/prompts',
    },
    assetAudit: {
      ok: assetAudit.ok,
      failedCount: assetAudit.failedCount,
      failed: assetAudit.failed,
    },
    readyVariantCount: promptSlides.reduce(
      (total, slide) =>
        total +
        slide.variants.filter((variant) =>
          readySlides
            .find((readySlide) => readySlide.id === slide.id)
            ?.variants.some((ready) => ready.id === variant.id),
        ).length,
      0,
    ),
    missingCount: queue.length,
    missingAssetCount: assetAudit.items.filter((item) => !item.ready).length,
    invalidAssetCount: assetAudit.failedCount,
    audit,
    queue: queue.map((item) => {
      const { prompt, ...safeItem } = item;
      void prompt;

      return promptReady ? item : safeItem;
    }),
  });
}
