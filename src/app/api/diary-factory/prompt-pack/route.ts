import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import {
  auditReferenceAssets,
  auditVisualAssets,
  resolveDiaryEntryDir,
} from '@/lib/diaryAssets.server';
import {
  auditDiaryPrompts,
  auditDiaryTextSlides,
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

const toJsonl = (items: unknown[]) => items.map((item) => JSON.stringify(item)).join('\n');

export async function GET(request: Request) {
  const format = new URL(request.url).searchParams.get('format');
  const draft = await readDraft();
  const validated = validateDiaryDraftSlides(draft?.slides);

  if (!validated.ok) {
    return NextResponse.json(
      {
        ok: false,
        entry: diaryEntry.slug,
        writesFiles: false,
        error: `Fix text first: ${validated.errors.join(', ')}`,
      },
      { status: 400 },
    );
  }

  const [assetAudit, referenceAudit] = await Promise.all([
    auditVisualAssets(),
    auditReferenceAssets(),
  ]);
  const textAudit = auditDiaryTextSlides(validated.slides);
  const promptSlides = buildDiaryPromptPack(validated.slides);
  const approvedCount = diaryEntry.slides.filter(
    (slide) => validated.slides[slide.id]?.approved,
  ).length;
  const allApproved = approvedCount === diaryEntry.slides.length;
  const promptAudit = auditDiaryPrompts(
    promptSlides.flatMap((slide) => slide.variants.map((variant) => variant.prompt)),
  );
  const readyForPromptUse = allApproved && textAudit.ok && referenceAudit.ok && promptAudit.ok;
  const blockedReason = !allApproved
    ? `Approve text first: ${approvedCount} / ${diaryEntry.slides.length}.`
    : !textAudit.ok
      ? `Apply + save line breaks first: ${textAudit.failedCount} slide(s).`
      : !referenceAudit.ok
        ? `Restore Frogface reference assets first: ${referenceAudit.failedCount} missing/invalid reference(s).`
        : !promptAudit.ok
          ? `Fix prompt contract first: ${promptAudit.failed.length} failed check(s).`
          : null;

  const items = promptSlides.flatMap((slide) =>
    slide.variants.map((variant) => {
      const auditItem = assetAudit.items.find(
        (item) => item.slideId === slide.id && item.variantId === variant.id,
      );
      const visualState = !auditItem?.ready ? 'missing' : auditItem.ok ? 'ready' : 'invalid';

      return {
        entry: diaryEntry.slug,
        slideId: slide.id,
        slideIndex: slide.index,
        variantId: variant.id,
        label: variant.label,
        heading: slide.heading,
        text: slide.text,
        outputFile: variant.outputFile,
        promptFile: variant.promptFile,
        visualState,
        issue: auditItem?.issue,
        dimensions: auditItem?.width && auditItem.height
          ? {
              width: auditItem.width,
              height: auditItem.height,
              aspectRatio: auditItem.aspectRatio,
            }
          : undefined,
        prompt: readyForPromptUse ? variant.prompt : undefined,
      };
    }),
  );

  const payload = {
    ok: true,
    entry: diaryEntry.slug,
    writesFiles: false,
    status: readyForPromptUse ? 'ready' : 'blocked',
    readyForPromptUse,
    blockedReason,
    approvedCount,
    totalSlides: diaryEntry.slides.length,
    promptCount: readyForPromptUse ? items.length : 0,
    slotCount: items.length,
    promptBodyIncluded: readyForPromptUse,
    visualContract: {
      format: diaryVisualContract.format,
      outputSize: diaryVisualContract.outputSize,
      palette: diaryVisualContract.palette,
      requiredRules: diaryVisualContract.requiredRules,
      forbiddenRules: diaryVisualContract.forbiddenRules,
      characterLock: diaryVisualContract.characterLock,
      references: diaryVisualContract.references,
    },
    audit: {
      text: textAudit,
      references: referenceAudit,
      prompts: promptAudit,
      assets: {
        ok: assetAudit.ok,
        readyCount: assetAudit.readyCount,
        expectedCount: assetAudit.expectedCount,
        failedCount: assetAudit.failedCount,
      },
    },
    api: {
      jsonl: '/api/diary-factory/prompt-pack?format=jsonl',
      prompts: '/api/diary-factory/prompts',
      generationQueue: '/api/diary-factory/generation-queue',
      generationBrief: '/api/diary-factory/generation-brief',
      visualContract: '/api/diary-factory/visual-contract',
      assetIntakeBatch: '/api/diary-factory/asset-intake-batch',
    },
    items,
  };

  if (format === 'jsonl') {
    if (!readyForPromptUse) {
      return NextResponse.json(payload, { status: 409 });
    }

    return new NextResponse(toJsonl(items), {
      status: 200,
      headers: {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Content-Disposition': `attachment; filename="frogface-diary-${diaryEntry.slug}-prompt-pack.jsonl"`,
      },
    });
  }

  return NextResponse.json(payload);
}
