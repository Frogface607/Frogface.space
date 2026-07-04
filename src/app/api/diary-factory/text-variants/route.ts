import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { resolveDiaryEntryDir } from '@/lib/diaryAssets.server';
import {
  auditDiaryTextSlides,
  diaryEntry,
  diaryTextLimits,
  suggestDiaryTextFit,
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
  const approvedCount = validated.ok
    ? diaryEntry.slides.filter((slide) => validated.slides[slide.id]?.approved).length
    : 0;
  const audit = validated.ok ? auditDiaryTextSlides(validated.slides) : undefined;
  const fit = validated.ok ? suggestDiaryTextFit(validated.slides) : undefined;

  return NextResponse.json({
    ok: validated.ok,
    entry: diaryEntry.slug,
    writesFiles: false,
    status:
      validated.ok && approvedCount === diaryEntry.slides.length
        ? 'all-text-approved'
        : 'text-selection',
    nextAction: !validated.ok
      ? `Fix draft: ${validated.errors.join(', ')}`
      : approvedCount === diaryEntry.slides.length
        ? 'Prepare generation-plan and prompt files.'
        : 'Choose or edit one text variant per slide, then approve every slide.',
    limits: diaryTextLimits,
    approvedCount,
    total: diaryEntry.slides.length,
    errors: validated.ok ? [] : validated.errors,
    audit,
    fitSummary: fit
      ? {
          changedCount: fit.changedCount,
          beforeFailedCount: fit.auditBefore.failedCount,
          afterFailedCount: fit.auditAfter.failedCount,
          textFitsAfterSuggestions: fit.ok,
        }
      : undefined,
    slides: diaryEntry.slides.map((slide) => {
      const current = validated.ok ? validated.slides[slide.id] : undefined;

      return {
        id: slide.id,
        index: slide.index,
        title: slide.title,
        current: current
          ? {
              heading: current.heading,
              text: current.text,
              variantId: current.variantId,
              approved: current.approved,
            }
          : undefined,
        variants: slide.textVariants,
      };
    }),
    api: {
      factory: '/diary-factory',
      draft: '/api/diary-factory/draft',
      approvalSheet: '/api/diary-factory/approval-sheet',
      textAudit: '/api/diary-factory/text-audit',
      textFit: '/api/diary-factory/text-fit',
      health: '/api/diary-factory/health',
    },
  });
}
