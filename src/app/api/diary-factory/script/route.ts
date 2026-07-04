import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { resolveDiaryEntryDir } from '@/lib/diaryAssets.server';
import { diaryEntry, type DiaryDraftSlide, validateDiaryDraftSlides } from '@/lib/diaryFactory';

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

export async function GET() {
  const draft = await readDraft();
  const validated = validateDiaryDraftSlides(draft?.slides);
  const approvedCount = validated.ok
    ? diaryEntry.slides.filter((slide) => validated.slides[slide.id]?.approved).length
    : 0;
  const slides = diaryEntry.slides.map((slide) => {
    const current = validated.slides[slide.id];

    return {
      id: slide.id,
      index: slide.index,
      heading: current?.heading ?? slide.title,
      text: current?.text ?? slide.text,
      approved: Boolean(current?.approved),
    };
  });
  const plainText = slides
    .map((slide) => `${slide.id.toUpperCase()} · ${slide.heading}\n${slide.text}`)
    .join('\n\n');
  const caption = slides.map((slide) => `${slide.heading}\n${slide.text}`).join('\n\n');

  return NextResponse.json({
    ok: true,
    entry: diaryEntry.slug,
    valid: validated.ok,
    errors: validated.errors,
    approvedCount,
    total: diaryEntry.slides.length,
    allApproved: validated.ok && approvedCount === diaryEntry.slides.length,
    slides,
    plainText,
    caption,
  });
}
