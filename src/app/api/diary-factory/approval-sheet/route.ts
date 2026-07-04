import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { resolveDiaryEntryDir } from '@/lib/diaryAssets.server';
import {
  auditDiaryTextSlides,
  diaryEntry,
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

const fence = (value: string) => `\`\`\`text\n${value.replaceAll('```', "'''")}\n\`\`\``;

export async function GET() {
  const draft = await readDraft();
  const validated = validateDiaryDraftSlides(draft?.slides);

  if (!validated.ok) {
    return new NextResponse(`# Diary Approval Sheet — ${diaryEntry.slug}

Status: draft is invalid.

${validated.errors.map((error) => `- ${error}`).join('\n')}
`, {
      status: 400,
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
  }

  const approvedCount = diaryEntry.slides.filter(
    (slide) => validated.slides[slide.id]?.approved,
  ).length;
  const textAudit = auditDiaryTextSlides(validated.slides);
  const textFit = suggestDiaryTextFit(validated.slides);
  const fitBySlide = new Map(textFit.suggestions.map((item) => [item.slideId, item]));
  const approvalRows = diaryEntry.slides
    .map((slide) => {
      const current = validated.slides[slide.id];
      const auditItem = textAudit.items.find((item) => item.slideId === slide.id);

      return `| ${slide.id} | ${current.approved ? 'approved' : 'needs approval'} | ${
        auditItem?.ok ? 'ok' : auditItem?.warnings.join(', ') || 'check'
      } | ${current.heading} |`;
    })
    .join('\n');

  const markdown = `# Diary Approval Sheet — ${diaryEntry.slug}

Status: ${approvedCount === diaryEntry.slides.length ? 'all text approved' : 'text approval needed'}

## Approval State

- Text approved: ${approvedCount} / ${diaryEntry.slides.length}
- Text audit: ${textAudit.ok ? 'OK' : `${textAudit.failedCount} slide(s) need attention`}
- Line-fit suggestions: ${textFit.changedCount}
- Writes files: false

| Slide | Approval | Text audit | Heading |
| --- | --- | --- | --- |
${approvalRows}

## Approved Script Preview

${diaryEntry.slides
  .map((slide) => {
    const current = validated.slides[slide.id];
    const auditItem = textAudit.items.find((item) => item.slideId === slide.id);
    const fit = fitBySlide.get(slide.id);

    return `### ${slide.id.toUpperCase()} — ${current.heading}

- Approval: ${current.approved ? 'approved' : 'needs approval'}
- Audit: ${auditItem?.ok ? 'ok' : auditItem?.warnings.join(', ') || 'check'}
${fit ? '- Suggested line breaks: yes' : '- Suggested line breaks: no'}

${fence(`${current.heading}\n${current.text}`)}
${
  fit
    ? `Suggested fit:

${fence(`${current.heading}\n${fit.suggestedText}`)}
`
    : ''
}`;
  })
  .join('\n')}

## Next Action

${
  approvedCount === diaryEntry.slides.length
    ? 'Text is approved. Prepare generation-plan and prompt files.'
    : 'Review the text on /diary-factory, apply line breaks if useful, save draft.json, then approve every slide.'
}
`;

  return new NextResponse(markdown, {
    status: 200,
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
