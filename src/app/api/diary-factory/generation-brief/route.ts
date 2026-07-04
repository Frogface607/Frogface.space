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

const fence = (value: string) => `\`\`\`text\n${value.replaceAll('```', "'''")}\n\`\`\``;

export async function GET() {
  const draft = await readDraft();
  const validated = validateDiaryDraftSlides(draft?.slides);

  if (!validated.ok) {
    return new NextResponse(`# Diary Generation Brief - ${diaryEntry.slug}

Status: text draft is invalid.

Errors:

${validated.errors.map((error) => `- ${error}`).join('\n')}
`, {
      status: 400,
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
  }

  const readySlides = await readReadyVisualSlides();
  const assetAudit = await auditVisualAssets();
  const referenceAudit = await auditReferenceAssets();
  const textAudit = auditDiaryTextSlides(validated.slides);
  const promptSlides = buildDiaryPromptPack(validated.slides);
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
          prompt: variant.prompt,
          reason: auditItem?.ready ? 'regenerate invalid asset' : 'generate missing asset',
          issue: auditItem?.issue,
        };
      })
      .filter((variant) => {
        const auditItem = assetAudit.items.find(
          (item) => item.slideId === slide.id && item.variantId === variant.variantId,
        );

        return !auditItem?.ok;
      }),
  );
  const approvedCount = diaryEntry.slides.filter(
    (slide) => validated.slides[slide.id]?.approved,
  ).length;
  const allApproved = approvedCount === diaryEntry.slides.length;
  const promptAudit = auditDiaryPrompts(
    promptSlides.flatMap((slide) => slide.variants.map((variant) => variant.prompt)),
  );
  const promptReady = allApproved && textAudit.ok && referenceAudit.ok && promptAudit.ok;
  const blockReason = !textAudit.ok
    ? `Apply + save line breaks first: ${textAudit.failedCount} slide(s).`
    : !referenceAudit.ok
      ? `Restore Frogface reference assets first: ${referenceAudit.failedCount} missing/invalid reference(s).`
    : !promptAudit.ok
      ? `Fix prompt contract first: ${promptAudit.failed.length} failed check(s).`
    : !allApproved
      ? `Approve all slide text first: ${approvedCount} / ${diaryEntry.slides.length}.`
      : null;
  const readyVariantCount = promptSlides.reduce(
    (total, slide) =>
      total +
      slide.variants.filter((variant) =>
        readySlides
          .find((readySlide) => readySlide.id === slide.id)
          ?.variants.some((ready) => ready.id === variant.id),
      ).length,
    0,
  );
  const expectedVariantCount = promptSlides.reduce(
    (total, slide) => total + slide.variants.length,
    0,
  );

  const brief = `# Diary Generation Brief - ${diaryEntry.slug}

Status: ${promptReady ? 'ready for prompt preview' : 'blocked'}.
This endpoint writes no files and generates no images.
${blockReason ? `\nDo not generate images from this brief yet. ${blockReason}\n` : ''}

## Current State

- Text approved: ${approvedCount} / ${diaryEntry.slides.length}
- Text fits current draft: ${textAudit.ok ? 'yes' : `no (${textAudit.failedCount} slide(s))`}
- Frogface references ready: ${referenceAudit.ok ? 'yes' : `no (${referenceAudit.failedCount} missing/invalid)`}
- Ready for image generation: ${promptReady ? 'yes' : 'no'}
- Visual variants ready: ${readyVariantCount} / ${expectedVariantCount}
- Generation/regeneration tasks: ${queue.length}
- Missing PNG files: ${assetAudit.items.filter((item) => !item.ready).length}
- Invalid ready PNG files: ${assetAudit.failedCount}
- Prompt contract audit: ${promptAudit.ok ? 'OK' : `FAILED (${promptAudit.failed.length})`}

## Visual Rules

- Format: 3:4 portrait, Instagram carousel friendly.
- Accent: red, not orange.
- Tape/plaster strips: not a repeating motif.
- Tower/skyscraper imagery: omit.
- Frogface: optional per slide; if present, use the present-day etalon.
- Text: exact Russian Cyrillic, large and readable, no extra readable words.
- Full visual contract: /api/diary-factory/visual-contract
- Reference audit: /api/diary-factory/reference-audit

## Frogface Reference Images

${diaryVisualContract.references
    .map((reference) => `- ${reference.path} - ${reference.use}`)
    .join('\n')}

## Output Naming

Place generated PNG files under:

${fence(`public/diary/${diaryEntry.slug}/variants/<output file name>`)}

Expected names follow \`slide-01-a.png\` ... \`slide-${String(diaryEntry.slides.length).padStart(2, '0')}-d.png\`.

## Generation / Regeneration Queue

${promptReady
    ? queue
        .map(
          (item, index) => `### ${index + 1}. ${item.outputFile}

- Slide: ${item.slideId}
- Variant: ${item.variantId.toUpperCase()} / ${item.label}
- Reason: ${item.reason}${item.issue ? ` (${item.issue})` : ''}
- Prompt file if persisted later: ${item.promptFile}
- Heading: ${item.heading}

${fence(item.prompt)}
`,
        )
        .join('\n')
    : queue
        .map(
          (item, index) => `### ${index + 1}. ${item.outputFile}

- Slide: ${item.slideId}
- Variant: ${item.variantId.toUpperCase()} / ${item.label}
- Reason: blocked - ${blockReason}
- Heading: ${item.heading}
`,
        )
        .join('\n')}
`;

  return new NextResponse(brief, {
    status: 200,
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
