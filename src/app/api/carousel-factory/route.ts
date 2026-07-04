import { NextResponse } from 'next/server';
import { carouselFactoryConfig, diaryEntry } from '@/lib/diaryFactory';

export async function GET() {
  return NextResponse.json({
    ok: true,
    writesFiles: false,
    factory: carouselFactoryConfig,
    activeDeck: {
      slug: diaryEntry.slug,
      title: diaryEntry.title,
      description: diaryEntry.description,
      slideCount: diaryEntry.slides.length,
      visualVariantsPerSlide: 4,
      format: '3:4 portrait Instagram carousel',
      generationLockedUntil: 'all slide text is approved',
    },
    links: {
      factory: '/carousel-factory',
      legacyFactory: '/diary-factory',
      health: '/api/diary-factory/health',
      handoff: '/api/diary-factory/handoff',
      reviewPacket: '/api/diary-factory/review-packet',
      approvalCheckpoint: '/api/diary-factory/approval-checkpoint',
      promptPack: '/api/diary-factory/prompt-pack',
      productionManifest: '/api/diary-factory/production-manifest',
    },
  });
}
