import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import {
  auditReferenceAssets,
  auditVisualAssets,
  readReadyVisualSlides,
  resolveDiaryEntryDir,
  sanitizeVisualSelection,
} from '@/lib/diaryAssets.server';
import {
  auditDiaryPrompts,
  auditDiaryTextSlides,
  buildDiaryPromptPack,
  diaryEntry,
  diaryTextLimits,
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

type Gate = {
  id: string;
  label: string;
  ok: boolean;
  required: boolean;
  evidence: string;
  nextAction?: string;
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
  const sourceNotes = await readText(path.join(entryDir, 'source-notes.md'));
  const draft = await readJson<DraftPayload>(path.join(entryDir, 'draft.json'));
  const selection = await readJson<SelectionPayload>(path.join(entryDir, 'visual-selection.json'));
  const validatedDraft = validateDiaryDraftSlides(draft?.slides);
  const textAudit = validatedDraft.ok ? auditDiaryTextSlides(validatedDraft.slides) : undefined;
  const textFit = validatedDraft.ok ? suggestDiaryTextFit(validatedDraft.slides) : undefined;
  const promptAudit = validatedDraft.ok
    ? auditDiaryPrompts(
        buildDiaryPromptPack(validatedDraft.slides).flatMap((slide) =>
          slide.variants.map((variant) => variant.prompt),
        ),
      )
    : undefined;
  const readyVisualSlides = await readReadyVisualSlides(cwd);
  const assetAudit = await auditVisualAssets(cwd);
  const referenceAudit = await auditReferenceAssets(cwd);
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
  const readyVariantCount = readyVisualSlides.reduce(
    (total, slide) => total + slide.variants.length,
    0,
  );
  const expectedVariantCount = diaryEntry.slides.length * diaryVisualDirections.length;
  const selectedCount = Object.keys(selected).length;
  const allTextApproved = validatedDraft.ok && approvedCount === diaryEntry.slides.length;

  const gates: Gate[] = [
    {
      id: 'source-notes',
      label: 'Daily source notes exist',
      ok: artifacts.sourceNotes && sourceNotes.trim().length > 0,
      required: true,
      evidence: `${sourceNotes.trim().length} chars in source-notes.md`,
      nextAction: 'Add Boss voice notes and agent notes to source-notes.md.',
    },
    {
      id: 'draft-valid',
      label: 'Draft JSON is valid',
      ok: validatedDraft.ok,
      required: true,
      evidence: validatedDraft.ok
        ? `draft.json validates against ${diaryEntry.slides.length} diary slides`
        : validatedDraft.errors.join(', '),
      nextAction: 'Fix missing headings/text in draft.json.',
    },
    {
      id: 'text-fit',
      label: 'Text fits readable slide limits',
      ok: Boolean(textAudit?.ok),
      required: true,
      evidence: textAudit && textFit
        ? `current draft: ${textAudit.failedCount} failed; after suggestions: ${textFit.auditAfter.failedCount}; line limit ${diaryTextLimits.maxLineLength}`
        : 'text-fit unavailable until draft is valid',
      nextAction: 'Apply + save suggested line breaks or manually shorten long lines.',
    },
    {
      id: 'reference-assets',
      label: 'Canonical Frogface references are available',
      ok: referenceAudit.ok,
      required: true,
      evidence: `${referenceAudit.readyCount} / ${referenceAudit.expectedCount} reference PNGs ready`,
      nextAction: 'Restore the present-day Frogface reference PNG files before generation.',
    },
    {
      id: 'prompt-contract',
      label: 'Prompt contract keeps visual rules intact',
      ok: Boolean(promptAudit?.ok),
      required: true,
      evidence: promptAudit
        ? `${promptAudit.failed.length} failed prompt contract checks; ${promptAudit.checks.length} rules checked`
        : 'prompt audit unavailable until draft is valid',
      nextAction: 'Fix buildDiaryPrompt rules before preparing prompt files.',
    },
    {
      id: 'text-approved',
      label: 'All slide text approved',
      ok: allTextApproved,
      required: true,
      evidence: `${approvedCount} / ${diaryEntry.slides.length} slides approved`,
      nextAction: 'Approve every slide text on /diary-factory and save draft.json.',
    },
    {
      id: 'generation-plan',
      label: 'Generation plan and prompt files prepared',
      ok: artifacts.generationPlan && artifacts.prompts,
      required: true,
      evidence: `generation-plan.json=${artifacts.generationPlan}; prompts=${artifacts.prompts}`,
      nextAction: 'After text approval, click Prepare prompts.',
    },
    {
      id: 'visual-assets',
      label: 'All visual variants present',
      ok: readyVariantCount === expectedVariantCount,
      required: true,
      evidence: `${readyVariantCount} / ${expectedVariantCount} PNG variants ready`,
      nextAction: 'Generate or intake missing PNG variants.',
    },
    {
      id: 'asset-audit',
      label: 'All ready PNG files are valid 3:4',
      ok: assetAudit.ok && readyVariantCount === expectedVariantCount,
      required: true,
      evidence: `${assetAudit.failedCount} invalid ready PNG; ${assetAudit.readyCount} / ${assetAudit.expectedCount} ready`,
      nextAction: 'Regenerate or replace invalid PNG files through asset intake.',
    },
    {
      id: 'visual-selection',
      label: 'One visual selected per slide',
      ok: selectedCount === diaryEntry.slides.length && Object.keys(rejected).length === 0,
      required: true,
      evidence: `${selectedCount} / ${diaryEntry.slides.length} selected; rejected=${Object.keys(rejected).length}`,
      nextAction: 'Select one approved visual variant per slide and save selection.',
    },
    {
      id: 'final-assembly',
      label: 'Final carousel folder assembled',
      ok: artifacts.final,
      required: true,
      evidence: `final=${artifacts.final}`,
      nextAction: 'Assemble the final carousel after text, assets, audit, and selection are complete.',
    },
  ];
  const failedRequired = gates.filter((gate) => gate.required && !gate.ok);

  return NextResponse.json({
    ok: true,
    entry: diaryEntry.slug,
    generatedAt: new Date().toISOString(),
    writesFiles: false,
    complete: failedRequired.length === 0,
    currentGate: failedRequired[0] ?? null,
    gates,
    counts: {
      approvedText: approvedCount,
      totalSlides: diaryEntry.slides.length,
      readyVariants: readyVariantCount,
      expectedVariants: expectedVariantCount,
      selectedSlides: selectedCount,
      invalidAssets: assetAudit.failedCount,
      readyReferences: referenceAudit.readyCount,
      expectedReferences: referenceAudit.expectedCount,
      promptContractFailures: promptAudit?.failed.length ?? 0,
    },
    artifacts,
    api: {
      factory: '/diary-factory',
      storyboard: '/api/diary-factory/storyboard',
      approvalSheet: '/api/diary-factory/approval-sheet',
      approvalCheckpoint: '/api/diary-factory/approval-checkpoint',
      textVariants: '/api/diary-factory/text-variants',
      reviewPacket: '/api/diary-factory/review-packet',
      visualContract: '/api/diary-factory/visual-contract',
      referenceAudit: '/api/diary-factory/reference-audit',
      promptPack: '/api/diary-factory/prompt-pack',
      promptPackJsonl: '/api/diary-factory/prompt-pack?format=jsonl',
      generationPlanPreview: '/api/diary-factory/generation-plan-preview',
      assetIntake: '/api/diary-factory/asset-intake',
      assetIntakeBatch: '/api/diary-factory/asset-intake-batch',
      visualBoard: '/api/diary-factory/visual-board',
      productionManifest: '/api/diary-factory/production-manifest',
      productionManifestCsv: '/api/diary-factory/production-manifest?format=csv',
      finalExport: '/api/diary-factory/final-export',
      status: '/api/diary-factory/status',
    },
  });
}
