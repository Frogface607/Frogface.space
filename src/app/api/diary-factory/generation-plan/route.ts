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

type DraftPayload = {
  slides?: Record<string, DiaryDraftSlide>;
};

export async function POST() {
  const entryDir = await resolveDiaryEntryDir();
  const draftFile = path.join(entryDir, 'draft.json');

  let draft: DraftPayload;
  try {
    const raw = await readFile(draftFile, 'utf8');
    draft = JSON.parse(raw.replace(/^\uFEFF/, '')) as DraftPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Save and approve text draft before preparing generation plan.' },
      { status: 400 },
    );
  }

  const validated = validateDiaryDraftSlides(draft.slides);

  if (!validated.ok) {
    return NextResponse.json(
      { ok: false, error: `Fix text first: ${validated.errors.join(', ')}` },
      { status: 400 },
    );
  }

  const textAudit = auditDiaryTextSlides(validated.slides);

  if (!textAudit.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `Apply + save line breaks before preparing prompts: ${textAudit.failedCount} slide(s).`,
        failed: textAudit.failed,
      },
      { status: 400 },
    );
  }

  const referenceAudit = await auditReferenceAssets();

  if (!referenceAudit.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `Restore Frogface reference assets before preparing prompts: ${referenceAudit.failedCount} missing/invalid reference(s).`,
        failed: referenceAudit.failed,
      },
      { status: 400 },
    );
  }

  const unapproved = diaryEntry.slides
    .filter((slide) => !validated.slides[slide.id]?.approved)
    .map((slide) => slide.id);

  if (unapproved.length > 0) {
    return NextResponse.json(
      { ok: false, error: `Approve text first: ${unapproved.join(', ')}` },
      { status: 400 },
    );
  }

  const slides = buildDiaryPromptPack(validated.slides);
  const promptAudit = auditDiaryPrompts(
    slides.flatMap((slide) => slide.variants.map((variant) => variant.prompt)),
  );

  if (!promptAudit.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `Fix prompt contract before writing prompt files: ${promptAudit.failed.length} failed check(s).`,
        failed: promptAudit.failed,
        checks: promptAudit.checks,
      },
      { status: 400 },
    );
  }

  const planDir = entryDir;
  const promptsDir = path.join(planDir, 'prompts');
  await mkdir(promptsDir, { recursive: true });

  const generationPlan = {
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
    slides,
  };

  await writeFile(
    path.join(planDir, 'generation-plan.json'),
    JSON.stringify(generationPlan, null, 2),
    'utf8',
  );

  for (const slide of slides) {
    for (const variant of slide.variants) {
      await writeFile(path.join(planDir, variant.promptFile), variant.prompt, 'utf8');
    }
  }

  return NextResponse.json({
    ok: true,
    plan: `/diary/${diaryEntry.slug}/generation-plan.json`,
    promptCount: slides.reduce((total, slide) => total + slide.variants.length, 0),
  });
}
