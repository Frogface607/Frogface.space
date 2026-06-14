'use client';

import { useState } from 'react';
import { WorldStage } from '@/components/world/WorldStage';
import { CaseModal } from '@/components/world/CaseModal';

/**
 * /world is the playable 2.5D Frogface swamp prototype.
 * The external scene scrolls like a small game; interiors still reuse the
 * existing click-zone world map until their art pass is ready.
 */
export default function WorldPage() {
  const [caseId, setCaseId] = useState<string | null>(null);

  return (
    <>
      <WorldStage initialScene="external" onOpenCase={setCaseId} />
      <CaseModal caseId={caseId} onClose={() => setCaseId(null)} />
    </>
  );
}
