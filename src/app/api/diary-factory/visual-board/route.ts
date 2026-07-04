import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import {
  auditVisualAssets,
  readReadyVisualSlides,
  resolveDiaryEntryDir,
  sanitizeVisualSelection,
} from '@/lib/diaryAssets.server';
import { diaryEntry, diaryVisualDirections } from '@/lib/diaryFactory';

export const dynamic = 'force-dynamic';

type SelectionPayload = {
  selected?: Record<string, string>;
};

const readSelection = async (entryDir: string): Promise<SelectionPayload | undefined> => {
  try {
    const raw = await readFile(path.join(entryDir, 'visual-selection.json'), 'utf8');
    return JSON.parse(raw.replace(/^\uFEFF/, '')) as SelectionPayload;
  } catch {
    return undefined;
  }
};

export async function GET() {
  const cwd = process.cwd();
  const entryDir = await resolveDiaryEntryDir(cwd);
  const [assetAudit, readySlides, selection] = await Promise.all([
    auditVisualAssets(cwd),
    readReadyVisualSlides(cwd),
    readSelection(entryDir),
  ]);
  const { sanitized, rejected } = sanitizeVisualSelection(
    selection?.selected ?? {},
    readySlides,
  );
  const slides = diaryEntry.slides.map((slide) => {
    const selectedVariantId = sanitized[slide.id];
    const variants = diaryVisualDirections.map((direction) => {
      const auditItem = assetAudit.items.find(
        (item) => item.slideId === slide.id && item.variantId === direction.id,
      );
      const state = !auditItem?.ready ? 'missing' : auditItem.ok ? 'ready' : 'invalid';

      return {
        id: direction.id,
        label: direction.label,
        description: direction.description,
        fileName: auditItem?.fileName ?? `${slide.id}-${direction.id}.png`,
        publicPath: auditItem?.publicPath,
        state,
        ready: Boolean(auditItem?.ready),
        valid: Boolean(auditItem?.ok),
        selectable: Boolean(auditItem?.ok),
        selected: selectedVariantId === direction.id,
        width: auditItem?.width,
        height: auditItem?.height,
        aspectRatio: auditItem?.aspectRatio,
        issue: auditItem?.issue,
      };
    });
    const selectedVariant = variants.find((variant) => variant.selected);

    return {
      id: slide.id,
      index: slide.index,
      title: slide.title,
      selectedVariantId,
      selectedOk: Boolean(selectedVariant?.valid),
      variants,
    };
  });
  const expectedVariantCount = diaryEntry.slides.length * diaryVisualDirections.length;
  const validVariantCount = assetAudit.items.filter((item) => item.ok).length;
  const selectedOkCount = slides.filter((slide) => slide.selectedOk).length;
  const allVariantsPresent = assetAudit.readyCount === expectedVariantCount;
  const allVariantsValid = assetAudit.ok && allVariantsPresent;
  const oneSelectionPerSlide = selectedOkCount === diaryEntry.slides.length;

  return NextResponse.json({
    ok: true,
    entry: diaryEntry.slug,
    writesFiles: false,
    summary: {
      readyVariantCount: assetAudit.readyCount,
      validVariantCount,
      expectedVariantCount,
      missingCount: assetAudit.items.filter((item) => !item.ready).length,
      invalidCount: assetAudit.failedCount,
      selectedCount: Object.keys(sanitized).length,
      selectedOkCount,
      rejectedSelectionCount: Object.keys(rejected).length,
      allVariantsPresent,
      allVariantsValid,
      oneSelectionPerSlide,
      readyForFinalVisualAssembly: allVariantsValid && oneSelectionPerSlide,
    },
    slides,
    rejected,
    nextAction: !allVariantsPresent
      ? `Generate or intake missing PNG variants: ${assetAudit.readyCount} / ${expectedVariantCount}.`
      : !allVariantsValid
        ? `Replace invalid PNG variants: ${assetAudit.failedCount}.`
        : !oneSelectionPerSlide
          ? `Select one valid visual per slide: ${selectedOkCount} / ${diaryEntry.slides.length}.`
          : 'Visual board is ready for final assembly after text and other gates are complete.',
    api: {
      assets: '/api/diary-factory/assets',
      assetAudit: '/api/diary-factory/asset-audit',
      assetIntake: '/api/diary-factory/asset-intake',
      assetIntakeBatch: '/api/diary-factory/asset-intake-batch',
      productionManifest: '/api/diary-factory/production-manifest',
      selection: '/api/diary-factory/selection',
      assemble: '/api/diary-factory/assemble',
      health: '/api/diary-factory/health',
    },
  });
}
