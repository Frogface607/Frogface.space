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

const findSlot = (slideId: string, variantId: string) => {
  const slide = diaryEntry.slides.find((item) => item.id === slideId);
  const direction = diaryVisualDirections.find((item) => item.id === variantId);

  if (!slide || !direction) return undefined;

  return {
    slide,
    direction,
    fileName: `${slide.id}-${direction.id}.png`,
  };
};

export async function GET() {
  return NextResponse.json({
    ok: true,
    entry: diaryEntry.slug,
    writesFiles: false,
    method: 'POST multipart/form-data',
    fields: {
      slideId: `slide-01 ... slide-${String(diaryEntry.slides.length).padStart(2, '0')}`,
      variantId: 'a | b | c | d',
      file: 'PNG file, exact 3:4 portrait ratio',
    },
    expectedAspectRatio,
    aspectTolerance,
    contract: diaryVisualContract,
    slots: diaryEntry.slides.flatMap((slide) =>
      diaryVisualDirections.map((direction) => ({
        slideId: slide.id,
        variantId: direction.id,
        fileName: `${slide.id}-${direction.id}.png`,
        outputFile: `public/diary/${diaryEntry.slug}/variants/${slide.id}-${direction.id}.png`,
      })),
    ),
  });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const slideId = String(formData.get('slideId') ?? '').trim();
  const variantId = String(formData.get('variantId') ?? '').trim().toLowerCase();
  const file = formData.get('file');
  const slot = findSlot(slideId, variantId);

  if (!slot) {
    return NextResponse.json(
      {
        ok: false,
        error: `Invalid slot. Use slideId slide-01 ... slide-${String(
          diaryEntry.slides.length,
        ).padStart(2, '0')} and variantId a | b | c | d.`,
      },
      { status: 400 },
    );
  }

  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: 'Missing file field. Upload a PNG as multipart field "file".' },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let dimensions: { width: number; height: number };
  try {
    dimensions = readPngDimensionsFromBuffer(buffer);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Could not read PNG dimensions.',
      },
      { status: 400 },
    );
  }

  const aspectOk = isExpectedDiaryAspect(dimensions.width, dimensions.height);
  const aspectRatio = dimensions.width / dimensions.height;

  if (!aspectOk) {
    return NextResponse.json(
      {
        ok: false,
        error: `Expected 3:4 PNG, got ${dimensions.width}x${dimensions.height}.`,
        dimensions: {
          ...dimensions,
          aspectRatio: Number(aspectRatio.toFixed(4)),
          expectedAspectRatio,
          aspectTolerance,
        },
      },
      { status: 422 },
    );
  }

  const entryDir = await resolveDiaryEntryDir();
  const variantDir = path.join(entryDir, 'variants');
  const outputPath = path.join(variantDir, slot.fileName);
  await mkdir(variantDir, { recursive: true });
  await writeFile(outputPath, buffer);

  return NextResponse.json({
    ok: true,
    entry: diaryEntry.slug,
    writesFiles: true,
    saved: {
      slideId: slot.slide.id,
      slideIndex: slot.slide.index,
      variantId: slot.direction.id,
      direction: slot.direction.label,
      fileName: slot.fileName,
      publicPath: `/diary/${diaryEntry.slug}/variants/${slot.fileName}`,
      outputFile: `public/diary/${diaryEntry.slug}/variants/${slot.fileName}`,
      dimensions: {
        ...dimensions,
        aspectRatio: Number(aspectRatio.toFixed(4)),
        expectedAspectRatio,
        aspectTolerance,
      },
    },
  });
}
