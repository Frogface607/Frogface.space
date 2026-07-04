import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import {
  auditVisualAssets,
  resolveDiaryEntryDir,
  sanitizeVisualSelection,
} from '@/lib/diaryAssets.server';
import {
  buildDiaryPromptPack,
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

type SelectionPayload = {
  selected?: Record<string, string>;
};

const readJson = async <T,>(filePath: string): Promise<T | undefined> => {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw.replace(/^\uFEFF/, '')) as T;
  } catch {
    return undefined;
  }
};

const csvEscape = (value: unknown) => {
  const stringValue = value === undefined || value === null ? '' : String(value);

  return /[",\n]/.test(stringValue) ? `"${stringValue.replaceAll('"', '""')}"` : stringValue;
};

const toCsv = (items: Array<Record<string, unknown>>) => {
  const headers = [
    'entry',
    'slideId',
    'slideIndex',
    'variantId',
    'label',
    'fileName',
    'outputFile',
    'promptFile',
    'state',
    'selected',
    'selectable',
    'width',
    'height',
    'aspectRatio',
    'issue',
  ];
  const rows = items.map((item) => headers.map((header) => csvEscape(item[header])).join(','));

  return [headers.join(','), ...rows].join('\n');
};

export async function GET(request: Request) {
  const format = new URL(request.url).searchParams.get('format');
  const entryDir = await resolveDiaryEntryDir();
  const [draft, selection, assetAudit] = await Promise.all([
    readJson<DraftPayload>(path.join(entryDir, 'draft.json')),
    readJson<SelectionPayload>(path.join(entryDir, 'visual-selection.json')),
    auditVisualAssets(),
  ]);
  const validated = validateDiaryDraftSlides(draft?.slides);
  const approvedCount = validated.ok
    ? diaryEntry.slides.filter((slide) => validated.slides[slide.id]?.approved).length
    : 0;
  const allTextApproved = validated.ok && approvedCount === diaryEntry.slides.length;
  const promptSlides = validated.ok ? buildDiaryPromptPack(validated.slides) : [];
  const readySlides = diaryEntry.slides.map((slide) => ({
    id: slide.id,
    index: slide.index,
    variants: assetAudit.items
      .filter((item) => item.slideId === slide.id && item.ok)
      .map((item) => ({
        id: item.variantId,
        fileName: item.fileName,
      })),
  }));
  const { sanitized: selected, rejected } = sanitizeVisualSelection(
    selection?.selected ?? {},
    readySlides,
  );

  const items = diaryEntry.slides.flatMap((slide) =>
    diaryVisualDirections.map((direction) => {
      const fileBase = `${slide.id}-${direction.id}`;
      const auditItem = assetAudit.items.find(
        (item) => item.slideId === slide.id && item.variantId === direction.id,
      );
      const promptSlide = promptSlides.find((item) => item.id === slide.id);
      const promptVariant = promptSlide?.variants.find((item) => item.id === direction.id);
      const state = !auditItem?.ready ? 'missing' : auditItem.ok ? 'ready' : 'invalid';

      return {
        entry: diaryEntry.slug,
        slideId: slide.id,
        slideIndex: slide.index,
        slideTitle: slide.title,
        variantId: direction.id,
        label: direction.label,
        direction: direction.description,
        fileName: auditItem?.fileName ?? `${fileBase}.png`,
        outputFile: promptVariant?.outputFile ?? `variants/${fileBase}.png`,
        promptFile: promptVariant?.promptFile ?? `prompts/${fileBase}.prompt.txt`,
        publicPath: auditItem?.publicPath,
        state,
        ready: Boolean(auditItem?.ready),
        valid: Boolean(auditItem?.ok),
        selectable: Boolean(auditItem?.ok),
        selected: selected[slide.id] === direction.id,
        width: auditItem?.width,
        height: auditItem?.height,
        aspectRatio: auditItem?.aspectRatio,
        issue: auditItem?.issue,
      };
    }),
  );
  const summary = {
    entry: diaryEntry.slug,
    writesFiles: false,
    textApproved: allTextApproved,
    approvedCount,
    totalSlides: diaryEntry.slides.length,
    readyVariantCount: assetAudit.readyCount,
    validVariantCount: assetAudit.items.filter((item) => item.ok).length,
    expectedVariantCount: items.length,
    missingCount: items.filter((item) => item.state === 'missing').length,
    invalidCount: items.filter((item) => item.state === 'invalid').length,
    selectedCount: Object.keys(selected).length,
    rejectedSelectionCount: Object.keys(rejected).length,
    readyForVisualSelection:
      assetAudit.readyCount === items.length &&
      assetAudit.failedCount === 0 &&
      Object.keys(rejected).length === 0,
  };
  const payload = {
    ok: true,
    ...summary,
    purpose: 'Canonical production manifest for generating, checking, uploading, and selecting the 32 diary visual variants.',
    rules: {
      format: diaryVisualContract.format,
      outputSize: diaryVisualContract.outputSize,
      outputDir: diaryVisualContract.outputDir,
      requiredRules: diaryVisualContract.requiredRules,
      forbiddenRules: diaryVisualContract.forbiddenRules,
      characterLock: diaryVisualContract.characterLock,
    },
    api: {
      csv: '/api/diary-factory/production-manifest?format=csv',
      approvalCheckpoint: '/api/diary-factory/approval-checkpoint',
      promptPack: '/api/diary-factory/prompt-pack',
      promptPackJsonl: '/api/diary-factory/prompt-pack?format=jsonl',
      assetIntakeBatch: '/api/diary-factory/asset-intake-batch',
      visualBoard: '/api/diary-factory/visual-board',
      selection: '/api/diary-factory/selection',
    },
    uploadInstructions: {
      fileNamePattern: 'slide-XX-[a-d].png',
      multipartEndpoint: '/api/diary-factory/asset-intake-batch',
      fieldName: 'files',
      accepts: 'PNG files only, exact 3:4 portrait ratio',
    },
    rejected,
    items,
  };

  if (format === 'csv') {
    return new NextResponse(toCsv(items), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="frogface-diary-${diaryEntry.slug}-production-manifest.csv"`,
      },
    });
  }

  return NextResponse.json(payload);
}
