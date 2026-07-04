import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { resolveDiaryEntryDir } from '@/lib/diaryAssets.server';
import { diaryEntry, diaryVisualDirections } from '@/lib/diaryFactory';

export const dynamic = 'force-dynamic';

type PlannedVariant = {
  id: string;
  label?: string;
  outputFile?: string;
  prompt?: string;
};

type PlannedSlide = {
  id: string;
  variants?: PlannedVariant[];
};

type GenerationPlan = {
  slides?: PlannedSlide[];
};

const variantLabel = (id: string) => id.toUpperCase();

async function readGenerationPlan(planPath: string) {
  try {
    const raw = await readFile(planPath, 'utf8');
    return JSON.parse(raw) as GenerationPlan;
  } catch {
    return undefined;
  }
}

export async function GET() {
  const entryDir = await resolveDiaryEntryDir();
  const variantDir = path.join(entryDir, 'variants');
  const generationPlan = await readGenerationPlan(path.join(entryDir, 'generation-plan.json'));

  let files: string[] = [];
  try {
    files = await readdir(variantDir);
  } catch {
    files = [];
  }

  const slides = diaryEntry.slides.map((slide) => {
    const plannedSlide = generationPlan?.slides?.find((item) => item.id === slide.id);
    const variants = diaryVisualDirections
      .map((direction) => {
        const id = direction.id;
        const fileName = files.find((file) =>
          new RegExp(`^${slide.id}-${id}\\.png$`, 'i').test(file),
        );
        const plannedVariant = plannedSlide?.variants?.find((item) => item.id === id);
        const ready = Boolean(fileName);

        return {
          id,
          label: variantLabel(id),
          direction: plannedVariant?.label ?? direction.label,
          description: direction.description,
          fileName,
          src: fileName ? `/diary/${diaryEntry.slug}/variants/${fileName}` : undefined,
          prompt: plannedVariant?.label ?? direction.description,
          ready,
        };
      })
      .sort((a, b) => a.id.localeCompare(b.id));

    return {
      id: slide.id,
      index: slide.index,
      title: slide.title,
      variants,
    };
  });
  const missing = slides.flatMap((slide) =>
    slide.variants
      .filter((variant) => !variant.ready)
      .map((variant) => ({
        slideId: slide.id,
        variantId: variant.id,
        fileName: `${slide.id}-${variant.id}.png`,
        direction: variant.direction,
      })),
  );

  return NextResponse.json({
    ok: true,
    entry: diaryEntry.slug,
    slides,
    readyCount: slides.filter((slide) => slide.variants.some((variant) => variant.ready)).length,
    readySlideCount: slides.filter((slide) => slide.variants.some((variant) => variant.ready))
      .length,
    variantCount: slides.reduce(
      (total, slide) => total + slide.variants.filter((variant) => variant.ready).length,
      0,
    ),
    expectedVariantCount: slides.reduce((total, slide) => total + slide.variants.length, 0),
    missingCount: missing.length,
    missing,
  });
}
