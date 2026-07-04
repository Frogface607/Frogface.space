import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import {
  auditVisualAssets,
  readReadyVisualSlides,
  resolveDiaryEntryDir,
} from '@/lib/diaryAssets.server';
import {
  auditDiaryPrompts,
  auditDiaryTextSlides,
  buildDiaryPromptPack,
  diaryEntry,
  diaryVisualContract,
  diaryVisualDirections,
  suggestDiaryTextFit,
  type DiaryDraftSlide,
  validateDiaryDraftSlides,
} from '@/lib/diaryFactory';

export const dynamic = 'force-dynamic';

type DraftPayload = {
  slides?: Record<string, DiaryDraftSlide>;
};

type SelectionPayload = {
  selected?: Record<string, string>;
};

const exists = async (filePath: string) => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

const readText = async (filePath: string) => {
  try {
    return (await readFile(filePath, 'utf8')).replace(/^\uFEFF/, '');
  } catch {
    return '';
  }
};

const readJson = async <T,>(filePath: string): Promise<T | undefined> => {
  try {
    return JSON.parse(await readText(filePath)) as T;
  } catch {
    return undefined;
  }
};

export async function GET() {
  const cwd = process.cwd();
  const entryDir = await resolveDiaryEntryDir(cwd);
  const draft = await readJson<DraftPayload>(path.join(entryDir, 'draft.json'));
  const selection = await readJson<SelectionPayload>(path.join(entryDir, 'visual-selection.json'));
  const sourceNotes = await readText(path.join(entryDir, 'source-notes.md'));
  const validatedDraft = validateDiaryDraftSlides(draft?.slides);
  const textAudit = validatedDraft.ok ? auditDiaryTextSlides(validatedDraft.slides) : undefined;
  const textFit = validatedDraft.ok ? suggestDiaryTextFit(validatedDraft.slides) : undefined;
  const readyVisualSlides = await readReadyVisualSlides(cwd);
  const assetAudit = await auditVisualAssets(cwd);
  const promptSlides = validatedDraft.ok ? buildDiaryPromptPack(validatedDraft.slides) : [];
  const readyVariantCount = readyVisualSlides.reduce(
    (total, slide) => total + slide.variants.length,
    0,
  );
  const expectedVariantCount = diaryEntry.slides.length * diaryVisualDirections.length;
  const approvedCount = validatedDraft.ok
    ? diaryEntry.slides.filter((slide) => validatedDraft.slides[slide.id]?.approved).length
    : 0;
  const missingVisuals = diaryEntry.slides.flatMap((slide) => {
    const readySlide = readyVisualSlides.find((item) => item.id === slide.id);

    return diaryVisualDirections
      .filter((direction) => !readySlide?.variants.some((variant) => variant.id === direction.id))
      .map((direction) => ({
        slideId: slide.id,
        variantId: direction.id,
        fileName: `${slide.id}-${direction.id}.png`,
        outputFile: `variants/${slide.id}-${direction.id}.png`,
        direction: direction.label,
      }));
  });
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
  const allTextApproved = validatedDraft.ok && approvedCount === diaryEntry.slides.length;
  const audit = auditDiaryPrompts(
    allTextApproved
      ? promptSlides.flatMap((slide) => slide.variants.map((variant) => variant.prompt))
      : [],
  );
  const selectedCount = Object.keys(selection?.selected ?? {}).length;

  const nextActions = [
    !allTextApproved
      ? `Approve text for all slides: ${approvedCount} / ${diaryEntry.slides.length}.`
      : null,
    allTextApproved && !(await exists(path.join(entryDir, 'generation-plan.json')))
      ? 'Prepare generation-plan and prompt files.'
      : null,
    readyVariantCount < expectedVariantCount
      ? `Generate missing visual variants: ${readyVariantCount} / ${expectedVariantCount}.`
      : null,
    assetAudit.failedCount > 0
      ? `Regenerate invalid visual variants: ${assetAudit.failedCount}.`
      : null,
    readyVariantCount === expectedVariantCount && selectedCount < diaryEntry.slides.length
      ? `Select one visual variant per slide: ${selectedCount} / ${diaryEntry.slides.length}.`
      : null,
  ].filter((item): item is string => Boolean(item));

  return NextResponse.json({
    ok: true,
    entry: diaryEntry.slug,
    generatedAt: new Date().toISOString(),
    writesFiles: false,
    nextActions,
    generationReadiness: {
      ready: allTextApproved,
      blockedReason: allTextApproved
        ? null
        : `Approve text first: ${approvedCount} / ${diaryEntry.slides.length}.`,
      textApproved: allTextApproved,
      textFitOk: textFit?.ok ?? false,
      promptPreviewExposesPrompts: allTextApproved,
    },
    sourceNotes,
    text: {
      valid: validatedDraft.ok,
      errors: validatedDraft.errors,
      approvedCount,
      total: diaryEntry.slides.length,
      allApproved: allTextApproved,
      audit: textAudit,
      fit: textFit,
      slides: diaryEntry.slides.map((slide) => ({
        id: slide.id,
        index: slide.index,
        title: slide.title,
        selected: validatedDraft.slides[slide.id],
        variants: slide.textVariants,
      })),
    },
    visualRules: {
      contract: diaryVisualContract,
      format: '3:4 portrait',
      accent: 'red, not orange',
      tapeOrPlaster: 'not a repeating motif; use rarely if useful',
      tower: 'omit',
      frogface: 'optional per slide; use present-day etalon when present',
      cyrillic: 'large, readable, exact wording',
    },
    assets: {
      readyVariantCount,
      expectedVariantCount,
      audit: assetAudit,
      readySlides: readyVisualSlides.map((slide) => ({
        ...slide,
        variants: slide.variants.map((variant) => ({
          ...variant,
          publicPath: `/diary/${diaryEntry.slug}/variants/${variant.fileName}`,
        })),
      })),
      missingCount: missingVisuals.length,
      missing: missingVisuals,
      selected: selection?.selected ?? {},
    },
    prompts: {
      audit,
      promptCount: allTextApproved
        ? promptSlides.reduce((total, slide) => total + slide.variants.length, 0)
        : 0,
      missingQueueCount: queue.length,
      missingAssetCount: assetAudit.items.filter((item) => !item.ready).length,
      invalidAssetCount: assetAudit.failedCount,
      missingQueue: queue.map((item) => {
        const { prompt, ...safeItem } = item;
        void prompt;

        return allTextApproved ? item : safeItem;
      }),
    },
    api: {
      agentNoteAppend: '/api/diary-factory/agent-note',
      health: '/api/diary-factory/health',
      reviewPacket: '/api/diary-factory/review-packet',
      approvalSheet: '/api/diary-factory/approval-sheet',
      approvalCheckpoint: '/api/diary-factory/approval-checkpoint',
      textVariants: '/api/diary-factory/text-variants',
      visualContract: '/api/diary-factory/visual-contract',
      referenceAudit: '/api/diary-factory/reference-audit',
      sourceNotes: '/api/diary-factory/source-notes',
      draft: '/api/diary-factory/draft',
      script: '/api/diary-factory/script',
      storyboard: '/api/diary-factory/storyboard',
      prompts: '/api/diary-factory/prompts',
      promptPack: '/api/diary-factory/prompt-pack',
      promptPackJsonl: '/api/diary-factory/prompt-pack?format=jsonl',
      generationPlanPreview: '/api/diary-factory/generation-plan-preview',
      textAudit: '/api/diary-factory/text-audit',
      textFit: '/api/diary-factory/text-fit',
      generationQueue: '/api/diary-factory/generation-queue',
      assetAudit: '/api/diary-factory/asset-audit',
      visualBoard: '/api/diary-factory/visual-board',
      productionManifest: '/api/diary-factory/production-manifest',
      productionManifestCsv: '/api/diary-factory/production-manifest?format=csv',
      assetIntake: '/api/diary-factory/asset-intake',
      assetIntakeBatch: '/api/diary-factory/asset-intake-batch',
      assets: '/api/diary-factory/assets',
      finalExport: '/api/diary-factory/final-export',
      status: '/api/diary-factory/status',
    },
  });
}
