import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import {
  aspectTolerance,
  expectedAspectRatio,
  isExpectedDiaryAspect,
  readPngDimensionsFromBuffer,
  resolveDiaryEntryDir,
} from '@/lib/diaryAssets.server';
import { diaryEntry, diaryVisualContract, diaryVisualDirections } from '@/lib/diaryFactory';

export const dynamic = 'force-dynamic';

type IntakeSavedFile = {
  fieldName: string;
  originalName: string;
  slideId: string;
  slideIndex: number;
  variantId: string;
  direction: string;
  fileName: string;
  publicPath: string;
  outputFile: string;
  dimensions: {
    width: number;
    height: number;
    aspectRatio: number;
    expectedAspectRatio: number;
    aspectTolerance: number;
  };
};

type IntakeRejectedFile = {
  fieldName: string;
  originalName: string;
  fileName?: string;
  error: string;
  dimensions?: {
    width: number;
    height: number;
    aspectRatio: number;
    expectedAspectRatio: number;
    aspectTolerance: number;
  };
};

const normalizeUploadName = (fileName: string) => fileName.split(/[\\/]/).pop()?.trim() ?? '';

const findSlotByFileName = (fileName: string) => {
  const match = fileName.match(/^(slide-\d{2})-([a-d])\.png$/i);
  if (!match) return undefined;

  const slideId = match[1].toLowerCase();
  const variantId = match[2].toLowerCase();
  const slide = diaryEntry.slides.find((item) => item.id === slideId);
  const direction = diaryVisualDirections.find((item) => item.id === variantId);

  if (!slide || !direction) return undefined;

  return {
    slide,
    direction,
    fileName: `${slide.id}-${direction.id}.png`,
  };
};

const expectedSlots = () =>
  diaryEntry.slides.flatMap((slide) =>
    diaryVisualDirections.map((direction) => ({
      slideId: slide.id,
      variantId: direction.id,
      fileName: `${slide.id}-${direction.id}.png`,
      outputFile: `public/diary/${diaryEntry.slug}/variants/${slide.id}-${direction.id}.png`,
    })),
  );

const fileDimensionsPayload = (width: number, height: number) => ({
  width,
  height,
  aspectRatio: Number((width / height).toFixed(4)),
  expectedAspectRatio,
  aspectTolerance,
});

export async function GET() {
  return NextResponse.json({
    ok: true,
    entry: diaryEntry.slug,
    writesFiles: false,
    method: 'POST multipart/form-data',
    fields: {
      files: `One or more PNG files. File names must match slide-01-a.png ... slide-${String(
        diaryEntry.slides.length,
      ).padStart(2, '0')}-d.png.`,
    },
    naming: {
      pattern: 'slide-XX-[a-d].png',
      examples: [
        'slide-01-a.png',
        `slide-${String(Math.max(1, Math.ceil(diaryEntry.slides.length / 2))).padStart(2, '0')}-c.png`,
        `slide-${String(diaryEntry.slides.length).padStart(2, '0')}-d.png`,
      ],
      canonicalizedOnSave: true,
    },
    expectedAspectRatio,
    aspectTolerance,
    contract: diaryVisualContract,
    slots: expectedSlots(),
  });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const uploads = Array.from(formData.entries())
    .filter((entry): entry is [string, File] => entry[1] instanceof File)
    .map(([fieldName, file]) => ({ fieldName, file }));

  if (uploads.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Missing files. Upload one or more PNG files as multipart file fields.',
      },
      { status: 400 },
    );
  }

  const entryDir = await resolveDiaryEntryDir();
  const variantDir = path.join(entryDir, 'variants');
  const saved: IntakeSavedFile[] = [];
  const rejected: IntakeRejectedFile[] = [];
  const seenSlots = new Set<string>();

  await mkdir(variantDir, { recursive: true });

  for (const { fieldName, file } of uploads) {
    const originalName = file.name;
    const normalizedName = normalizeUploadName(originalName);
    const slot = findSlotByFileName(normalizedName);

    if (!slot) {
      rejected.push({
        fieldName,
        originalName,
        fileName: normalizedName || undefined,
        error: `Invalid file name. Use slide-01-a.png ... slide-${String(
          diaryEntry.slides.length,
        ).padStart(2, '0')}-d.png.`,
      });
      continue;
    }

    if (seenSlots.has(slot.fileName)) {
      rejected.push({
        fieldName,
        originalName,
        fileName: normalizedName,
        error: `Duplicate slot in this batch: ${slot.fileName}.`,
      });
      continue;
    }
    seenSlots.add(slot.fileName);

    const buffer = Buffer.from(await file.arrayBuffer());

    let dimensions: { width: number; height: number };
    try {
      dimensions = readPngDimensionsFromBuffer(buffer);
    } catch (error) {
      rejected.push({
        fieldName,
        originalName,
        fileName: normalizedName,
        error: error instanceof Error ? error.message : 'Could not read PNG dimensions.',
      });
      continue;
    }

    const aspectOk = isExpectedDiaryAspect(dimensions.width, dimensions.height);
    const dimensionPayload = fileDimensionsPayload(dimensions.width, dimensions.height);

    if (!aspectOk) {
      rejected.push({
        fieldName,
        originalName,
        fileName: normalizedName,
        error: `Expected 3:4 PNG, got ${dimensions.width}x${dimensions.height}.`,
        dimensions: dimensionPayload,
      });
      continue;
    }

    const outputPath = path.join(variantDir, slot.fileName);
    await writeFile(outputPath, buffer);

    saved.push({
      fieldName,
      originalName,
      slideId: slot.slide.id,
      slideIndex: slot.slide.index,
      variantId: slot.direction.id,
      direction: slot.direction.label,
      fileName: slot.fileName,
      publicPath: `/diary/${diaryEntry.slug}/variants/${slot.fileName}`,
      outputFile: `public/diary/${diaryEntry.slug}/variants/${slot.fileName}`,
      dimensions: dimensionPayload,
    });
  }

  const status = saved.length === 0 && rejected.length > 0 ? 422 : rejected.length > 0 ? 207 : 200;

  return NextResponse.json(
    {
      ok: saved.length > 0 && rejected.length === 0,
      entry: diaryEntry.slug,
      writesFiles: saved.length > 0,
      savedCount: saved.length,
      rejectedCount: rejected.length,
      saved,
      rejected,
    },
    { status },
  );
}
