import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { resolveDiaryEntryDir } from '@/lib/diaryAssets.server';
import { diaryEntry, type DiaryDraftSlide, validateDiaryDraftSlides } from '@/lib/diaryFactory';

export const dynamic = 'force-dynamic';

type DraftPayload = {
  slides?: Record<string, DiaryDraftSlide>;
};

const draftPath = async () => path.join(await resolveDiaryEntryDir(), 'draft.json');

const defaultDraft = () => ({
  entry: diaryEntry.slug,
  updatedAt: new Date().toISOString(),
  slides: Object.fromEntries(
    diaryEntry.slides.map((slide) => [
      slide.id,
      {
        heading: slide.textVariants[0]?.heading ?? slide.title,
        text: slide.textVariants[0]?.text ?? slide.text,
        variantId: slide.textVariants[0]?.id,
        approved: false,
      },
    ]),
  ) as Record<string, DiaryDraftSlide>,
});

export async function GET() {
  try {
    const raw = await readFile(await draftPath(), 'utf8');
    return NextResponse.json(JSON.parse(raw.replace(/^\uFEFF/, '')));
  } catch {
    return NextResponse.json(defaultDraft());
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as DraftPayload;

  const validated = validateDiaryDraftSlides(body.slides);

  if (!validated.ok) {
    return NextResponse.json(
      { ok: false, error: `Invalid slides: ${validated.errors.join(', ')}` },
      { status: 400 },
    );
  }

  const payload = {
    entry: diaryEntry.slug,
    updatedAt: new Date().toISOString(),
    slides: validated.slides,
  };

  await writeFile(await draftPath(), JSON.stringify(payload, null, 2), 'utf8');
  return NextResponse.json({ ok: true, ...payload });
}
