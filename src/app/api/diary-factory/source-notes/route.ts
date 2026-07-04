import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { resolveDiaryEntryDir } from '@/lib/diaryAssets.server';
import { diaryEntry } from '@/lib/diaryFactory';

export const dynamic = 'force-dynamic';

type SourceNotesPayload = {
  content?: unknown;
};

const sourceNotesPath = async () => path.join(await resolveDiaryEntryDir(), 'source-notes.md');

const defaultSourceNotes = () => `# Source Notes — ${diaryEntry.slug}

## Voice Notes

-

## Agent Notes

-

## Slide Intent

-
`;

export async function GET() {
  try {
    const content = await readFile(await sourceNotesPath(), 'utf8');
    return NextResponse.json({
      ok: true,
      entry: diaryEntry.slug,
      content,
    });
  } catch {
    return NextResponse.json({
      ok: true,
      entry: diaryEntry.slug,
      content: defaultSourceNotes(),
    });
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as SourceNotesPayload;

  if (typeof body.content !== 'string') {
    return NextResponse.json({ ok: false, error: 'Missing source notes content' }, { status: 400 });
  }

  const content = body.content.trimEnd() + '\n';

  if (content.length > 50000) {
    return NextResponse.json(
      { ok: false, error: 'Source notes are too long for this diary entry' },
      { status: 400 },
    );
  }

  await writeFile(await sourceNotesPath(), content, 'utf8');

  return NextResponse.json({
    ok: true,
    entry: diaryEntry.slug,
    updatedAt: new Date().toISOString(),
    content,
  });
}
