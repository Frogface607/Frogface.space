import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import {
  readReadyVisualSlides,
  resolveDiaryEntryDir,
  sanitizeVisualSelection,
} from '@/lib/diaryAssets.server';
import { diaryEntry } from '@/lib/diaryFactory';

export const dynamic = 'force-dynamic';

type ZipEntry = {
  name: string;
  data: Buffer;
};

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

const crc32 = (buffer: Buffer) => {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const writeUInt16 = (value: number) => {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
};

const writeUInt32 = (value: number) => {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value >>> 0);
  return buffer;
};

const createZip = (entries: ZipEntry[]) => {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  const now = new Date();
  const dosTime =
    (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
  const dosDate =
    ((Math.max(now.getFullYear(), 1980) - 1980) << 9) |
    ((now.getMonth() + 1) << 5) |
    now.getDate();
  let offset = 0;

  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8');
    const checksum = crc32(entry.data);
    const size = entry.data.length;
    const localHeader = Buffer.concat([
      writeUInt32(0x04034b50),
      writeUInt16(20),
      writeUInt16(0x0800),
      writeUInt16(0),
      writeUInt16(dosTime),
      writeUInt16(dosDate),
      writeUInt32(checksum),
      writeUInt32(size),
      writeUInt32(size),
      writeUInt16(name.length),
      writeUInt16(0),
      name,
    ]);
    const centralHeader = Buffer.concat([
      writeUInt32(0x02014b50),
      writeUInt16(20),
      writeUInt16(20),
      writeUInt16(0x0800),
      writeUInt16(0),
      writeUInt16(dosTime),
      writeUInt16(dosDate),
      writeUInt32(checksum),
      writeUInt32(size),
      writeUInt32(size),
      writeUInt16(name.length),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt32(0),
      writeUInt32(offset),
      name,
    ]);

    localParts.push(localHeader, entry.data);
    centralParts.push(centralHeader);
    offset += localHeader.length + entry.data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.concat([
    writeUInt32(0x06054b50),
    writeUInt16(0),
    writeUInt16(0),
    writeUInt16(entries.length),
    writeUInt16(entries.length),
    writeUInt32(centralDirectory.length),
    writeUInt32(offset),
    writeUInt16(0),
  ]);

  return Buffer.concat([...localParts, centralDirectory, end]);
};

const readSelection = async () => {
  const entryDir = await resolveDiaryEntryDir();
  try {
    const raw = await readFile(path.join(entryDir, 'visual-selection.json'), 'utf8');
    const parsed = JSON.parse(raw.replace(/^\uFEFF/, '')) as { selected?: Record<string, string> };
    return parsed.selected ?? {};
  } catch {
    return {};
  }
};

export async function GET() {
  const entryDir = await resolveDiaryEntryDir();
  const readySlides = await readReadyVisualSlides();
  const selected = await readSelection();
  const { sanitized } = sanitizeVisualSelection(selected, readySlides);
  const entries: ZipEntry[] = [];

  for (const slide of diaryEntry.slides) {
    const variantId = sanitized[slide.id];
    if (!variantId) continue;

    const readySlide = readySlides.find((item) => item.id === slide.id);
    const variant = readySlide?.variants.find((item) => item.id === variantId);
    if (!variant?.fileName) continue;

    entries.push({
      name: `${diaryEntry.slug}/${String(slide.index).padStart(2, '0')}-${variant.fileName}`,
      data: await readFile(path.join(entryDir, 'variants', variant.fileName)),
    });
  }

  if (entries.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        ready: false,
        error: 'Выбери хотя бы один готовый вариант.',
      },
      { status: 409 },
    );
  }

  const zip = createZip(entries);

  return new NextResponse(zip, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="frogface-carousel-${diaryEntry.slug}-selected.zip"`,
      'Content-Length': String(zip.length),
    },
  });
}
