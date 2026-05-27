'use client';

import { useState } from 'react';
import { WorldStage } from '@/components/world/WorldStage';
import { CaseModal } from '@/components/world/CaseModal';

export default function BarPage() {
  const [caseId, setCaseId] = useState<string | null>(null);

  return (
    <>
      <WorldStage initialScene="bar-interior" onOpenCase={setCaseId} />
      <CaseModal caseId={caseId} onClose={() => setCaseId(null)} />
    </>
  );
}
