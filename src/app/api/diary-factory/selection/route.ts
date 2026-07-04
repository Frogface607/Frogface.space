import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import {
  auditVisualAssets,
  readReadyVisualSlides,
  resolveDiaryEntryDir,
  sanitizeVisualSelection,
} from '@/lib/diaryAssets.server';
import { diaryEntry } from '@/lib/diaryFactory';

export const dynamic = 'force-dynamic';

type SelectionPayload = {
  selected?: Record<string, string>;
};

const selectionPath = () =>
  resolveDiaryEntryDir().then((entryDir) => path.join(entryDir, 'visual-selection.json'));

const defaultSelection = () => ({
  entry: diaryEntry.slug,
  updatedAt: new Date().toISOString(),
  selected: {},
});

export async function GET() {
  try {
    const raw = await readFile(await selectionPath(), 'utf8');
    return NextResponse.json(JSON.parse(raw.replace(/^\uFEFF/, '')));
  } catch {
    return NextResponse.json(defaultSelection());
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as SelectionPayload;

  if (!body.selected) {
    return NextResponse.json({ ok: false, error: 'Missing selected variants' }, { status: 400 });
  }

  const [readySlides, assetAudit] = await Promise.all([readReadyVisualSlides(), auditVisualAssets()]);
  const { sanitized: readySelected, rejected } = sanitizeVisualSelection(
    body.selected,
    readySlides,
  );
  const sanitized: Record<string, string> = {};

  for (const [slideId, variantId] of Object.entries(readySelected)) {
    const auditItem = assetAudit.items.find(
      (item) => item.slideId === slideId && item.variantId === variantId,
    );

    if (auditItem?.ok) {
      sanitized[slideId] = variantId;
    } else {
      rejected[slideId] = variantId;
    }
  }

  const payload = {
    entry: diaryEntry.slug,
    updatedAt: new Date().toISOString(),
    selected: sanitized,
    rejected,
  };

  await writeFile(await selectionPath(), JSON.stringify(payload, null, 2), 'utf8');
  return NextResponse.json({ ok: true, ...payload });
}
