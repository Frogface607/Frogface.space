import { NextResponse } from 'next/server';
import { auditVisualAssets } from '@/lib/diaryAssets.server';
import { diaryEntry } from '@/lib/diaryFactory';

export const dynamic = 'force-dynamic';

export async function GET() {
  const audit = await auditVisualAssets();

  return NextResponse.json({
    ok: true,
    entry: diaryEntry.slug,
    writesFiles: false,
    audit,
  });
}
