import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { auditReferenceAssets, resolveDiaryEntryDir } from '@/lib/diaryAssets.server';
import {
  auditDiaryPrompts,
  auditDiaryTextSlides,
  buildDiaryPromptPack,
  diaryEntry,
  type DiaryDraftSlide,
  validateDiaryDraftSlides,
} from '@/lib/diaryFactory';

export const dynamic = 'force-dynamic';

type DraftPayload = {
  slides?: Record<string, DiaryDraftSlide>;
};

const confirmToken = 'approve-text-and-prepare-prompts';

const readDraft = async () => {
  const entryDir = await resolveDiaryEntryDir();
  const raw = await readFile(path.join(entryDir, 'draft.json'), 'utf8');

  return {
    entryDir,
    draft: JSON.parse(raw.replace(/^\uFEFF/, '')) as DraftPayload,
  };
};

const approveAllSlides = (slides: Record<string, DiaryDraftSlide>) =>
  Object.fromEntries(
    diaryEntry.slides.map((slide) => [
      slide.id,
      {
        ...slides[slide.id],
        approved: true,
      },
    ]),
  ) as Record<string, DiaryDraftSlide>;

const buildReadiness = async (slides: Record<string, DiaryDraftSlide>) => {
  const nextSlides = approveAllSlides(slides);
  const textAudit = auditDiaryTextSlides(nextSlides);
  const referenceAudit = await auditReferenceAssets();
  const promptSlides = buildDiaryPromptPack(nextSlides);
  const promptAudit = auditDiaryPrompts(
    promptSlides.flatMap((slide) => slide.variants.map((variant) => variant.prompt)),
  );
  const ready = textAudit.ok && referenceAudit.ok && promptAudit.ok;
  const blockedReason = !textAudit.ok
    ? `Apply + save line breaks first: ${textAudit.failedCount} slide(s).`
    : !referenceAudit.ok
      ? `Restore Frogface reference assets first: ${referenceAudit.failedCount} missing/invalid reference(s).`
      : !promptAudit.ok
        ? `Fix prompt contract first: ${promptAudit.failed.length} failed check(s).`
        : null;

  return {
    ready,
    blockedReason,
    nextSlides,
    promptSlides,
    textAudit,
    referenceAudit,
    promptAudit,
    promptCount: promptSlides.reduce((total, slide) => total + slide.variants.length, 0),
  };
};

const writePromptArtifacts = async ({
  entryDir,
  slides,
  promptSlides,
}: {
  entryDir: string;
  slides: Record<string, DiaryDraftSlide>;
  promptSlides: ReturnType<typeof buildDiaryPromptPack>;
}) => {
  const promptsDir = path.join(entryDir, 'prompts');
  await mkdir(promptsDir, { recursive: true });

  await writeFile(
    path.join(entryDir, 'draft.json'),
    JSON.stringify(
      {
        entry: diaryEntry.slug,
        updatedAt: new Date().toISOString(),
        slides,
      },
      null,
      2,
    ),
    'utf8',
  );

  await writeFile(
    path.join(entryDir, 'generation-plan.json'),
    JSON.stringify(
      {
        entry: diaryEntry.slug,
        generatedAt: new Date().toISOString(),
        status: 'prompts-only',
        rules: {
          format: '3:4 portrait',
          accent: 'red, not orange',
          tapeOrPlaster: 'not a repeating motif; use rarely if useful',
          tower: 'omit',
          frogface: 'optional per slide; use present-day etalon when present',
        },
        slides: promptSlides,
      },
      null,
      2,
    ),
    'utf8',
  );

  for (const slide of promptSlides) {
    for (const variant of slide.variants) {
      await writeFile(path.join(entryDir, variant.promptFile), variant.prompt, 'utf8');
    }
  }
};

export async function GET() {
  let loaded: Awaited<ReturnType<typeof readDraft>>;

  try {
    loaded = await readDraft();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        entry: diaryEntry.slug,
        writesFiles: false,
        ready: false,
        error: 'Save draft.json before running approval checkpoint.',
      },
      { status: 400 },
    );
  }

  const validated = validateDiaryDraftSlides(loaded.draft.slides);

  if (!validated.ok) {
    return NextResponse.json(
      {
        ok: false,
        entry: diaryEntry.slug,
        writesFiles: false,
        ready: false,
        error: `Fix text first: ${validated.errors.join(', ')}`,
      },
      { status: 400 },
    );
  }

  const approvedCount = diaryEntry.slides.filter(
    (slide) => validated.slides[slide.id]?.approved,
  ).length;
  const readiness = await buildReadiness(validated.slides);

  return NextResponse.json({
    ok: true,
    entry: diaryEntry.slug,
    writesFiles: false,
    mode: 'dry-run',
    ready: readiness.ready,
    blockedReason: readiness.blockedReason,
    approvedCount,
    totalSlides: diaryEntry.slides.length,
    wouldApproveCount: diaryEntry.slides.length - approvedCount,
    promptCount: readiness.ready ? readiness.promptCount : 0,
    promptBodyIncluded: false,
    requiredConfirm: confirmToken,
    wouldWrite: [
      `public/diary/${diaryEntry.slug}/draft.json`,
      `public/diary/${diaryEntry.slug}/generation-plan.json`,
      `public/diary/${diaryEntry.slug}/prompts/*.txt`,
    ],
    audit: {
      text: readiness.textAudit,
      references: readiness.referenceAudit,
      prompts: readiness.promptAudit,
    },
    api: {
      post: '/api/diary-factory/approval-checkpoint',
      promptPack: '/api/diary-factory/prompt-pack',
      generationQueue: '/api/diary-factory/generation-queue',
    },
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { confirm?: string };

  if (body.confirm !== confirmToken) {
    return NextResponse.json(
      {
        ok: false,
        entry: diaryEntry.slug,
        writesFiles: false,
        error: `Missing confirmation. Send {"confirm":"${confirmToken}"}.`,
      },
      { status: 400 },
    );
  }

  let loaded: Awaited<ReturnType<typeof readDraft>>;

  try {
    loaded = await readDraft();
  } catch {
    return NextResponse.json(
      { ok: false, writesFiles: false, error: 'Save draft.json before approval checkpoint.' },
      { status: 400 },
    );
  }

  const validated = validateDiaryDraftSlides(loaded.draft.slides);

  if (!validated.ok) {
    return NextResponse.json(
      { ok: false, writesFiles: false, error: `Fix text first: ${validated.errors.join(', ')}` },
      { status: 400 },
    );
  }

  const readiness = await buildReadiness(validated.slides);

  if (!readiness.ready) {
    return NextResponse.json(
      {
        ok: false,
        entry: diaryEntry.slug,
        writesFiles: false,
        error: readiness.blockedReason,
        audit: {
          text: readiness.textAudit,
          references: readiness.referenceAudit,
          prompts: readiness.promptAudit,
        },
      },
      { status: 409 },
    );
  }

  await writePromptArtifacts({
    entryDir: loaded.entryDir,
    slides: readiness.nextSlides,
    promptSlides: readiness.promptSlides,
  });

  return NextResponse.json({
    ok: true,
    entry: diaryEntry.slug,
    writesFiles: true,
    approvedCount: diaryEntry.slides.length,
    promptCount: readiness.promptCount,
    promptBodyIncluded: false,
    artifacts: {
      draft: `/diary/${diaryEntry.slug}/draft.json`,
      generationPlan: `/diary/${diaryEntry.slug}/generation-plan.json`,
      promptsDir: `/diary/${diaryEntry.slug}/prompts`,
    },
    nextAction: 'Generate or intake PNG variants, then choose one visual per slide.',
  });
}
