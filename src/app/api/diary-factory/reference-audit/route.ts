import { NextResponse } from 'next/server';
import { auditReferenceAssets } from '@/lib/diaryAssets.server';
import { diaryEntry } from '@/lib/diaryFactory';

export const dynamic = 'force-dynamic';

export async function GET() {
  const audit = await auditReferenceAssets();

  return NextResponse.json({
    entry: diaryEntry.slug,
    writesFiles: false,
    ...audit,
    api: {
      visualContract: '/api/diary-factory/visual-contract',
      generationBrief: '/api/diary-factory/generation-brief',
      health: '/api/diary-factory/health',
    },
  });
}
