import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { resolveDiaryEntryDir } from '@/lib/diaryAssets.server';
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

const dosDateTime = (date = new Date()) => {
  const year = Math.max(date.getFullYear(), 1980);
  const dosTime =
    (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();

  return { dosDate, dosTime };
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
  const { dosDate, dosTime } = dosDateTime();
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

const readFinalEntries = async (finalDir: string) => {
  const files = (await readdir(finalDir)).sort((a, b) => a.localeCompare(b));
  const entries: ZipEntry[] = [];

  for (const fileName of files) {
    const filePath = path.join(finalDir, fileName);
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) continue;

    entries.push({
      name: `${diaryEntry.slug}/final/${fileName}`,
      data: await readFile(filePath),
    });
  }

  return entries;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const download = url.searchParams.get('download') === 'zip';
  const entryDir = await resolveDiaryEntryDir();
  const finalDir = path.join(entryDir, 'final');

  let entries: ZipEntry[] = [];
  try {
    entries = await readFinalEntries(finalDir);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        entry: diaryEntry.slug,
        writesFiles: false,
        ready: false,
        error: 'Final folder is not assembled yet.',
        nextAction:
          'Approve text, prepare prompts, generate/intake 32 valid PNGs, select visuals, then assemble final carousel.',
      },
      { status: 409 },
    );
  }

  const files = entries.map((entry) => ({
    name: entry.name,
    bytes: entry.data.length,
  }));

  if (!download) {
    return NextResponse.json({
      ok: true,
      entry: diaryEntry.slug,
      writesFiles: false,
      ready: true,
      fileCount: files.length,
      files,
      download: `/api/diary-factory/final-export?download=zip`,
    });
  }

  const zip = createZip(entries);

  return new NextResponse(zip, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="frogface-diary-${diaryEntry.slug}.zip"`,
      'Content-Length': String(zip.length),
    },
  });
}
