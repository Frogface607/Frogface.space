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
  diaryEntry,
  diaryVisualDirections,
  validateDiaryDraftSlides,
} from '@/lib/diaryFactory';

export const dynamic = 'force-dynamic';

type DraftPayload = {
  slides?: unknown;
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

const readJson = async <T,>(filePath: string): Promise<T | undefined> => {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw.replace(/^\uFEFF/, '')) as T;
  } catch {
    return undefined;
  }
};

export async function GET() {
  const cwd = process.cwd();
  const entryDir = await resolveDiaryEntryDir(cwd);
  const draftFile = path.join(entryDir, 'draft.json');
  const draft = await readJson<DraftPayload>(draftFile);
  const selection = await readJson<SelectionPayload>(path.join(entryDir, 'visual-selection.json'));
  const validatedDraft = validateDiaryDraftSlides(draft?.slides);
  const textAudit = validatedDraft.ok ? auditDiaryTextSlides(validatedDraft.slides) : undefined;
  const readyVisualSlides = await readReadyVisualSlides(cwd);
  const assetAudit = await auditVisualAssets(cwd);
  const { sanitized, rejected } = sanitizeVisualSelection(selection?.selected ?? {}, readyVisualSlides);
  const approvedCount = validatedDraft.ok
    ? diaryEntry.slides.filter((slide) => validatedDraft.slides[slide.id]?.approved).length
    : 0;
  const readyVariantCount = readyVisualSlides.reduce(
    (total, slide) => total + slide.variants.length,
    0,
  );
  const expectedVariantCount = diaryEntry.slides.length * diaryVisualDirections.length;
  const missingVisuals = diaryEntry.slides.flatMap((slide) => {
    const readySlide = readyVisualSlides.find((item) => item.id === slide.id);

    return diaryVisualDirections
      .filter((direction) => !readySlide?.variants.some((variant) => variant.id === direction.id))
      .map((direction) => ({
        slideId: slide.id,
        variantId: direction.id,
        fileName: `${slide.id}-${direction.id}.png`,
        direction: direction.label,
      }));
  });
  const artifacts = {
    sourceNotes: await exists(path.join(entryDir, 'source-notes.md')),
    draft: await exists(draftFile),
    visualSelection: Boolean(selection),
    generationPlan: await exists(path.join(entryDir, 'generation-plan.json')),
    prompts: await exists(path.join(entryDir, 'prompts')),
    final: await exists(path.join(entryDir, 'final')),
  };
  const allTextApproved = validatedDraft.ok && approvedCount === diaryEntry.slides.length;
  const textFits = Boolean(textAudit?.ok);
  const selectedCount = Object.keys(sanitized).length;

  let phase = 'text';
  let nextAction = 'Выбрать и утвердить текст всех слайдов.';

  if (!validatedDraft.ok) {
    phase = 'text-invalid';
    nextAction = `Исправить draft: ${validatedDraft.errors.join(', ')}`;
  } else if (!textFits) {
    phase = 'text-fit';
    nextAction = `Apply + save line breaks before prompt generation: ${textAudit?.failedCount ?? 0} slide(s).`;
  } else if (!allTextApproved) {
    phase = 'text-approval';
    nextAction = `Утвердить текст: ${approvedCount} / ${diaryEntry.slides.length}.`;
  } else if (!artifacts.generationPlan) {
    phase = 'prompt-plan';
    nextAction = 'Подготовить generation-plan и prompt files.';
  } else if (readyVariantCount < expectedVariantCount) {
    phase = 'visual-generation';
    nextAction = `Догенерить визуалы: ${readyVariantCount} / ${expectedVariantCount}.`;
  } else if (!assetAudit.ok) {
    phase = 'asset-audit';
    nextAction = `Исправить PNG не в 3:4: ${assetAudit.failedCount}.`;
  } else if (selectedCount < diaryEntry.slides.length) {
    phase = 'visual-selection';
    nextAction = `Выбрать визуалы: ${selectedCount} / ${diaryEntry.slides.length}.`;
  } else if (!artifacts.final) {
    phase = 'assembly';
    nextAction = 'Собрать final-папку.';
  } else {
    phase = 'ready';
    nextAction = 'Карусель собрана.';
  }

  return NextResponse.json({
    ok: true,
    entry: diaryEntry.slug,
    phase,
    nextAction,
    readiness: {
      readyForPromptPlan: textFits && allTextApproved,
      readyForImageGeneration: textFits && allTextApproved && artifacts.generationPlan,
      readyForAssembly:
        textFits &&
        allTextApproved &&
        artifacts.generationPlan &&
        readyVariantCount === expectedVariantCount &&
        assetAudit.ok &&
        selectedCount === diaryEntry.slides.length,
      blockedReason: !textFits
        ? `Apply + save line breaks: ${textAudit?.failedCount ?? 0} slide(s).`
        : !allTextApproved
        ? `Утвердить текст: ${approvedCount} / ${diaryEntry.slides.length}.`
        : !artifacts.generationPlan
          ? 'Подготовить generation-plan и prompt files.'
          : readyVariantCount < expectedVariantCount
            ? `Догенерить визуалы: ${readyVariantCount} / ${expectedVariantCount}.`
            : !assetAudit.ok
              ? `Исправить PNG не в 3:4: ${assetAudit.failedCount}.`
              : selectedCount < diaryEntry.slides.length
                ? `Выбрать визуалы: ${selectedCount} / ${diaryEntry.slides.length}.`
                : null,
    },
    text: {
      valid: validatedDraft.ok,
      errors: validatedDraft.errors,
      approvedCount,
      total: diaryEntry.slides.length,
      fits: textFits,
      failedFitCount: textAudit?.failedCount ?? 0,
    },
    visuals: {
      readyVariantCount,
      expectedVariantCount,
      readySlideCount: readyVisualSlides.length,
      missingCount: missingVisuals.length,
      missing: missingVisuals,
      assetAudit: {
        ok: assetAudit.ok,
        failedCount: assetAudit.failedCount,
        failed: assetAudit.failed,
      },
    },
    selection: {
      selected: sanitized,
      rejected,
      selectedCount,
    },
    artifacts,
  });
}
