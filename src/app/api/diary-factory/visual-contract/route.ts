import { NextResponse } from 'next/server';
import {
  diaryEntry,
  diaryVisualContract,
  diaryVisualDirections,
} from '@/lib/diaryFactory';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    ok: true,
    entry: diaryEntry.slug,
    writesFiles: false,
    contract: diaryVisualContract,
    directions: diaryVisualDirections,
    outputSlots: diaryEntry.slides.flatMap((slide) =>
      diaryVisualDirections.map((direction) => ({
        slideId: slide.id,
        slideIndex: slide.index,
        variantId: direction.id,
        direction: direction.label,
        fileName: `${slide.id}-${direction.id}.png`,
        outputFile: `public/diary/${diaryEntry.slug}/variants/${slide.id}-${direction.id}.png`,
      })),
    ),
  });
}
