import { access, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { diaryEntry, diaryVisualContract, diaryVisualDirections } from '@/lib/diaryFactory';

export type ReadyVisualVariant = {
  id: string;
  fileName: string;
};

export type ReadyVisualSlide = {
  id: string;
  index: number;
  variants: ReadyVisualVariant[];
};

export type VisualAssetAuditItem = {
  slideId: string;
  slideIndex: number;
  variantId: string;
  fileName: string;
  publicPath?: string;
  ready: boolean;
  width?: number;
  height?: number;
  aspectRatio?: number;
  expectedAspectRatio: number;
  aspectOk: boolean;
  ok: boolean;
  issue?: string;
};

export type ReferenceAssetAuditItem = (typeof diaryVisualContract.references)[number] & {
  filePath: string;
  ready: boolean;
  ok: boolean;
  bytes?: number;
  width?: number;
  height?: number;
  issue?: string;
};

export const expectedAspectRatio = 3 / 4;
export const aspectTolerance = 0.003;

export function readPngDimensionsFromBuffer(buffer: Buffer) {
  const isPng =
    buffer.length >= 24 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;

  if (!isPng) {
    throw new Error('not a PNG file');
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

export function isExpectedDiaryAspect(width: number, height: number) {
  return Math.abs(width / height - expectedAspectRatio) <= aspectTolerance;
}

export async function readPngDimensions(filePath: string) {
  const buffer = await readFile(filePath);
  return readPngDimensionsFromBuffer(buffer);
}

export async function resolveDiaryEntryDir(cwd = process.cwd()) {
  const candidates = [
    path.join(cwd, 'public', 'diary', diaryEntry.slug),
    path.join(cwd, 'FROGFACE-SPACE', 'public', 'diary', diaryEntry.slug),
    path.join(path.dirname(cwd), 'FROGFACE-SPACE', 'public', 'diary', diaryEntry.slug),
    path.join('D:\\PROJECTS\\FROGFACE-SPACE', 'public', 'diary', diaryEntry.slug),
  ];

  for (const candidate of candidates) {
    try {
      await access(path.join(candidate, 'manifest.md'));
      return candidate;
    } catch {
      // Try the next likely workspace location.
    }
  }

  return candidates[0];
}

export async function auditVisualAssets(cwd = process.cwd()) {
  const entryDir = await resolveDiaryEntryDir(cwd);
  const variantDir = path.join(entryDir, 'variants');
  let files: string[] = [];

  try {
    files = await readdir(variantDir);
  } catch {
    files = [];
  }

  const items: VisualAssetAuditItem[] = [];

  for (const slide of diaryEntry.slides) {
    for (const direction of diaryVisualDirections) {
      const fileName =
        files.find((file) => new RegExp(`^${slide.id}-${direction.id}\\.png$`, 'i').test(file)) ??
        `${slide.id}-${direction.id}.png`;
      const filePath = path.join(variantDir, fileName);
      const ready = files.some((file) => file.toLowerCase() === fileName.toLowerCase());

      if (!ready) {
        items.push({
          slideId: slide.id,
          slideIndex: slide.index,
          variantId: direction.id,
          fileName,
          ready: false,
          expectedAspectRatio,
          aspectOk: false,
          ok: false,
          issue: 'missing PNG',
        });
        continue;
      }

      try {
        const dimensions = await readPngDimensions(filePath);
        const aspectRatio = dimensions.width / dimensions.height;
        const aspectOk = isExpectedDiaryAspect(dimensions.width, dimensions.height);

        items.push({
          slideId: slide.id,
          slideIndex: slide.index,
          variantId: direction.id,
          fileName,
          publicPath: `/diary/${diaryEntry.slug}/variants/${fileName}`,
          ready,
          width: dimensions.width,
          height: dimensions.height,
          aspectRatio: Number(aspectRatio.toFixed(4)),
          expectedAspectRatio,
          aspectOk,
          ok: aspectOk,
          issue: aspectOk ? undefined : `expected 3:4, got ${dimensions.width}x${dimensions.height}`,
        });
      } catch (error) {
        items.push({
          slideId: slide.id,
          slideIndex: slide.index,
          variantId: direction.id,
          fileName,
          publicPath: `/diary/${diaryEntry.slug}/variants/${fileName}`,
          ready,
          expectedAspectRatio,
          aspectOk: false,
          ok: false,
          issue: error instanceof Error ? error.message : 'could not read PNG dimensions',
        });
      }
    }
  }

  const readyItems = items.filter((item) => item.ready);
  const failed = readyItems.filter((item) => !item.ok);

  return {
    ok: failed.length === 0,
    expectedAspectRatio,
    aspectTolerance,
    readyCount: readyItems.length,
    expectedCount: items.length,
    failedCount: failed.length,
    failed,
    items,
  };
}

export async function auditReferenceAssets(cwd = process.cwd()) {
  const items: ReferenceAssetAuditItem[] = await Promise.all(
    diaryVisualContract.references.map(async (reference) => {
      const relativePublicPath = reference.path.replace(/^\//, '').replace(/\//g, path.sep);
      const filePath = path.join(cwd, 'public', relativePublicPath);

      try {
        const [fileStat, dimensions] = await Promise.all([
          stat(filePath),
          readPngDimensions(filePath),
        ]);

        return {
          ...reference,
          filePath,
          ready: true,
          ok: fileStat.isFile(),
          bytes: fileStat.size,
          width: dimensions.width,
          height: dimensions.height,
        };
      } catch (error) {
        return {
          ...reference,
          filePath,
          ready: false,
          ok: false,
          issue: error instanceof Error ? error.message : 'could not read reference PNG',
        };
      }
    }),
  );
  const failed = items.filter((item) => !item.ok);

  return {
    ok: failed.length === 0,
    referenceDir: diaryVisualContract.referenceDir,
    expectedCount: diaryVisualContract.references.length,
    readyCount: items.filter((item) => item.ready).length,
    failedCount: failed.length,
    failed,
    items,
  };
}

export async function readReadyVisualSlides(cwd = process.cwd()): Promise<ReadyVisualSlide[]> {
  const entryDir = await resolveDiaryEntryDir(cwd);
  const variantDir = path.join(entryDir, 'variants');
  let files: string[] = [];

  try {
    files = await readdir(variantDir);
  } catch {
    files = [];
  }

  return diaryEntry.slides
    .map((slide) => ({
      id: slide.id,
      index: slide.index,
      variants: files
        .map((fileName) => {
          const match = fileName.match(new RegExp(`^${slide.id}-([a-z])\\.png$`, 'i'));
          if (!match) return null;

          return {
            id: match[1].toLowerCase(),
            fileName,
          };
        })
        .filter((variant): variant is ReadyVisualVariant => Boolean(variant))
        .sort((a, b) => a.id.localeCompare(b.id)),
    }))
    .filter((slide) => slide.variants.length > 0);
}

export function sanitizeVisualSelection(
  selected: Record<string, string>,
  readySlides: ReadyVisualSlide[],
) {
  const sanitized: Record<string, string> = {};
  const rejected: Record<string, string> = {};

  for (const [slideId, variantId] of Object.entries(selected)) {
    const slide = readySlides.find((item) => item.id === slideId);
    const variant = slide?.variants.find((item) => item.id === variantId);

    if (variant) {
      sanitized[slideId] = variantId;
    } else {
      rejected[slideId] = variantId;
    }
  }

  return { sanitized, rejected };
}
