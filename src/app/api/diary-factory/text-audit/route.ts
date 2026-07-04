import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { resolveDiaryEntryDir } from '@/lib/diaryAssets.server';
import {
  auditDiaryTextSlides,
  diaryEntry,
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

export async function GET() {
  const draft = await readDraft();
  const validated = validateDiaryDraftSlides(draft?.slides);

  if (!validated.ok) {
    return NextResponse.json(
      {
        ok: false,
        entry: diaryEntry.slug,
        error: `Fix text first: ${validated.errors.join(', ')}`,
        errors: validated.errors,
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    entry: diaryEntry.slug,
    writesFiles: false,
    audit: auditDiaryTextSlides(validated.slides),
  });
}
