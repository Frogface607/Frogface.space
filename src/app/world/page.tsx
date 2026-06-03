'use client';

import { useState } from 'react';
import { WorldStage } from '@/components/world/WorldStage';
import { CaseModal } from '@/components/world/CaseModal';

/**
 * /world — карта болота (навигационный хаб).
 * Interim: рендерит существующую external-сцену.
 * Фаза 2: заменить на полноценную карту с зданиями + Башней + туман войны.
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
