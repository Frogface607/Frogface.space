import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { resolveDiaryEntryDir } from '@/lib/diaryAssets.server';
import { diaryEntry } from '@/lib/diaryFactory';

export const dynamic = 'force-dynamic';

type AgentNotePayload = {
  agent?: unknown;
  title?: unknown;
  summary?: unknown;
  bullets?: unknown;
};

const maxSourceNotesLength = 50000;

const sourceNotesPath = async () => path.join(await resolveDiaryEntryDir(), 'source-notes.md');

const cleanLine = (value: unknown) =>
  typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';

const cleanBlock = (value: unknown) =>
  typeof value === 'string' ? value.replace(/\r\n/g, '\n').trim() : '';

const normalizeBullets = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map(cleanLine).filter(Boolean).slice(0, 20);
  }

  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((line) => line.replace(/^[-*]\s*/, ''))
      .map(cleanLine)
      .filter(Boolean)
      .slice(0, 20);
  }

  return [];
};

const defaultSourceNotes = () => `# Source Notes — ${diaryEntry.slug}

## Voice Notes

-

## Agent Notes

-

## Slide Intent

-
`;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as AgentNotePayload;
  const agent = cleanLine(body.agent);
  const title = cleanLine(body.title) || 'Agent update';
  const summary = cleanBlock(body.summary);
  const bullets = normalizeBullets(body.bullets);

  if (!agent) {
    return NextResponse.json({ ok: false, error: 'Missing agent name' }, { status: 400 });
  }

  if (!summary && bullets.length === 0) {
    return NextResponse.json(
      { ok: false, error: 'Missing summary or bullets' },
      { status: 400 },
    );
  }

  const filePath = await sourceNotesPath();
  let current = defaultSourceNotes();

  try {
    current = (await readFile(filePath, 'utf8')).replace(/^\uFEFF/, '');
  } catch {
    // Start from the default source notes if the file does not exist yet.
  }

  const timestamp = new Date().toISOString();
  const block = [
    '',
    `## Agent Update — ${agent} — ${timestamp}`,
    '',
    `### ${title}`,
    '',
    summary,
    bullets.length > 0 ? bullets.map((item) => `- ${item}`).join('\n') : '',
    '',
  ]
    .filter((line, index, lines) => line || lines[index - 1])
    .join('\n');
  const next = `${current.trimEnd()}\n${block}`;

  if (next.length > maxSourceNotesLength) {
    return NextResponse.json(
      { ok: false, error: 'Source notes are too long after this append' },
      { status: 400 },
    );
  }

  await writeFile(filePath, next, 'utf8');

  return NextResponse.json({
    ok: true,
    entry: diaryEntry.slug,
    updatedAt: timestamp,
    appended: {
      agent,
      title,
      summary,
      bullets,
    },
    contentLength: next.length,
  });
}
