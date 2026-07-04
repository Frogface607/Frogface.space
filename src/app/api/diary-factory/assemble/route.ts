import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import {
  auditVisualAssets,
  readReadyVisualSlides,
  resolveDiaryEntryDir,
} from '@/lib/diaryAssets.server';
import { diaryEntry, diaryVisualDirections } from '@/lib/diaryFactory';

type AssembleRequest = {
  selected?: Record<string, string>;
};

type DraftSlide = {
  heading: string;
  text: string;
  variantId?: string;
  approved: boolean;
};

type DraftPayload = {
  slides?: Record<string, DraftSlide>;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as AssembleRequest;
  const selected = body.selected ?? {};
  const cwd = process.cwd();
  const entryDir = await resolveDiaryEntryDir(cwd);
  const visualSlides = await readReadyVisualSlides(cwd);
  const assetAudit = await auditVisualAssets(cwd);
  const draftFile = path.join(entryDir, 'draft.json');
  const expectedVariantCount = diaryEntry.slides.length * diaryVisualDirections.length;
  const readyVariantCount = visualSlides.reduce(
    (total, slide) => total + slide.variants.length,
    0,
  );

  let draft: DraftPayload;
  try {
    const raw = await readFile(draftFile, 'utf8');
    draft = JSON.parse(raw.replace(/^\uFEFF/, '')) as DraftPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Save and approve text draft before assembling.' },
      { status: 400 },
    );
  }

  const unapproved = diaryEntry.slides
    .filter((slide) => !draft.slides?.[slide.id]?.approved)
    .map((slide) => slide.id);

  if (unapproved.length > 0) {
    return NextResponse.json(
      { ok: false, error: `Approve text first: ${unapproved.join(', ')}` },
      { status: 400 },
    );
  }

  if (readyVariantCount < expectedVariantCount) {
    const missingSlots = diaryEntry.slides.flatMap((slide) => {
      const readySlide = visualSlides.find((item) => item.id === slide.id);

      return diaryVisualDirections
        .filter((direction) => !readySlide?.variants.some((variant) => variant.id === direction.id))
        .map((direction) => `${slide.id}-${direction.id}.png`);
    });

    return NextResponse.json(
      {
        ok: false,
        error: `Generate all visual variants first: ${readyVariantCount} / ${expectedVariantCount}. Missing: ${missingSlots
          .slice(0, 8)
          .join(', ')}${missingSlots.length > 8 ? '...' : ''}`,
      },
      { status: 400 },
    );
  }

  if (!assetAudit.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `Fix visual asset format first: ${assetAudit.failed
          .map((item) => `${item.fileName} (${item.width}x${item.height})`)
          .join(', ')}`,
      },
      { status: 400 },
    );
  }

  const missing = diaryEntry.slides.filter((slide) => !selected[slide.id]).map((slide) => slide.id);

  if (missing.length > 0) {
    return NextResponse.json(
      { ok: false, error: `Missing selection for: ${missing.join(', ')}` },
      { status: 400 },
    );
  }

  const finalDir = path.join(entryDir, 'final');
  await mkdir(finalDir, { recursive: true });

  const assembled = [];

  for (const diarySlide of diaryEntry.slides) {
    const readySlide = visualSlides.find((slide) => slide.id === diarySlide.id);
    const variantId = selected[diarySlide.id];
    const variant = readySlide?.variants.find((item) => item.id === variantId);

    if (!variant) {
      return NextResponse.json(
        { ok: false, error: `Unknown variant "${variantId}" for ${diarySlide.id}` },
        { status: 400 },
      );
    }

    const outputName = `${String(diarySlide.index).padStart(2, '0')}.png`;
    const sourcePath = path.join(entryDir, 'variants', variant.fileName);
    const outputPath = path.join(finalDir, outputName);

    await copyFile(sourcePath, outputPath);
    assembled.push({
      slide: diarySlide.id,
      variant: variant.id,
      file: `/diary/${diaryEntry.slug}/final/${outputName}`,
    });
  }

  const selection = {
    entry: diaryEntry.slug,
    assembledAt: new Date().toISOString(),
    selected,
    files: assembled,
  };
  const approvedScript = {
    entry: diaryEntry.slug,
    approvedAt: new Date().toISOString(),
    slides: diaryEntry.slides.map((slide) => ({
      id: slide.id,
      index: slide.index,
      heading: draft.slides?.[slide.id]?.heading,
      text: draft.slides?.[slide.id]?.text,
    })),
  };
  const caption = approvedScript.slides
    .map((slide) => `${slide.heading}\n${slide.text}`)
    .join('\n\n');

  await writeFile(
    path.join(finalDir, 'selection.json'),
    JSON.stringify(selection, null, 2),
    'utf8',
  );
  await writeFile(
    path.join(finalDir, 'approved-script.json'),
    JSON.stringify(approvedScript, null, 2),
    'utf8',
  );
  await writeFile(path.join(finalDir, 'caption.txt'), caption, 'utf8');

  return NextResponse.json({
    ok: true,
    finalDir: `/diary/${diaryEntry.slug}/final`,
    files: assembled,
  });
}
