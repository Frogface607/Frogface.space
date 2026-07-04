import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import {
  auditVisualAssets,
  readReadyVisualSlides,
  resolveDiaryEntryDir,
  sanitizeVisualSelection,
} from '@/lib/diaryAssets.server';
import {
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
  const readyVisualSlides = await readReadyVisualSlides(cwd);
  const assetAudit = await auditVisualAssets(cwd);
  const { sanitized: selected, rejected } = sanitizeVisualSelection(
    selection?.selected ?? {},
    readyVisualSlides,
  );
  const artifacts = {
    sourceNotes: await exists(path.join(entryDir, 'source-notes.md')),
    draft: await exists(path.join(entryDir, 'draft.json')),
    generationPlan: await exists(path.join(entryDir, 'generation-plan.json')),
    prompts: await exists(path.join(entryDir, 'prompts')),
    visualSelection: Boolean(selection),
    final: await exists(path.join(entryDir, 'final')),
  };
  const approvedCount = validatedDraft.ok
    ? diaryEntry.slides.filter((slide) => validatedDraft.slides[slide.id]?.approved).length
    : 0;
  const allTextApproved = validatedDraft.ok && approvedCount === diaryEntry.slides.length;
  const promptSlides = validatedDraft.ok ? buildDiaryPromptPack(validatedDraft.slides) : [];
  const queue = promptSlides.flatMap((slide) =>
    slide.variants
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
          ready: Boolean(auditItem?.ready),
          reason: auditItem?.ready ? 'regenerate-invalid-asset' : 'generate-missing-asset',
          issue: auditItem?.issue,
          prompt: variant.prompt,
        };
      })
      .filter((item) => {
        const auditItem = assetAudit.items.find(
          (asset) => asset.slideId === slide.id && asset.variantId === item.variantId,
        );

        return !auditItem?.ok;
      }),
  );
  const expectedVariantCount = diaryEntry.slides.length * diaryVisualDirections.length;
  const readyVariantCount = readyVisualSlides.reduce(
    (total, slide) => total + slide.variants.length,
    0,
  );
  const selectedCount = Object.keys(selected).length;
  const blockedReason = !validatedDraft.ok
    ? `Fix draft: ${validatedDraft.errors.join(', ')}`
    : !allTextApproved
      ? `Approve text: ${approvedCount} / ${diaryEntry.slides.length}.`
      : !artifacts.generationPlan
        ? 'Prepare generation-plan and prompt files.'
        : readyVariantCount < expectedVariantCount
          ? `Generate visual variants: ${readyVariantCount} / ${expectedVariantCount}.`
          : !assetAudit.ok
            ? `Regenerate invalid PNG files: ${assetAudit.failedCount}.`
            : selectedCount < diaryEntry.slides.length
              ? `Select visuals: ${selectedCount} / ${diaryEntry.slides.length}.`
              : artifacts.final
                ? null
                : 'Assemble final carousel.';

  return NextResponse.json({
    ok: true,
    entry: diaryEntry.slug,
    generatedAt: new Date().toISOString(),
    writesFiles: false,
    sourceNotes: {
      exists: artifacts.sourceNotes,
      chars: sourceNotes.length,
      path: `public/diary/${diaryEntry.slug}/source-notes.md`,
    },
    readiness: {
      phase: blockedReason ? 'in-progress' : 'ready',
      blockedReason,
      textApproved: allTextApproved,
      promptsUnlocked: allTextApproved,
      imageGenerationReady: allTextApproved && artifacts.generationPlan,
      assemblyReady:
        allTextApproved &&
        artifacts.generationPlan &&
        readyVariantCount === expectedVariantCount &&
        assetAudit.ok &&
        selectedCount === diaryEntry.slides.length,
    },
    text: validatedDraft.ok
      ? {
          approvedCount,
          total: diaryEntry.slides.length,
          audit: auditDiaryTextSlides(validatedDraft.slides),
          fit: suggestDiaryTextFit(validatedDraft.slides),
          slides: diaryEntry.slides.map((slide) => ({
            id: slide.id,
            index: slide.index,
            heading: validatedDraft.slides[slide.id]?.heading,
            text: validatedDraft.slides[slide.id]?.text,
            approved: Boolean(validatedDraft.slides[slide.id]?.approved),
          })),
        }
      : {
          approvedCount,
          total: diaryEntry.slides.length,
          errors: validatedDraft.errors,
        },
    visuals: {
      contract: diaryVisualContract,
      readyVariantCount,
      expectedVariantCount,
      missingCount: assetAudit.items.filter((item) => !item.ready).length,
      invalidCount: assetAudit.failedCount,
      assetAudit,
      selected,
      rejected,
    },
    generation: {
      queueCount: queue.length,
      promptTextIncluded: allTextApproved,
      queue: queue.map((item) => {
        const { prompt, ...safeItem } = item;
        void prompt;

        return allTextApproved ? item : safeItem;
      }),
    },
    artifacts,
    api: {
      factory: '/diary-factory',
      health: '/api/diary-factory/health',
      status: '/api/diary-factory/status',
      handoff: '/api/diary-factory/handoff',
      storyboard: '/api/diary-factory/storyboard',
      approvalSheet: '/api/diary-factory/approval-sheet',
      approvalCheckpoint: '/api/diary-factory/approval-checkpoint',
      textVariants: '/api/diary-factory/text-variants',
      visualContract: '/api/diary-factory/visual-contract',
      referenceAudit: '/api/diary-factory/reference-audit',
      textFit: '/api/diary-factory/text-fit',
      prompts: '/api/diary-factory/prompts',
      promptPack: '/api/diary-factory/prompt-pack',
      promptPackJsonl: '/api/diary-factory/prompt-pack?format=jsonl',
      generationPlanPreview: '/api/diary-factory/generation-plan-preview',
      generationQueue: '/api/diary-factory/generation-queue',
      generationBrief: '/api/diary-factory/generation-brief',
      assetIntake: '/api/diary-factory/asset-intake',
      assetIntakeBatch: '/api/diary-factory/asset-intake-batch',
      assetAudit: '/api/diary-factory/asset-audit',
      visualBoard: '/api/diary-factory/visual-board',
      productionManifest: '/api/diary-factory/production-manifest',
      productionManifestCsv: '/api/diary-factory/production-manifest?format=csv',
      finalExport: '/api/diary-factory/final-export',
    },
  });
}
