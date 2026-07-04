'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { carouselFactoryConfig, diaryEntry } from '@/lib/diaryFactory';

type DraftSlide = {
  heading: string;
  text: string;
  variantId?: string;
  approved: boolean;
};

type DraftState = Record<string, DraftSlide>;

type VisualVariant = {
  id: string;
  label: string;
  direction: string;
  description: string;
  fileName?: string;
  src?: string;
  prompt: string;
  ready: boolean;
};

type VisualSlide = {
  id: string;
  index: number;
  title: string;
  variants: VisualVariant[];
};

type SaveStatus =
  | { state: 'idle'; message: string }
  | { state: 'loading'; message: string }
  | { state: 'success'; message: string }
  | { state: 'error'; message: string };

type AssembleStatus =
  | { state: 'idle'; message: string }
  | { state: 'loading'; message: string }
  | { state: 'success'; message: string; files: string[] }
  | { state: 'error'; message: string };

type PlanStatus =
  | { state: 'idle'; message: string }
  | { state: 'loading'; message: string }
  | { state: 'success'; message: string; plan: string; promptCount: number }
  | { state: 'error'; message: string };

type AssetsPayload = {
  ok?: boolean;
  slides?: VisualSlide[];
  variantCount?: number;
  expectedVariantCount?: number;
};

type SelectionPayload = {
  ok?: boolean;
  selected?: Record<string, string>;
  rejected?: Record<string, string>;
  error?: string;
};

type SourceNotesPayload = {
  ok?: boolean;
  content?: string;
  error?: string;
};

type FactoryStatus = {
  phase: string;
  nextAction: string;
  readiness?: {
    readyForPromptPlan: boolean;
    readyForImageGeneration: boolean;
    readyForAssembly: boolean;
    blockedReason: string | null;
  };
  text: {
    valid: boolean;
    approvedCount: number;
    total: number;
  };
  visuals: {
    readyVariantCount: number;
    expectedVariantCount: number;
    readySlideCount: number;
    missingCount: number;
    missing: Array<{
      slideId: string;
      variantId: string;
      fileName: string;
      direction: string;
    }>;
  };
  selection: {
    selectedCount: number;
  };
  artifacts: Record<string, boolean>;
};

type HealthGate = {
  id: string;
  label: string;
  ok: boolean;
  required: boolean;
  evidence: string;
  nextAction?: string;
};

type HealthPayload = {
  ok?: boolean;
  complete?: boolean;
  currentGate?: HealthGate | null;
  gates?: HealthGate[];
  counts?: {
    approvedText: number;
    totalSlides: number;
    readyVariants: number;
    expectedVariants: number;
    selectedSlides: number;
    invalidAssets: number;
  };
  error?: string;
};

type QueueItem = {
  slideId: string;
  slideIndex: number;
  variantId: string;
  label: string;
  outputFile: string;
  promptFile: string;
  heading: string;
  reason?: string;
  issue?: string;
};

type QueuePayload = {
  ok?: boolean;
  writesFiles?: boolean;
  readyForGeneration?: boolean;
  blockedReason?: string | null;
  approvedCount?: number;
  total?: number;
  allApproved?: boolean;
  readyVariantCount?: number;
  missingCount?: number;
  missingAssetCount?: number;
  invalidAssetCount?: number;
  audit?: {
    ok: boolean;
    promptCount: number;
    failed: Array<{
      promptIndex: number;
      rule: string;
    }>;
    checks: string[];
  };
  queue?: QueueItem[];
  error?: string;
};

type AssetAuditItem = {
  slideId: string;
  variantId: string;
  fileName: string;
  ready: boolean;
  width?: number;
  height?: number;
  aspectRatio?: number;
  ok: boolean;
  issue?: string;
};

type AssetAuditPayload = {
  ok?: boolean;
  audit?: {
    ok: boolean;
    readyCount: number;
    expectedCount: number;
    failedCount: number;
    failed: AssetAuditItem[];
    items: AssetAuditItem[];
  };
  error?: string;
};

type AssetIntakePayload = {
  ok?: boolean;
  saved?: {
    slideId: string;
    variantId: string;
    fileName: string;
    publicPath: string;
    dimensions: {
      width: number;
      height: number;
      aspectRatio: number;
    };
  };
  error?: string;
};

type AssetIntakeBatchPayload = {
  ok?: boolean;
  savedCount?: number;
  rejectedCount?: number;
  saved?: Array<{
    slideId: string;
    variantId: string;
    fileName: string;
    publicPath: string;
    dimensions: {
      width: number;
      height: number;
      aspectRatio: number;
    };
  }>;
  rejected?: Array<{
    fieldName: string;
    originalName: string;
    fileName?: string;
    error: string;
  }>;
  error?: string;
};

type TextAuditItem = {
  slideId: string;
  index: number;
  heading: string;
  lineCount: number;
  maxLineLength: number;
  totalChars: number;
  ok: boolean;
  warnings: string[];
};

type TextAuditPayload = {
  ok?: boolean;
  audit?: {
    ok: boolean;
    failedCount: number;
    failed: TextAuditItem[];
    items: TextAuditItem[];
  };
  error?: string;
};

type TextFitSuggestion = {
  slideId: string;
  index: number;
  heading: string;
  currentText: string;
  suggestedText: string;
  changed: boolean;
};

type TextFitPayload = {
  ok?: boolean;
  writesFiles?: boolean;
  changedCount?: number;
  auditBefore?: TextAuditPayload['audit'];
  auditAfter?: TextAuditPayload['audit'];
  suggestions?: TextFitSuggestion[];
  slides?: DraftState;
  error?: string;
};

type ApprovalCheckpointPayload = {
  ok?: boolean;
  writesFiles?: boolean;
  mode?: string;
  ready?: boolean;
  blockedReason?: string | null;
  approvedCount?: number;
  totalSlides?: number;
  wouldApproveCount?: number;
  promptCount?: number;
  promptBodyIncluded?: boolean;
  requiredConfirm?: string;
  wouldWrite?: string[];
  error?: string;
};

const visualVariantIds = ['a', 'b', 'c', 'd'] as const;

const createInitialDraft = (): DraftState =>
  Object.fromEntries(
    diaryEntry.slides.map((slide) => [
      slide.id,
      {
        heading: slide.textVariants[0]?.heading ?? slide.title,
        text: slide.textVariants[0]?.text ?? slide.text,
        variantId: slide.textVariants[0]?.id,
        approved: false,
      },
    ]),
  );

const requestAssets = async (): Promise<{
  slides: VisualSlide[];
  variantCount?: number;
  expectedVariantCount?: number;
}> => {
  const response = await fetch('/api/diary-factory/assets');
  const payload = (await response.json()) as AssetsPayload;

  if (!response.ok || !payload.ok || !payload.slides) {
    throw new Error('Не смог прочитать варианты.');
  }

  return {
    slides: payload.slides,
    variantCount: payload.variantCount,
    expectedVariantCount: payload.expectedVariantCount,
  };
};

const requestFactoryStatus = async () => {
  const response = await fetch('/api/diary-factory/status');
  const payload = (await response.json()) as { ok?: boolean } & FactoryStatus;

  if (!response.ok || !payload.ok) {
    throw new Error('Не смог прочитать статус фабрики.');
  }

  return payload;
};

const requestFactoryHealth = async () => {
  const response = await fetch('/api/diary-factory/health');
  const payload = (await response.json()) as HealthPayload;

  if (!response.ok || !payload.ok || !payload.gates) {
    throw new Error(payload.error ?? 'Не смог прочитать health фабрики.');
  }

  return payload;
};

const requestGenerationQueue = async () => {
  const response = await fetch('/api/diary-factory/generation-queue');
  const payload = (await response.json()) as QueuePayload;

  if (!response.ok || !payload.ok) {
    throw new Error(payload.error ?? 'Не смог прочитать очередь генерации.');
  }

  return payload;
};

const requestSourceNotes = async () => {
  const response = await fetch('/api/diary-factory/source-notes');
  const payload = (await response.json()) as SourceNotesPayload;

  if (!response.ok || !payload.ok || typeof payload.content !== 'string') {
    throw new Error(payload.error ?? 'Не смог прочитать сырье дня.');
  }

  return payload.content;
};

const requestAssetAudit = async () => {
  const response = await fetch('/api/diary-factory/asset-audit');
  const payload = (await response.json()) as AssetAuditPayload;

  if (!response.ok || !payload.ok || !payload.audit) {
    throw new Error(payload.error ?? 'Не смог проверить визуальные ассеты.');
  }

  return payload.audit;
};

const requestTextAudit = async () => {
  const response = await fetch('/api/diary-factory/text-audit');
  const payload = (await response.json()) as TextAuditPayload;

  if (!response.ok || !payload.ok || !payload.audit) {
    throw new Error(payload.error ?? 'Не смог проверить текст слайдов.');
  }

  return payload.audit;
};

const requestTextFit = async () => {
  const response = await fetch('/api/diary-factory/text-fit');
  const payload = (await response.json()) as TextFitPayload;

  if (!response.ok || !payload.ok || !payload.suggestions || !payload.slides) {
    throw new Error(payload.error ?? 'Не смог подготовить переносы строк.');
  }

  return payload;
};

const requestApprovalCheckpoint = async () => {
  const response = await fetch('/api/diary-factory/approval-checkpoint');
  const payload = (await response.json()) as ApprovalCheckpointPayload;

  if (!response.ok || !payload.ok) {
    throw new Error(payload.error ?? 'Не получилось проверить approval checkpoint.');
  }

  return payload;
};

const requestAssetIntake = async ({
  slideId,
  variantId,
  file,
}: {
  slideId: string;
  variantId: string;
  file: File;
}) => {
  const body = new FormData();
  body.set('slideId', slideId);
  body.set('variantId', variantId);
  body.set('file', file);

  const response = await fetch('/api/diary-factory/asset-intake', {
    method: 'POST',
    body,
  });
  const payload = (await response.json()) as AssetIntakePayload;

  if (!response.ok || !payload.ok || !payload.saved) {
    throw new Error(payload.error ?? 'Не получилось принять PNG в слот.');
  }

  return payload.saved;
};

const requestAssetIntakeBatch = async (files: File[]) => {
  const body = new FormData();
  files.forEach((file) => body.append('files', file));

  const response = await fetch('/api/diary-factory/asset-intake-batch', {
    method: 'POST',
    body,
  });
  const payload = (await response.json()) as AssetIntakeBatchPayload;

  if (
    (!response.ok && !payload.rejected?.length) ||
    typeof payload.savedCount !== 'number' ||
    typeof payload.rejectedCount !== 'number'
  ) {
    throw new Error(payload.error ?? 'Не получилось принять пачку PNG.');
  }

  return payload;
};

export function DiaryFactory() {
  const [draft, setDraft] = useState<DraftState>(() => createInitialDraft());
  const [sourceNotes, setSourceNotes] = useState('');
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [sourceStatus, setSourceStatus] = useState<SaveStatus>({
    state: 'idle',
    message: 'Сюда складывается голос Босса и итоги агентов до сборки текста.',
  });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({
    state: 'idle',
    message: 'Текст можно редактировать прямо здесь.',
  });
  const [assembleStatus, setAssembleStatus] = useState<AssembleStatus>({
    state: 'idle',
    message: 'Выбери визуальные варианты, когда текст утвержден.',
  });
  const [planStatus, setPlanStatus] = useState<PlanStatus>({
    state: 'idle',
    message: 'После утверждения текста можно подготовить промпты для генерации.',
  });
  const [assetSlides, setAssetSlides] = useState<VisualSlide[]>(() =>
    diaryEntry.slides.map((slide) => ({
      id: slide.id,
      index: slide.index,
      title: slide.title,
      variants: slide.variants.map((variant) => ({
        ...variant,
        direction: variant.prompt,
        description: variant.prompt,
        ready: true,
      })),
    })),
  );
  const [assetStatus, setAssetStatus] = useState<SaveStatus>({
    state: 'idle',
    message: 'Визуальные варианты подхватываются из папки variants.',
  });
  const [selectionStatus, setSelectionStatus] = useState<SaveStatus>({
    state: 'idle',
    message: 'Выбор визуалов можно сохранить отдельно от финальной сборки.',
  });
  const [factoryStatus, setFactoryStatus] = useState<FactoryStatus | null>(null);
  const [factoryHealth, setFactoryHealth] = useState<HealthPayload | null>(null);
  const [healthStatus, setHealthStatus] = useState<SaveStatus>({
    state: 'idle',
    message: 'Health показывает гейты фабрики и текущий блокер.',
  });
  const [queuePreview, setQueuePreview] = useState<QueuePayload | null>(null);
  const [queueStatus, setQueueStatus] = useState<SaveStatus>({
    state: 'idle',
    message: 'Очередь генерации читается в режиме предпросмотра.',
  });
  const [approvalCheckpoint, setApprovalCheckpoint] = useState<ApprovalCheckpointPayload | null>(
    null,
  );
  const [approvalCheckpointStatus, setApprovalCheckpointStatus] = useState<SaveStatus>({
    state: 'idle',
    message: 'Checkpoint показывает, готов ли текст к записи prompt plan.',
  });
  const [assetAudit, setAssetAudit] = useState<AssetAuditPayload['audit'] | null>(null);
  const [assetAuditStatus, setAssetAuditStatus] = useState<SaveStatus>({
    state: 'idle',
    message: 'Проверяю готовые PNG на формат 3:4.',
  });
  const [intakeSlot, setIntakeSlot] = useState({ slideId: 'slide-01', variantId: 'a' });
  const [intakeFile, setIntakeFile] = useState<File | null>(null);
  const [intakeStatus, setIntakeStatus] = useState<SaveStatus>({
    state: 'idle',
    message: 'Можно принять PNG в конкретный слот variants через проверку 3:4.',
  });
  const [batchIntakeFiles, setBatchIntakeFiles] = useState<File[]>([]);
  const [batchIntakeStatus, setBatchIntakeStatus] = useState<SaveStatus>({
    state: 'idle',
    message: 'Можно закинуть пачку PNG с именами slide-01-a.png ... slide-08-d.png.',
  });
  const [textAudit, setTextAudit] = useState<TextAuditPayload['audit'] | null>(null);
  const [textAuditStatus, setTextAuditStatus] = useState<SaveStatus>({
    state: 'idle',
    message: 'Проверяю читаемость текста для генерации кириллицы.',
  });

  const [textFitPreview, setTextFitPreview] = useState<TextFitPayload | null>(null);
  const [textFitStatus, setTextFitStatus] = useState<SaveStatus>({
    state: 'idle',
    message: 'Можно предложить только переносы строк, без переписывания текста.',
  });

  const visualSlides = assetSlides;
  const readyVisualSlides = useMemo(
    () => assetSlides.filter((slide) => slide.variants.some((variant) => variant.ready)),
    [assetSlides],
  );
  const readyVariantCount = useMemo(
    () =>
      assetSlides.reduce(
        (total, slide) => total + slide.variants.filter((variant) => variant.ready).length,
        0,
      ),
    [assetSlides],
  );
  const expectedVariantCount = useMemo(
    () => assetSlides.reduce((total, slide) => total + slide.variants.length, 0),
    [assetSlides],
  );

  const approvedCount = useMemo(
    () => diaryEntry.slides.filter((slide) => draft[slide.id]?.approved).length,
    [draft],
  );
  const scriptPreview = useMemo(
    () =>
      diaryEntry.slides
        .map((slide) => {
          const current = draft[slide.id];
          const heading = current?.heading ?? slide.title;
          const text = current?.text ?? slide.text;

          return `${slide.id.toUpperCase()} · ${heading}\n${text}`;
        })
        .join('\n\n'),
    [draft],
  );
  const unapprovedSummary = useMemo(
    () =>
      diaryEntry.slides
        .filter((slide) => !draft[slide.id]?.approved)
        .map((slide) => slide.id)
        .join(', '),
    [draft],
  );

  const selectableVisualKeys = useMemo(
    () =>
      new Set(
        (assetAudit?.items ?? [])
          .filter((item) => item.ok)
          .map((item) => `${item.slideId}:${item.variantId}`),
      ),
    [assetAudit],
  );

  const validSelected = useMemo(() => {
    const valid: Record<string, string> = {};

    for (const slide of readyVisualSlides) {
      const variantId = selected[slide.id];
      const isSelectable = variantId
        ? selectableVisualKeys.has(`${slide.id}:${variantId}`)
        : false;
      if (variantId && isSelectable) valid[slide.id] = variantId;
    }

    return valid;
  }, [readyVisualSlides, selectableVisualKeys, selected]);

  const staleSelected = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(selected).filter(([slideId, variantId]) => {
          return !selectableVisualKeys.has(`${slideId}:${variantId}`);
        }),
      ),
    [selectableVisualKeys, selected],
  );

  const selectedCount = useMemo(
    () => Object.keys(validSelected).length,
    [validSelected],
  );
  const allTextApproved = approvedCount === diaryEntry.slides.length;

  const selectedSummary = useMemo(
    () =>
      readyVisualSlides
        .map((slide) => {
          const variantId = validSelected[slide.id];
          return variantId ? `${slide.id}: ${variantId.toUpperCase()}` : null;
        })
        .filter(Boolean)
        .join('\n'),
    [readyVisualSlides, validSelected],
  );

  const staleSummary = useMemo(
    () =>
      Object.entries(staleSelected)
        .map(([slideId, variantId]) => `${slideId}: ${variantId.toUpperCase()}`)
        .join('\n'),
    [staleSelected],
  );
  const staleCount = Object.keys(staleSelected).length;
  const allVisualVariantsReady = readyVariantCount === expectedVariantCount && expectedVariantCount > 0;
  const allVisualAssetsOk = Boolean(assetAudit?.ok);
  const allFinalSlidesSelected = selectedCount === diaryEntry.slides.length;

  const loadAssets = async ({ showLoading = false }: { showLoading?: boolean } = {}) => {
    if (showLoading) {
      setAssetStatus({ state: 'loading', message: 'Проверяю папку variants...' });
    }

    try {
      const payload = await requestAssets();
      setAssetSlides(payload.slides);
      setAssetStatus({
        state: 'success',
        message: `Готово визуалов: ${payload.variantCount ?? 0} / ${
          payload.expectedVariantCount ?? 0
        }.`,
      });
      void loadGenerationQueue();
      void loadAssetAudit();
    } catch (error) {
      setAssetStatus({
        state: 'error',
        message:
          error instanceof Error ? error.message : 'Неизвестная ошибка чтения вариантов.',
      });
    }
  };

  const loadFactoryStatus = async () => {
    try {
      setFactoryStatus(await requestFactoryStatus());
    } catch {
      setFactoryStatus(null);
    }
  };

  const loadFactoryHealth = async () => {
    try {
      const payload = await requestFactoryHealth();
      setFactoryHealth(payload);
      setHealthStatus({
        state: payload.complete ? 'success' : 'idle',
        message: payload.complete
          ? 'Все гейты фабрики пройдены.'
          : payload.currentGate?.nextAction ?? 'Есть незакрытые гейты фабрики.',
      });
    } catch (error) {
      setFactoryHealth(null);
      setHealthStatus({
        state: 'error',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка factory health.',
      });
    }
  };

  const loadGenerationQueue = async () => {
    try {
      const payload = await requestGenerationQueue();
      setQueuePreview(payload);
      setQueueStatus({
        state: payload.readyForGeneration === false ? 'idle' : 'success',
        message:
          payload.readyForGeneration === false
            ? payload.blockedReason ?? 'Очередь закрыта до утверждения текста.'
            : `Очередь готова: ${payload.missingCount ?? 0} задач, файлов не пишет.`,
      });
    } catch (error) {
      setQueuePreview(null);
      setQueueStatus({
        state: 'error',
        message:
          error instanceof Error ? error.message : 'Неизвестная ошибка чтения очереди.',
      });
    }
  };

  const loadApprovalCheckpoint = async () => {
    setApprovalCheckpointStatus({
      state: 'loading',
      message: 'Проверяю approval checkpoint...',
    });

    try {
      const payload = await requestApprovalCheckpoint();
      setApprovalCheckpoint(payload);
      setApprovalCheckpointStatus({
        state: payload.ready ? 'success' : 'idle',
        message: payload.ready
          ? `Checkpoint готов: будет утверждено ${payload.wouldApproveCount ?? 0}, промптов ${payload.promptCount ?? 0}.`
          : payload.blockedReason ?? 'Checkpoint пока закрыт.',
      });
    } catch (error) {
      setApprovalCheckpoint(null);
      setApprovalCheckpointStatus({
        state: 'error',
        message:
          error instanceof Error ? error.message : 'Неизвестная ошибка approval checkpoint.',
      });
    }
  };

  const loadAssetAudit = async () => {
    try {
      const audit = await requestAssetAudit();
      setAssetAudit(audit);
      setAssetAuditStatus({
        state: audit.ok ? 'success' : 'error',
        message: audit.ok
          ? `Все готовые PNG в формате 3:4: ${audit.readyCount} / ${audit.expectedCount}.`
          : `Есть PNG не в 3:4: ${audit.failedCount}.`,
      });
    } catch (error) {
      setAssetAudit(null);
      setAssetAuditStatus({
        state: 'error',
        message:
          error instanceof Error ? error.message : 'Неизвестная ошибка проверки ассетов.',
      });
    }
  };

  const uploadIntakeAsset = async () => {
    if (!intakeFile) {
      setIntakeStatus({ state: 'error', message: 'Выбери PNG файл для загрузки.' });
      return;
    }

    setIntakeStatus({ state: 'loading', message: 'Проверяю PNG и принимаю в variants...' });

    try {
      const saved = await requestAssetIntake({
        slideId: intakeSlot.slideId,
        variantId: intakeSlot.variantId,
        file: intakeFile,
      });
      setIntakeFile(null);
      setIntakeStatus({
        state: 'success',
        message: `Принято: ${saved.fileName} · ${saved.dimensions.width}x${saved.dimensions.height}.`,
      });
      void loadAssets();
      void loadFactoryStatus();
      void loadFactoryHealth();
      void loadGenerationQueue();
      void loadAssetAudit();
    } catch (error) {
      setIntakeStatus({
        state: 'error',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка приема PNG.',
      });
    }
  };

  const uploadBatchIntakeAssets = async () => {
    if (batchIntakeFiles.length === 0) {
      setBatchIntakeStatus({ state: 'error', message: 'Выбери один или несколько PNG файлов.' });
      return;
    }

    setBatchIntakeStatus({
      state: 'loading',
      message: `Проверяю пачку PNG: ${batchIntakeFiles.length} файл(ов)...`,
    });

    try {
      const payload = await requestAssetIntakeBatch(batchIntakeFiles);
      const savedCount = payload.savedCount ?? 0;
      const rejectedCount = payload.rejectedCount ?? 0;
      const rejectedPreview = payload.rejected
        ?.slice(0, 3)
        .map((item) => `${item.originalName}: ${item.error}`)
        .join(' · ');

      setBatchIntakeFiles([]);
      setBatchIntakeStatus({
        state: rejectedCount > 0 ? (savedCount > 0 ? 'success' : 'error') : 'success',
        message:
          rejectedCount > 0
            ? `Принято: ${savedCount}. Отклонено: ${rejectedCount}. ${rejectedPreview ?? ''}`.trim()
            : `Принято: ${savedCount}. Все PNG прошли проверку 3:4.`,
      });
      void loadAssets();
      void loadFactoryStatus();
      void loadFactoryHealth();
      void loadGenerationQueue();
      void loadAssetAudit();
    } catch (error) {
      setBatchIntakeStatus({
        state: 'error',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка приема пачки PNG.',
      });
    }
  };

  const loadTextAudit = async () => {
    try {
      const audit = await requestTextAudit();
      setTextAudit(audit);
      setTextAuditStatus({
        state: audit.ok ? 'success' : 'error',
        message: audit.ok
          ? 'Текст выглядит компактно для слайдов.'
          : `Есть риск перегруза текста: ${audit.failedCount} слайд(ов).`,
      });
    } catch (error) {
      setTextAudit(null);
      setTextAuditStatus({
        state: 'error',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка text-audit.',
      });
    }
  };

  const loadTextFit = async () => {
    setTextFitStatus({ state: 'loading', message: 'Считаю аккуратные переносы строк...' });

    try {
      const payload = await requestTextFit();
      setTextFitPreview(payload);
      setTextFitStatus({
        state: payload.changedCount ? 'success' : 'success',
        message: payload.changedCount
          ? `Есть предложения по переносам: ${payload.changedCount} слайд(ов).`
          : 'Переносы уже выглядят нормально, менять нечего.',
      });
    } catch (error) {
      setTextFitPreview(null);
      setTextFitStatus({
        state: 'error',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка text-fit.',
      });
    }
  };

  const buildFittedDraft = () => {
    if (!textFitPreview?.slides || !textFitPreview.suggestions?.length) return;

    const changedSlideIds = new Set(textFitPreview.suggestions.map((item) => item.slideId));

    return (current: DraftState): DraftState =>
      Object.fromEntries(
        diaryEntry.slides.map((slide) => {
          const currentSlide =
            current[slide.id] ?? {
              heading: slide.textVariants[0]?.heading ?? slide.title,
              text: slide.textVariants[0]?.text ?? slide.text,
              variantId: slide.textVariants[0]?.id,
              approved: false,
            };
          const fittedSlide = textFitPreview.slides?.[slide.id];
          const nextSlide = fittedSlide ?? currentSlide;

          return [
            slide.id,
            {
              ...nextSlide,
              approved: changedSlideIds.has(slide.id) ? false : Boolean(nextSlide?.approved),
            },
          ];
        }),
      );
  };

  const applyTextFit = () => {
    const fitDraft = buildFittedDraft();
    if (!fitDraft) return;

    setDraft((current) => fitDraft(current));
    setSaveStatus({
      state: 'idle',
      message: 'Переносы применены на экране. Сохрани draft.json после проверки.',
    });
    setTextAuditStatus({
      state: 'idle',
      message: 'Сохрани текст, чтобы text-audit перечитал draft.json.',
    });
    setTextFitPreview(null);
  };

  const applyTextFitAndSave = async () => {
    const fitDraft = buildFittedDraft();
    if (!fitDraft) return;

    setSaveStatus({ state: 'loading', message: 'Saving fitted line breaks to draft.json...' });

    try {
      const nextDraft = fitDraft(draft);
      await persistDraft(nextDraft);
      setDraft(nextDraft);
      setTextFitPreview(null);
      setSaveStatus({
        state: 'success',
        message: 'Line breaks saved. Changed slides were unapproved for review.',
      });
      void loadFactoryStatus();
      void loadFactoryHealth();
      void loadGenerationQueue();
      void loadTextAudit();
      void loadApprovalCheckpoint();
      void loadTextFit();
    } catch (error) {
      setSaveStatus({
        state: 'error',
        message: error instanceof Error ? error.message : 'Unknown text-fit save error.',
      });
    }
  };

  useEffect(() => {
    const loadSourceNotes = async () => {
      try {
        setSourceNotes(await requestSourceNotes());
      } catch (error) {
        setSourceStatus({
          state: 'error',
          message:
            error instanceof Error ? error.message : 'Неизвестная ошибка чтения сырья дня.',
        });
      }
    };

    const loadDraft = async () => {
      try {
        const response = await fetch('/api/diary-factory/draft');
        const payload = (await response.json()) as { slides?: DraftState };
        if (payload.slides) setDraft(payload.slides);
      } catch {
        setSaveStatus({
          state: 'error',
          message: 'Не смог загрузить draft.json, показываю дефолтный сценарий.',
        });
      }
    };

    const loadInitialAssets = async () => {
      try {
        const payload = await requestAssets();
        setAssetSlides(payload.slides);
        setAssetStatus({
          state: 'success',
          message: `Готово визуалов: ${payload.variantCount ?? 0} / ${
            payload.expectedVariantCount ?? 0
          }.`,
        });
        void loadAssetAudit();
      } catch (error) {
        setAssetStatus({
          state: 'error',
          message:
            error instanceof Error ? error.message : 'Неизвестная ошибка чтения вариантов.',
        });
      }
    };

    const loadSelection = async () => {
      try {
        const response = await fetch('/api/diary-factory/selection');
        const payload = (await response.json()) as SelectionPayload;
        if (payload.selected) setSelected(payload.selected);
      } catch {
        setSelectionStatus({
          state: 'error',
          message: 'Не смог загрузить visual-selection.json, выбор пустой.',
        });
      }
    };

    const loadInitialFactoryStatus = async () => {
      try {
        setFactoryStatus(await requestFactoryStatus());
      } catch {
        setFactoryStatus(null);
      }
    };

    void loadSourceNotes();
    void loadDraft();
    void loadInitialAssets();
    void loadSelection();
    void loadInitialFactoryStatus();
    void loadGenerationQueue();
    void loadAssetAudit();
    void Promise.resolve().then(() => loadFactoryHealth());
    void Promise.resolve().then(() => loadTextAudit());
    void Promise.resolve().then(() => loadApprovalCheckpoint());
  }, []);

  const updateDraftSlide = (slideId: string, patch: Partial<DraftSlide>) => {
    setDraft((current) => ({
      ...current,
      [slideId]: {
        ...current[slideId],
        ...patch,
        approved: patch.approved ?? false,
      },
    }));
    setTextFitPreview(null);
    setSaveStatus({ state: 'idle', message: 'Есть несохраненные правки.' });
    setApprovalCheckpointStatus({
      state: 'idle',
      message: 'Сохрани текст, чтобы checkpoint пересчитал готовность.',
    });
  };

  const saveSourceNotes = async () => {
    setSourceStatus({ state: 'loading', message: 'Сохраняю source-notes.md...' });

    try {
      const response = await fetch('/api/diary-factory/source-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: sourceNotes }),
      });
      const payload = (await response.json()) as SourceNotesPayload;

      if (!response.ok || !payload.ok || typeof payload.content !== 'string') {
        throw new Error(payload.error ?? 'Не получилось сохранить сырье дня.');
      }

      setSourceNotes(payload.content);
      setSourceStatus({ state: 'success', message: 'Сырье дня сохранено в source-notes.md.' });
      void loadFactoryStatus();
      void loadFactoryHealth();
    } catch (error) {
      setSourceStatus({
        state: 'error',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка сохранения сырья.',
      });
    }
  };

  const applyTextVariant = (slideId: string, variantId: string) => {
    const slide = diaryEntry.slides.find((item) => item.id === slideId);
    const variant = slide?.textVariants.find((item) => item.id === variantId);
    if (!variant) return;

    updateDraftSlide(slideId, {
      heading: variant.heading,
      text: variant.text,
      variantId: variant.id,
      approved: false,
    });
  };

  const buildApprovalDraft = (approved: boolean, current: DraftState = draft): DraftState =>
    Object.fromEntries(
      diaryEntry.slides.map((slide) => {
        const existing = current[slide.id];

        return [
          slide.id,
          {
            heading: existing?.heading ?? slide.textVariants[0]?.heading ?? slide.title,
            text: existing?.text ?? slide.textVariants[0]?.text ?? slide.text,
            variantId: existing?.variantId ?? slide.textVariants[0]?.id,
            approved,
          },
        ];
      }),
    );

  const setAllTextApproval = (approved: boolean) => {
    setDraft((current) => buildApprovalDraft(approved, current));
    setSaveStatus({
      state: 'idle',
      message: approved
        ? 'Все тексты отмечены как утвержденные. Не забудь сохранить.'
        : 'Утверждение снято со всех текстов. Не забудь сохранить.',
    });
    setPlanStatus({
      state: 'idle',
      message: 'После утверждения текста можно подготовить промпты для генерации.',
    });
  };

  const writeGenerationPlan = async () => {
    const response = await fetch('/api/diary-factory/generation-plan', {
      method: 'POST',
    });
    const payload = (await response.json()) as {
      ok?: boolean;
      error?: string;
      plan?: string;
      promptCount?: number;
    };

    if (!response.ok || !payload.ok || !payload.plan) {
      throw new Error(payload.error ?? 'Не получилось подготовить generation-plan.');
    }

    return {
      plan: payload.plan,
      promptCount: payload.promptCount ?? 0,
    };
  };

  const persistDraft = async (slides: DraftState = draft) => {
    const response = await fetch('/api/diary-factory/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slides }),
    });
    const payload = (await response.json()) as { ok?: boolean; error?: string };

    if (!response.ok || !payload.ok) {
      throw new Error(payload.error ?? 'Не получилось сохранить текст.');
    }
  };

  const persistSelection = async () => {
    const response = await fetch('/api/diary-factory/selection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selected: validSelected }),
    });
    const payload = (await response.json()) as SelectionPayload;

    if (!response.ok || !payload.ok) {
      throw new Error(payload.error ?? 'Не получилось сохранить выбор визуалов.');
    }

    return {
      selected: payload.selected ?? {},
      rejected: payload.rejected ?? {},
    };
  };

  const saveDraft = async () => {
    setSaveStatus({ state: 'loading', message: 'Сохраняю draft.json...' });

    try {
      await persistDraft();
      void loadFactoryStatus();
      void loadFactoryHealth();
      void loadGenerationQueue();
      void loadTextAudit();
      void loadApprovalCheckpoint();
      setSaveStatus({ state: 'success', message: 'Текст сохранен в draft.json.' });
    } catch (error) {
      setSaveStatus({
        state: 'error',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка сохранения.',
      });
    }
  };

  const prepareGenerationPlan = async () => {
    if (!allTextApproved) {
      setPlanStatus({
        state: 'error',
        message: 'Сначала утверди текст всех слайдов.',
      });
      return;
    }

    setPlanStatus({ state: 'loading', message: 'Сохраняю текст и готовлю промпты...' });

    try {
      await persistDraft();
      setSaveStatus({ state: 'success', message: 'Текст сохранен в draft.json.' });

      const payload = await writeGenerationPlan();

      setPlanStatus({
        state: 'success',
        message: 'Промпты готовы. Картинки не сгенерированы.',
        plan: payload.plan,
        promptCount: payload.promptCount ?? 0,
      });
      void loadAssets();
      void loadFactoryStatus();
      void loadFactoryHealth();
      void loadGenerationQueue();
      void loadTextAudit();
      void loadApprovalCheckpoint();
    } catch (error) {
      setPlanStatus({
        state: 'error',
        message:
          error instanceof Error ? error.message : 'Неизвестная ошибка подготовки промптов.',
      });
    }
  };

  const approveAllAndPrepareGenerationPlan = async () => {
    const nextDraft = buildApprovalDraft(true);

    setDraft(nextDraft);
    setSaveStatus({ state: 'loading', message: 'Утверждаю весь текст и сохраняю draft.json...' });
    setPlanStatus({ state: 'loading', message: 'Готовлю prompt plan без генерации картинок...' });

    try {
      await persistDraft(nextDraft);
      setSaveStatus({ state: 'success', message: 'Все 8 текстов утверждены и сохранены.' });

      const payload = await writeGenerationPlan();

      setPlanStatus({
        state: 'success',
        message: 'Промпты готовы. Дальше можно генерировать 4 варианта на каждый слайд.',
        plan: payload.plan,
        promptCount: payload.promptCount ?? 0,
      });
      void loadAssets();
      void loadFactoryStatus();
      void loadFactoryHealth();
      void loadGenerationQueue();
      void loadTextAudit();
      void loadApprovalCheckpoint();
    } catch (error) {
      setPlanStatus({
        state: 'error',
        message:
          error instanceof Error ? error.message : 'Неизвестная ошибка подготовки prompt plan.',
      });
      setSaveStatus({
        state: 'error',
        message:
          error instanceof Error ? error.message : 'Неизвестная ошибка утверждения текста.',
      });
    }
  };

  const chooseVariant = (slideId: string, variantId: string) => {
    setSelected((current) => ({ ...current, [slideId]: variantId }));
    setSelectionStatus({ state: 'idle', message: 'Есть несохраненный выбор визуалов.' });
    setAssembleStatus({
      state: 'idle',
      message: 'Выбор изменился. Можно собрать новую final-папку.',
    });
  };

  const saveSelection = async () => {
    setSelectionStatus({ state: 'loading', message: 'Сохраняю visual-selection.json...' });

    try {
      const result = await persistSelection();
      setSelected(result.selected);
      const rejectedCount = Object.keys(result.rejected).length;
      setSelectionStatus({
        state: 'success',
        message:
          rejectedCount > 0
            ? `Выбор сохранен. Отброшено неготовых вариантов: ${rejectedCount}.`
            : 'Выбор визуалов сохранен в visual-selection.json.',
      });
      void loadFactoryStatus();
      void loadFactoryHealth();
      void loadGenerationQueue();
    } catch (error) {
      setSelectionStatus({
        state: 'error',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка сохранения выбора.',
      });
    }
  };

  const canAssemble =
    allTextApproved && allVisualVariantsReady && allVisualAssetsOk && allFinalSlidesSelected;

  const assembleCarousel = async () => {
    if (!allTextApproved) {
      setAssembleStatus({
        state: 'error',
        message: 'Сначала утверди текст всех слайдов.',
      });
      return;
    }
    if (!allVisualVariantsReady) {
      setAssembleStatus({
        state: 'error',
        message: `Сначала дождись всех визуальных вариантов: ${readyVariantCount} / ${expectedVariantCount}.`,
      });
      return;
    }
    if (!allVisualAssetsOk) {
      setAssembleStatus({
        state: 'error',
        message: `Сначала исправь PNG не в 3:4: ${assetAudit?.failedCount ?? 0}.`,
      });
      return;
    }
    if (!allFinalSlidesSelected) {
      setAssembleStatus({
        state: 'error',
        message: `Выбери по одному визуалу для каждого слайда: ${selectedCount} / ${diaryEntry.slides.length}.`,
      });
      return;
    }

    setAssembleStatus({ state: 'loading', message: 'Сохраняю текст и собираю final-папку...' });

    try {
      await persistDraft();
      const selectionResult = await persistSelection();
      setSelected(selectionResult.selected);
      setSaveStatus({ state: 'success', message: 'Текст сохранен в draft.json.' });
      setSelectionStatus({
        state: 'success',
        message: 'Выбор визуалов сохранен в visual-selection.json.',
      });

      const response = await fetch('/api/diary-factory/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected: selectionResult.selected }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        finalDir?: string;
        files?: Array<{ file: string }>;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? 'Не получилось собрать карусель.');
      }

      setAssembleStatus({
        state: 'success',
        message: `Готово: ${payload.finalDir}`,
        files: payload.files?.map((item) => item.file) ?? [],
      });
      void loadFactoryStatus();
      void loadFactoryHealth();
      void loadGenerationQueue();
    } catch (error) {
      setAssembleStatus({
        state: 'error',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка сборки.',
      });
    }
  };

  return (
    <main className="min-h-dvh bg-[#efe6d0] text-[#202018]">
      <header className="sticky top-0 z-40 border-b-2 border-[#202018] bg-[#f7edd7]/92 px-4 py-3 backdrop-blur md:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8f1f1f]">
              {carouselFactoryConfig.navLabel}
            </div>
            <h1 className="mt-1 font-display text-3xl font-black leading-none md:text-5xl">
              {carouselFactoryConfig.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-5 text-[#202018]/62">
              Сейчас в работе: {diaryEntry.title}. Старый namespace API пока сохранен как стабильный
              конвейер.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Counter label="текст" value={`${approvedCount} / ${diaryEntry.slides.length}`} />
            <Counter label="выбор" value={`${selectedCount} / ${diaryEntry.slides.length}`} />
            <Counter label="слоты" value={`${readyVariantCount} / ${expectedVariantCount}`} />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="border-2 border-[#202018] bg-[#fff8e9] p-4 shadow-[5px_5px_0_#202018]">
            <h2 className="font-display text-2xl font-black">Флоу</h2>
            <p className="mt-3 max-w-3xl text-lg leading-7 text-[#202018]/78">
              {carouselFactoryConfig.description}
            </p>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {carouselFactoryConfig.flow.map((step, index) => (
                <div
                  key={step}
                  className="border border-[#202018]/15 bg-[#f7edd7] px-3 py-2 font-mono text-xs leading-5 text-[#202018]/72"
                >
                  {String(index + 1).padStart(2, '0')} / {step}
                </div>
              ))}
            </div>
          </div>
          <div className="border-2 border-[#202018] bg-[#202018] p-4 text-[#fff8e9] shadow-[5px_5px_0_#8f1f1f]">
            <h2 className="font-display text-2xl font-black">Правило стиля</h2>
            <p className="mt-3 text-sm leading-6 text-[#fff8e9]/74">
              Акцент красный. Скотч и “пластыри” не являются обязательным элементом:
              используем редко, когда это работает на страницу.
            </p>
            <div className="mt-4 space-y-2">
              {carouselFactoryConfig.voiceRules.map((rule) => (
                <div
                  key={rule}
                  className="border border-[#fff8e9]/16 bg-[#fff8e9]/8 px-3 py-2 font-mono text-[10px] uppercase leading-4 tracking-[0.12em] text-[#fff8e9]/64"
                >
                  {rule}
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="mb-10 border-2 border-[#202018] bg-[#fff8e9] p-4 shadow-[5px_5px_0_#202018]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8f1f1f]">
                presets
              </div>
              <h2 className="mt-1 font-display text-3xl font-black">Форматы каруселей</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#202018]/66">
                Дневник остается первым рабочим пресетом. Тем же конвейером можно собирать
                Receptor, запуск, кейс или любую следующую историю.
              </p>
            </div>
            <div className="border-2 border-[#202018] bg-[#f7edd7] px-4 py-3 text-right">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#202018]/54">
                active deck
              </div>
              <div className="mt-1 font-mono text-sm font-black text-[#202018]">
                {carouselFactoryConfig.activeEntrySlug}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {carouselFactoryConfig.presets.map((preset) => (
              <FactoryPresetCard key={preset.id} preset={preset} />
            ))}
          </div>

          <div className="mt-5 border-t-2 border-dashed border-[#202018]/25 pt-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8f1f1f]">
              next queue
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {carouselFactoryConfig.nextQueue.map((item) => (
                <div key={item.id} className="border-2 border-[#202018] bg-[#f7edd7] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8f1f1f]">
                        {item.label}
                      </div>
                      <h3 className="mt-1 font-display text-2xl font-black">{item.title}</h3>
                    </div>
                    <div className="border border-[#202018]/20 bg-[#fff8e9] px-2 py-1 font-mono text-[10px] font-black uppercase tracking-[0.12em] text-[#202018]/70">
                      {item.generationLocked ? 'generation locked' : item.status}
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {item.sourceNeeds.map((need) => (
                      <div
                        key={need}
                        className="border border-[#202018]/15 bg-[#fff8e9] px-3 py-2 text-sm leading-5 text-[#202018]/72"
                      >
                        {need}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-10 border-2 border-[#202018] bg-[#fff8e9] p-4 shadow-[5px_5px_0_#202018]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8f1f1f]">
                source notes
              </div>
              <h2 className="mt-1 font-display text-3xl font-black">Сырье дня</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#202018]/66">
                Здесь лежит голосовая расшифровка и отчеты агентов. Это черновая правда выпуска:
                из нее собираем 4 варианта заголовков и текстов, но сами слайды она не утверждает.
              </p>
            </div>
            <button
              type="button"
              onClick={saveSourceNotes}
              disabled={sourceStatus.state === 'loading'}
              className="min-h-10 border-2 border-[#202018] bg-[#8f1f1f] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#fff8e9] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#202018]/24 disabled:text-[#202018]/45 disabled:hover:translate-y-0"
            >
              Сохранить сырье
            </button>
          </div>

          <label className="mt-4 block">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#202018]/54">
              source-notes.md
            </span>
            <textarea
              value={sourceNotes}
              onChange={(event) => {
                setSourceNotes(event.target.value);
                setSourceStatus({ state: 'idle', message: 'Есть несохраненные правки сырья.' });
              }}
              rows={13}
              className="mt-2 w-full resize-y border-2 border-[#202018] bg-[#f7edd7] px-3 py-3 font-mono text-sm leading-6 outline-none focus:border-[#8f1f1f]"
            />
          </label>

          <div className="mt-4">
            <StatusBox status={sourceStatus} />
          </div>

          <div className="mt-4 border-2 border-[#202018]/15 bg-[#f7edd7] p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8f1f1f]">
              agent append endpoint
            </div>
            <pre className="mt-2 overflow-auto whitespace-pre-wrap border border-[#202018]/15 bg-[#fff8e9] p-3 font-mono text-xs leading-5 text-[#202018]/72">
              {`POST /api/diary-factory/agent-note
{
  "agent": "receptor-agent",
  "title": "Receptor progress",
  "summary": "Short human-readable update.",
  "bullets": ["what changed", "what is blocked", "what matters for this carousel"]
}`}
            </pre>
          </div>
        </section>

        <section className="mb-10 border-2 border-[#202018] bg-[#fff8e9] p-4 shadow-[5px_5px_0_#202018]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8f1f1f]">
                factory status
              </div>
              <h2 className="mt-1 font-display text-3xl font-black">
                {factoryStatus?.phase ?? 'проверяю состояние'}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#202018]/66">
                {factoryStatus?.nextAction ?? 'Читаю draft, variants и сохраненный выбор.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/api/carousel-factory"
                target="_blank"
                className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#8f1f1f] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#fff8e9] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Factory config
              </a>
              <a
                href="/api/diary-factory/handoff"
                target="_blank"
                className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#8f1f1f] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#fff8e9] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Agent handoff
              </a>
              <a
                href="/api/diary-factory/review-packet"
                target="_blank"
                className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#8f1f1f] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#fff8e9] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Review packet
              </a>
              <a
                href="/api/diary-factory/health"
                target="_blank"
                className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#8f1f1f] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#fff8e9] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Factory health
              </a>
              <a
                href="/api/diary-factory/visual-contract"
                target="_blank"
                className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#fff8e9] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Visual contract
              </a>
              <a
                href="/api/diary-factory/reference-audit"
                target="_blank"
                className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#fff8e9] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Reference audit
              </a>
              <a
                href="/api/diary-factory/script"
                target="_blank"
                className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#fff8e9] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Script JSON
              </a>
              <a
                href="/api/diary-factory/storyboard"
                target="_blank"
                className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#fff8e9] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Storyboard
              </a>
              <a
                href="/api/diary-factory/approval-sheet"
                target="_blank"
                className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#fff8e9] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Approval sheet
              </a>
              <a
                href="/api/diary-factory/approval-checkpoint"
                target="_blank"
                className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#fff8e9] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Approval checkpoint
              </a>
              <a
                href="/api/diary-factory/text-variants"
                target="_blank"
                className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#fff8e9] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Text variants
              </a>
              <a
                href="/api/diary-factory/text-audit"
                target="_blank"
                className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#fff8e9] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Text audit
              </a>
              <a
                href="/api/diary-factory/text-fit"
                target="_blank"
                className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#fff8e9] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Text fit
              </a>
              <a
                href="/api/diary-factory/prompts"
                target="_blank"
                className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#fff8e9] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Prompt preview
              </a>
              <a
                href="/api/diary-factory/prompt-pack"
                target="_blank"
                className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#fff8e9] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Prompt pack
              </a>
              <a
                href="/api/diary-factory/prompt-pack?format=jsonl"
                target="_blank"
                className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#fff8e9] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Prompt JSONL
              </a>
              <a
                href="/api/diary-factory/generation-plan-preview"
                target="_blank"
                className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#fff8e9] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Plan preview
              </a>
              <a
                href="/api/diary-factory/generation-queue"
                target="_blank"
                className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#fff8e9] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Generation queue
              </a>
              <a
                href="/api/diary-factory/generation-brief"
                target="_blank"
                className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#fff8e9] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Markdown brief
              </a>
              <a
                href="/api/diary-factory/asset-audit"
                target="_blank"
                className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#fff8e9] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Asset audit
              </a>
              <a
                href="/api/diary-factory/asset-intake-batch"
                target="_blank"
                className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#fff8e9] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Batch intake
              </a>
              <a
                href="/api/diary-factory/visual-board"
                target="_blank"
                className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#fff8e9] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Visual board
              </a>
              <a
                href="/api/diary-factory/production-manifest"
                target="_blank"
                className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#fff8e9] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Production manifest
              </a>
              <a
                href="/api/diary-factory/production-manifest?format=csv"
                target="_blank"
                className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#fff8e9] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Manifest CSV
              </a>
              <a
                href="/api/diary-factory/final-export"
                target="_blank"
                className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#fff8e9] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Final export
              </a>
              <button
                type="button"
                onClick={() => {
                  void loadFactoryStatus();
                  void loadFactoryHealth();
                  void loadApprovalCheckpoint();
                }}
                className="min-h-10 border-2 border-[#202018] bg-[#f7edd7] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Обновить статус
              </button>
            </div>
          </div>
          {factoryStatus && (
            <>
              <div className="mt-4 grid gap-3 md:grid-cols-5">
                <StatusMetric
                  label="текст"
                  value={`${factoryStatus.text.approvedCount} / ${factoryStatus.text.total}`}
                />
                <StatusMetric
                  label="визуалы"
                  value={`${factoryStatus.visuals.readyVariantCount} / ${factoryStatus.visuals.expectedVariantCount}`}
                />
                <StatusMetric
                  label="выбор"
                  value={`${factoryStatus.selection.selectedCount} / ${factoryStatus.text.total}`}
                />
                <StatusMetric
                  label="генерация"
                  value={factoryStatus.readiness?.readyForImageGeneration ? 'открыта' : 'закрыта'}
                />
                <StatusMetric
                  label="артефакты"
                  value={Object.entries(factoryStatus.artifacts)
                    .filter(([, exists]) => exists)
                    .map(([name]) => name)
                    .join(', ') || 'нет'}
                />
              </div>
              {factoryStatus.readiness?.blockedReason && (
                <div className="mt-3 border-2 border-[#202018]/15 bg-[#f7edd7] p-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8f1f1f]">
                    current gate
                  </div>
                  <div className="mt-1 font-mono text-xs uppercase tracking-[0.12em] text-[#202018]/70">
                    {factoryStatus.readiness.blockedReason}
                  </div>
                </div>
              )}
              <div className="mt-3 border-2 border-[#202018] bg-[#fff8e9] p-3 shadow-[3px_3px_0_#202018]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8f1f1f]">
                      factory health
                    </div>
                    <div className="mt-1 text-sm leading-6 text-[#202018]/66">
                      Живой чеклист гейтов: текст, промпты, визуалы, выбор и финальная сборка.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void loadFactoryHealth()}
                    className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#f7edd7] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
                  >
                    Проверить health
                  </button>
                </div>

                <div className="mt-3">
                  <StatusBox status={healthStatus} />
                </div>

                {factoryHealth && (
                  <>
                    <div className="mt-3 grid gap-2 md:grid-cols-3">
                      <StatusMetric
                        label="complete"
                        value={factoryHealth.complete ? 'да' : 'нет'}
                      />
                      <StatusMetric
                        label="current"
                        value={factoryHealth.currentGate?.id ?? 'ready'}
                      />
                      <StatusMetric
                        label="failed"
                        value={`${factoryHealth.gates?.filter((gate) => gate.required && !gate.ok).length ?? 0} gates`}
                      />
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {(factoryHealth.gates ?? []).map((gate) => (
                        <div
                          key={gate.id}
                          className={`border-2 p-3 ${
                            gate.ok
                              ? 'border-[#2f6b4f] bg-[#eef8e7] text-[#202018]'
                              : 'border-[#8f1f1f] bg-[#fff1f1] text-[#8f1f1f]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="font-mono text-[10px] font-black uppercase tracking-[0.16em]">
                              {gate.id}
                            </div>
                            <div className="font-mono text-[10px] font-black uppercase tracking-[0.14em]">
                              {gate.ok ? 'ok' : 'wait'}
                            </div>
                          </div>
                          <div className="mt-2 text-sm font-black leading-5">{gate.label}</div>
                          <div className="mt-2 font-mono text-[10px] leading-4 opacity-75">
                            {gate.evidence}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="mt-3 border-2 border-[#202018] bg-[#fff8e9] p-3 shadow-[3px_3px_0_#202018]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8f1f1f]">
                      review packet
                    </div>
                    <div className="mt-1 text-sm leading-6 text-[#202018]/66">
                      Один read-only пакет для проверки перед генерацией: текст, переносы, слоты PNG,
                      блокировки и ссылки для агентов.
                    </div>
                  </div>
                  <a
                    href="/api/diary-factory/review-packet"
                    target="_blank"
                    className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#f7edd7] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
                  >
                    Открыть JSON
                  </a>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  <StatusMetric
                    label="промпты"
                    value={factoryStatus.readiness?.readyForPromptPlan ? 'открыты' : 'закрыты'}
                  />
                  <StatusMetric
                    label="очередь"
                    value={`${queuePreview?.missingCount ?? factoryStatus.visuals.missingCount} задач`}
                  />
                  <StatusMetric
                    label="сборка"
                    value={factoryStatus.readiness?.readyForAssembly ? 'готова' : 'ждет'}
                  />
                </div>
              </div>
              {factoryStatus.visuals.missingCount > 0 && (
                <div className="mt-3 border-2 border-[#202018]/15 bg-[#f7edd7] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8f1f1f]">
                      missing visual slots · {factoryStatus.visuals.missingCount}
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#202018]/45">
                      показываю первые 8
                    </div>
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {factoryStatus.visuals.missing.slice(0, 8).map((slot) => (
                      <div
                        key={`${slot.slideId}-${slot.variantId}`}
                        className="border border-[#202018]/15 bg-[#fff8e9] px-2 py-2 font-mono text-xs text-[#202018]/72"
                      >
                        {slot.fileName}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <section className="mb-10 border-2 border-[#202018] bg-[#fff8e9] p-4 shadow-[5px_5px_0_#202018]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8f1f1f]">
                queue preview
              </div>
              <h2 className="mt-1 font-display text-3xl font-black">Очередь генерации</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#202018]/66">
                Это список PNG, которых пока нет в variants. Блок только читает очередь и проверяет
                промпты: формат 3:4, красные акценты, без башни, без лишних рук.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadGenerationQueue()}
              className="min-h-10 border-2 border-[#202018] bg-[#f7edd7] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
            >
              Обновить очередь
            </button>
          </div>

          <div className="mt-4">
            <StatusBox status={queueStatus} />
          </div>

          {queuePreview && (
            <>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <StatusMetric
                  label="к генерации"
                  value={`${queuePreview.missingCount ?? 0} PNG`}
                />
                <StatusMetric
                  label="нет файла"
                  value={`${queuePreview.missingAssetCount ?? queuePreview.missingCount ?? 0} PNG`}
                />
                <StatusMetric
                  label="переделать"
                  value={`${queuePreview.invalidAssetCount ?? 0} PNG`}
                />
                <StatusMetric
                  label="аудит"
                  value={queuePreview.audit?.ok ? 'правила ок' : 'есть правки'}
                />
              </div>
              {queuePreview.readyForGeneration === false && (
                <div className="mt-3 border-2 border-[#8f1f1f] bg-[#fff1f1] p-3 text-[#8f1f1f]">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em]">
                    prompts locked
                  </div>
                  <div className="mt-1 font-mono text-xs uppercase tracking-[0.12em]">
                    {queuePreview.blockedReason ?? 'Сначала утверди текст всех слайдов.'}
                  </div>
                </div>
              )}

              <div className="mt-3 grid gap-3 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="border-2 border-[#202018]/15 bg-[#f7edd7] p-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8f1f1f]">
                    prompt checks
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(queuePreview.audit?.checks ?? []).map((check) => (
                      <span
                        key={check}
                        className="border border-[#202018]/15 bg-[#fff8e9] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#202018]/62"
                      >
                        {check}
                      </span>
                    ))}
                  </div>
                  {queuePreview.audit && !queuePreview.audit.ok && (
                    <pre className="mt-3 whitespace-pre-wrap border border-[#8f1f1f]/30 bg-[#fff1f1] p-2 font-mono text-xs text-[#8f1f1f]">
                      {queuePreview.audit.failed
                        .map((item) => `prompt ${item.promptIndex}: ${item.rule}`)
                        .join('\n')}
                    </pre>
                  )}
                </div>

                <div className="border-2 border-[#202018]/15 bg-[#f7edd7] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8f1f1f]">
                      первые слоты
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#202018]/45">
                      {queuePreview.writesFiles ? 'пишет файлы' : 'read only'}
                    </div>
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {(queuePreview.queue ?? []).slice(0, 9).map((item) => (
                      <div
                        key={`${item.slideId}-${item.variantId}`}
                        className="border border-[#202018]/15 bg-[#fff8e9] px-2 py-2"
                      >
                        <div className="font-mono text-xs font-black text-[#202018]">
                          {item.outputFile}
                        </div>
                        <div className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-[#202018]/48">
                          {item.reason ?? item.label} · {item.heading}
                        </div>
                        {item.issue && (
                          <div className="mt-1 font-mono text-[10px] leading-4 text-[#8f1f1f]">
                            {item.issue}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8f1f1f]">
                step 01
              </div>
              <h2 className="font-display text-4xl font-black">Текст слайдов</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setAllTextApproval(true)}
                disabled={approvedCount === diaryEntry.slides.length}
                className="min-h-12 border-2 border-[#202018] bg-[#2f6b4f] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#fff8e9] shadow-[4px_4px_0_#202018] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#202018]/18 disabled:text-[#202018]/45 disabled:hover:translate-y-0"
              >
                Утвердить все
              </button>
              <button
                type="button"
                onClick={() => setAllTextApproval(false)}
                disabled={approvedCount === 0}
                className="min-h-12 border-2 border-[#202018] bg-[#f7edd7] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[4px_4px_0_#202018] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#202018]/18 disabled:text-[#202018]/45 disabled:hover:translate-y-0"
              >
                Снять все
              </button>
              <button
                type="button"
                onClick={saveDraft}
                disabled={saveStatus.state === 'loading'}
                className="min-h-12 border-2 border-[#202018] bg-[#8f1f1f] px-5 font-mono text-sm font-black uppercase tracking-[0.14em] text-[#fff8e9] shadow-[4px_4px_0_#202018] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#202018]/24 disabled:text-[#202018]/45 disabled:hover:translate-y-0"
              >
                Сохранить текст
              </button>
              <button
                type="button"
                onClick={() => void approveAllAndPrepareGenerationPlan()}
                disabled={saveStatus.state === 'loading' || planStatus.state === 'loading'}
                className="min-h-12 border-2 border-[#202018] bg-[#8f1f1f] px-5 font-mono text-sm font-black uppercase tracking-[0.14em] text-[#fff8e9] shadow-[4px_4px_0_#202018] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#202018]/24 disabled:text-[#202018]/45 disabled:hover:translate-y-0"
              >
                Утвердить + промпты
              </button>
            </div>
          </div>

          <StatusBox status={saveStatus} />

          <div className="mt-4 border-2 border-[#202018] bg-[#fff8e9] p-4 shadow-[4px_4px_0_#202018]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8f1f1f]">
                  approval checkpoint
                </div>
                <h3 className="mt-1 font-display text-2xl font-black">
                  {approvalCheckpoint?.ready ? 'Можно готовить промпты' : 'Проверка перед промптами'}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#202018]/66">
                  Dry-run показывает, что произойдет при явном утверждении: какие тексты станут approved и сколько prompt files будет подготовлено.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void loadApprovalCheckpoint()}
                  disabled={approvalCheckpointStatus.state === 'loading'}
                  className="min-h-10 border-2 border-[#202018] bg-[#f7edd7] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#202018]/18 disabled:text-[#202018]/45 disabled:hover:translate-y-0"
                >
                  Проверить
                </button>
                <a
                  href="/api/diary-factory/approval-checkpoint"
                  target="_blank"
                  className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#f7edd7] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
                >
                  Dry-run JSON
                </a>
              </div>
            </div>

            <div className="mt-4">
              <StatusBox status={approvalCheckpointStatus} />
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <StatusMetric
                label="готовность"
                value={approvalCheckpoint?.ready ? 'открыт' : 'закрыт'}
              />
              <StatusMetric
                label="утвердит"
                value={`${approvalCheckpoint?.wouldApproveCount ?? 0} / ${approvalCheckpoint?.totalSlides ?? diaryEntry.slides.length}`}
              />
              <StatusMetric
                label="промпты"
                value={`${approvalCheckpoint?.promptCount ?? 0} / 32`}
              />
              <StatusMetric
                label="запись"
                value={approvalCheckpoint?.writesFiles ? 'пишет' : 'dry-run'}
              />
            </div>

            {approvalCheckpoint?.blockedReason && (
              <div className="mt-3 border-2 border-[#8f1f1f] bg-[#fff1f1] p-3 font-mono text-xs uppercase tracking-[0.12em] text-[#8f1f1f]">
                {approvalCheckpoint.blockedReason}
              </div>
            )}

            {approvalCheckpoint?.wouldWrite && approvalCheckpoint.wouldWrite.length > 0 && (
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                {approvalCheckpoint.wouldWrite.map((item) => (
                  <div
                    key={item}
                    className="border border-[#202018]/15 bg-[#f7edd7] px-2 py-2 font-mono text-xs text-[#202018]/72"
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 space-y-5">
            {diaryEntry.slides.map((slide) => {
              const current = draft[slide.id] ?? {
                heading: slide.title,
                text: slide.text,
                approved: false,
              };

              return (
                <article
                  key={slide.id}
                  className={`border-2 bg-[#fff8e9] p-4 shadow-[5px_5px_0_#202018] ${
                    current.approved ? 'border-[#2f6b4f]' : 'border-[#202018]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8f1f1f]">
                        {slide.id}
                      </div>
                      <h3 className="font-display text-2xl font-black">{slide.title}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateDraftSlide(slide.id, {
                          approved: !current.approved,
                        })
                      }
                      className={`min-h-10 border-2 border-[#202018] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] shadow-[3px_3px_0_#202018] ${
                        current.approved
                          ? 'bg-[#2f6b4f] text-[#fff8e9]'
                          : 'bg-[#f7edd7] text-[#202018]'
                      }`}
                    >
                      {current.approved ? 'утверждено' : 'утвердить'}
                    </button>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {slide.textVariants.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => applyTextVariant(slide.id, variant.id)}
                        className={`border-2 p-3 text-left transition hover:-translate-y-0.5 ${
                          current.variantId === variant.id
                            ? 'border-[#8f1f1f] bg-[#fff1f1]'
                            : 'border-[#202018]/20 bg-[#f7edd7]'
                        }`}
                      >
                        <div className="font-mono text-xs font-black uppercase tracking-[0.18em]">
                          вариант {variant.label}
                        </div>
                        <div className="mt-2 font-display text-xl font-black">{variant.heading}</div>
                        <p className="mt-2 whitespace-pre-line text-sm leading-5 text-[#202018]/66">
                          {variant.text}
                        </p>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-[0.42fr_1fr]">
                    <label className="block">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#202018]/54">
                        заголовок
                      </span>
                      <input
                        value={current.heading}
                        onChange={(event) =>
                          updateDraftSlide(slide.id, {
                            heading: event.target.value,
                          })
                        }
                        className="mt-2 min-h-12 w-full border-2 border-[#202018] bg-[#f7edd7] px-3 font-display text-xl font-black outline-none focus:border-[#8f1f1f]"
                      />
                    </label>
                    <label className="block">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#202018]/54">
                        текст
                      </span>
                      <textarea
                        value={current.text}
                        onChange={(event) =>
                          updateDraftSlide(slide.id, {
                            text: event.target.value,
                          })
                        }
                        rows={5}
                        className="mt-2 w-full resize-y border-2 border-[#202018] bg-[#f7edd7] px-3 py-2 text-lg leading-7 outline-none focus:border-[#8f1f1f]"
                      />
                    </label>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-10 border-2 border-[#202018] bg-[#202018] p-4 text-[#fff8e9] shadow-[5px_5px_0_#8f1f1f]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#e2574c]">
                script preview
              </div>
              <h2 className="mt-1 font-display text-3xl font-black">Сценарий карусели</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#fff8e9]/68">
                Это текущий текст всех слайдов. После утверждения он уйдет в промпты и финальный
                caption.
              </p>
            </div>
            <div className="border-2 border-[#fff8e9]/20 bg-[#fff8e9]/8 px-4 py-3 text-right">
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#fff8e9]/54">
                не утверждено
              </div>
              <div className="mt-1 font-mono text-sm font-black text-[#fff8e9]">
                {unapprovedSummary || 'нет'}
              </div>
            </div>
          </div>
          <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap border-2 border-[#fff8e9]/16 bg-[#11110d] p-4 font-mono text-sm leading-6 text-[#fff8e9]/82">
            {scriptPreview}
          </pre>
        </section>

        <section className="mt-4 border-2 border-[#202018] bg-[#fff8e9] p-4 shadow-[5px_5px_0_#202018]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8f1f1f]">
                text audit
              </div>
              <h2 className="mt-1 font-display text-2xl font-black">Читаемость кириллицы</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#202018]/66">
                Проверка не запрещает утверждение текста, но подсвечивает строки, которые могут
                стать мелкими или кривыми при генерации страницы.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void loadTextAudit()}
                className="min-h-10 border-2 border-[#202018] bg-[#f7edd7] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Проверить текст
              </button>
              <button
                type="button"
                onClick={() => void loadTextFit()}
                disabled={textFitStatus.state === 'loading'}
                className="min-h-10 border-2 border-[#202018] bg-[#f7edd7] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#202018]/18 disabled:text-[#202018]/45 disabled:hover:translate-y-0"
              >
                Предложить переносы
              </button>
              <button
                type="button"
                onClick={applyTextFit}
                disabled={!textFitPreview?.suggestions?.length}
                className="min-h-10 border-2 border-[#202018] bg-[#8f1f1f] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#fff8e9] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#202018]/18 disabled:text-[#202018]/45 disabled:hover:translate-y-0"
              >
                Применить
              </button>
              <button
                type="button"
                onClick={() => void applyTextFitAndSave()}
                disabled={!textFitPreview?.suggestions?.length || saveStatus.state === 'loading'}
                className="min-h-10 border-2 border-[#202018] bg-[#8f1f1f] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#fff8e9] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#202018]/18 disabled:text-[#202018]/45 disabled:hover:translate-y-0"
              >
                Apply + save
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <StatusMetric
              label="риск"
              value={textAudit?.ok ? 'нет' : `${textAudit?.failedCount ?? 0} слайд.`}
            />
            <StatusMetric label="лимит строки" value="34 символа" />
            <StatusMetric label="лимит объема" value="8 строк / 190 симв." />
          </div>

          <div className="mt-4">
            <StatusBox status={textAuditStatus} />
          </div>

          <div className="mt-3">
            <StatusBox status={textFitStatus} />
          </div>

          {textFitPreview?.suggestions && textFitPreview.suggestions.length > 0 && (
            <div className="mt-3 grid gap-2 lg:grid-cols-2">
              {textFitPreview.suggestions.map((item) => (
                <div
                  key={item.slideId}
                  className="border-2 border-[#202018]/15 bg-[#f7edd7] p-3"
                >
                  <div className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[#8f1f1f]">
                    {item.slideId} · переносы
                  </div>
                  <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap border border-[#202018]/15 bg-[#fff8e9] p-3 font-mono text-xs leading-5 text-[#202018]/78">
                    {item.suggestedText}
                  </pre>
                </div>
              ))}
            </div>
          )}

          {textAudit && textAudit.failed.length > 0 && (
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {textAudit.failed.map((item) => (
                <div
                  key={item.slideId}
                  className="border-2 border-[#8f1f1f] bg-[#fff1f1] p-3 text-[#8f1f1f]"
                >
                  <div className="font-mono text-xs font-black uppercase tracking-[0.16em]">
                    {item.slideId}
                  </div>
                  <div className="mt-2 font-mono text-xs leading-5">
                    {item.lineCount} строк · max {item.maxLineLength} · {item.totalChars} симв.
                  </div>
                  <div className="mt-2 space-y-1 font-mono text-[10px] uppercase tracking-[0.1em]">
                    {item.warnings.map((warning) => (
                      <div key={warning}>{warning}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-12">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8f1f1f]">
                step 02
              </div>
              <h2 className="font-display text-4xl font-black">План генерации</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#202018]/66">
                Когда все тексты утверждены, фабрика сохраняет 4 промпта на каждый слайд.
                Это подготовка к генерации, без создания новых картинок.
              </p>
            </div>
            <button
              type="button"
              onClick={prepareGenerationPlan}
              disabled={!allTextApproved || planStatus.state === 'loading'}
              className="min-h-12 border-2 border-[#202018] bg-[#8f1f1f] px-5 font-mono text-sm font-black uppercase tracking-[0.14em] text-[#fff8e9] shadow-[4px_4px_0_#202018] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#202018]/24 disabled:text-[#202018]/45 disabled:hover:translate-y-0"
            >
              Подготовить промпты
            </button>
          </div>

          <PlanStatusBox status={planStatus} allTextApproved={allTextApproved} />
        </section>

        <section className="mt-12">
          <div className="mb-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8f1f1f]">
                  step 03
                </div>
                <h2 className="font-display text-4xl font-black">Визуальные варианты</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#202018]/66">
                  Новые картинки не генерируем автоматически. Когда PNG появляются в папке
                  variants, фабрика сама подхватывает их по именам slide-01-a.png.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadAssets({ showLoading: true })}
                disabled={assetStatus.state === 'loading'}
                className="min-h-12 border-2 border-[#202018] bg-[#f7edd7] px-5 font-mono text-sm font-black uppercase tracking-[0.14em] text-[#202018] shadow-[4px_4px_0_#202018] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#202018]/18 disabled:text-[#202018]/45 disabled:hover:translate-y-0"
              >
                Обновить варианты
              </button>
            </div>
          </div>

          <StatusBox status={assetStatus} />

          <div className="mt-4 border-2 border-[#202018] bg-[#fff8e9] p-4 shadow-[5px_5px_0_#202018]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8f1f1f]">
                  asset intake
                </div>
                <h3 className="mt-1 font-display text-2xl font-black">Прием PNG в слот</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#202018]/66">
                  Загруженный файл сохраняется строго как slide-XX-a.png в variants и проходит
                  проверку PNG + 3:4 до записи.
                </p>
              </div>
              <a
                href="/api/diary-factory/asset-intake"
                target="_blank"
                className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#f7edd7] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Intake API
              </a>
              <a
                href="/api/diary-factory/asset-intake-batch"
                target="_blank"
                className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#f7edd7] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Batch intake
              </a>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_0.65fr_1.5fr_auto]">
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#202018]/54">
                  слайд
                </span>
                <select
                  value={intakeSlot.slideId}
                  onChange={(event) =>
                    setIntakeSlot((current) => ({ ...current, slideId: event.target.value }))
                  }
                  className="mt-1 h-11 w-full border-2 border-[#202018] bg-[#f7edd7] px-3 font-mono text-sm font-black outline-none focus:border-[#8f1f1f]"
                >
                  {diaryEntry.slides.map((slide) => (
                    <option key={slide.id} value={slide.id}>
                      {slide.id}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#202018]/54">
                  вариант
                </span>
                <select
                  value={intakeSlot.variantId}
                  onChange={(event) =>
                    setIntakeSlot((current) => ({ ...current, variantId: event.target.value }))
                  }
                  className="mt-1 h-11 w-full border-2 border-[#202018] bg-[#f7edd7] px-3 font-mono text-sm font-black uppercase outline-none focus:border-[#8f1f1f]"
                >
                  {visualVariantIds.map((variantId) => (
                    <option key={variantId} value={variantId}>
                      {variantId.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#202018]/54">
                  PNG файл
                </span>
                <input
                  type="file"
                  accept="image/png"
                  onChange={(event) => setIntakeFile(event.target.files?.[0] ?? null)}
                  className="mt-1 h-11 w-full border-2 border-[#202018] bg-[#f7edd7] px-3 py-2 font-mono text-xs file:mr-3 file:border-0 file:bg-[#202018] file:px-3 file:py-1 file:font-mono file:text-xs file:font-black file:uppercase file:tracking-[0.12em] file:text-[#fff8e9]"
                />
              </label>
              <button
                type="button"
                onClick={() => void uploadIntakeAsset()}
                disabled={!intakeFile || intakeStatus.state === 'loading'}
                className="mt-5 min-h-11 border-2 border-[#202018] bg-[#8f1f1f] px-5 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#fff8e9] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#202018]/18 disabled:text-[#202018]/45 disabled:hover:translate-y-0"
              >
                Принять PNG
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <StatusMetric
                label="слот"
                value={`${intakeSlot.slideId}-${intakeSlot.variantId}.png`}
              />
              <StatusMetric label="формат" value="PNG · 3:4" />
              <StatusMetric label="запись" value="variants/" />
            </div>

            <div className="mt-4">
              <StatusBox status={intakeStatus} />
            </div>

            <div className="mt-5 border-t-2 border-dashed border-[#202018]/25 pt-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8f1f1f]">
                    batch intake
                  </div>
                  <h4 className="mt-1 font-display text-xl font-black">Пачка PNG по именам</h4>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#202018]/66">
                    Для массового приема файлы должны называться строго как slide-01-a.png, slide-01-b.png и дальше до slide-08-d.png.
                    Фабрика сохранит только PNG в формате 3:4, остальные вернет в отклоненные.
                  </p>
                </div>
                <a
                  href="/api/diary-factory/asset-intake-batch"
                  target="_blank"
                  className="grid min-h-10 place-items-center border-2 border-[#202018] bg-[#f7edd7] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
                >
                  Batch API
                </a>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-[1.5fr_auto]">
                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#202018]/54">
                    PNG файлы
                  </span>
                  <input
                    key={batchIntakeFiles.length === 0 ? 'batch-empty' : 'batch-filled'}
                    type="file"
                    accept="image/png"
                    multiple
                    onChange={(event) =>
                      setBatchIntakeFiles(Array.from(event.target.files ?? []))
                    }
                    className="mt-1 h-11 w-full border-2 border-[#202018] bg-[#f7edd7] px-3 py-2 font-mono text-xs file:mr-3 file:border-0 file:bg-[#202018] file:px-3 file:py-1 file:font-mono file:text-xs file:font-black file:uppercase file:tracking-[0.12em] file:text-[#fff8e9]"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void uploadBatchIntakeAssets()}
                  disabled={batchIntakeFiles.length === 0 || batchIntakeStatus.state === 'loading'}
                  className="mt-5 min-h-11 border-2 border-[#202018] bg-[#8f1f1f] px-5 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#fff8e9] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#202018]/18 disabled:text-[#202018]/45 disabled:hover:translate-y-0"
                >
                  Принять пачку
                </button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <StatusMetric label="выбрано" value={`${batchIntakeFiles.length} файл(ов)`} />
                <StatusMetric label="слоты" value="32 PNG" />
                <StatusMetric label="имя" value="slide-XX-a.png" />
              </div>

              {batchIntakeFiles.length > 0 && (
                <div className="mt-3 max-h-24 overflow-auto border border-[#202018]/15 bg-[#f7edd7] p-3 font-mono text-xs leading-5 text-[#202018]/70">
                  {batchIntakeFiles.map((file) => file.name).join(' · ')}
                </div>
              )}

              <div className="mt-4">
                <StatusBox status={batchIntakeStatus} />
              </div>
            </div>
          </div>

          <div className="mt-4 border-2 border-[#202018] bg-[#fff8e9] p-4 shadow-[5px_5px_0_#202018]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8f1f1f]">
                  asset audit
                </div>
                <h3 className="mt-1 font-display text-2xl font-black">Проверка 3:4</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#202018]/66">
                  Готовые PNG должны быть портретными 3:4. Фабрика подсветит файл до финальной
                  сборки, если генератор отдал другой формат.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadAssetAudit()}
                className="min-h-10 border-2 border-[#202018] bg-[#f7edd7] px-4 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#202018] shadow-[3px_3px_0_#202018] transition hover:-translate-y-0.5"
              >
                Проверить PNG
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <StatusMetric
                label="готово"
                value={`${assetAudit?.readyCount ?? readyVariantCount} / ${
                  assetAudit?.expectedCount ?? expectedVariantCount
                }`}
              />
              <StatusMetric
                label="3:4"
                value={assetAudit?.ok ? 'ok' : `${assetAudit?.failedCount ?? 0} issue`}
              />
              <StatusMetric label="ожидается" value="ratio 0.75" />
            </div>

            <div className="mt-4">
              <StatusBox status={assetAuditStatus} />
            </div>

            {assetAudit && assetAudit.failed.length > 0 && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {assetAudit.failed.map((item) => (
                  <div
                    key={`${item.slideId}-${item.variantId}`}
                    className="border-2 border-[#8f1f1f] bg-[#fff1f1] p-3 text-[#8f1f1f]"
                  >
                    <div className="font-mono text-xs font-black uppercase tracking-[0.16em]">
                      {item.fileName}
                    </div>
                    <div className="mt-2 font-mono text-xs leading-5">
                      {item.ready && item.width && item.height
                        ? `${item.width}x${item.height} · ratio ${item.aspectRatio}`
                        : item.issue}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-10">
            {visualSlides.map((slide) => (
              <section key={slide.id}>
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#8f1f1f]">
                      {slide.id}
                    </div>
                    <h3 className="font-display text-3xl font-black">{slide.title}</h3>
                  </div>
                  <div className="font-mono text-xs uppercase tracking-[0.16em] text-[#202018]/58">
                    выбери один вариант
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {slide.variants.map((variant) => {
                    const isSelected = selected[slide.id] === variant.id;
                    const auditItem = assetAudit?.items.find(
                      (item) => item.slideId === slide.id && item.variantId === variant.id,
                    );
                    const isSelectable = selectableVisualKeys.has(`${slide.id}:${variant.id}`);
                    const isInvalidReady = Boolean(variant.ready && auditItem && !auditItem.ok);

                    return (
                      <article
                        key={variant.id}
                        className={`border-2 bg-[#fff8e9] p-3 shadow-[5px_5px_0_#202018] transition ${
                          isSelected && isSelectable
                            ? 'border-[#8f1f1f] ring-4 ring-[#8f1f1f]/25'
                            : isInvalidReady
                              ? 'border-[#8f1f1f] bg-[#fff1f1]'
                              : isSelectable
                              ? 'border-[#202018]'
                              : 'border-[#202018]/25 opacity-75'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (isSelectable) chooseVariant(slide.id, variant.id);
                          }}
                          disabled={!isSelectable}
                          className="group block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8f1f1f] disabled:cursor-not-allowed"
                        >
                          <div className="relative aspect-[3/4] overflow-hidden border-2 border-[#202018]/12 bg-[#eadfc6]">
                            {variant.ready && variant.src ? (
                              <Image
                                src={variant.src}
                                alt={`${slide.title}, вариант ${variant.label}`}
                                fill
                                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                                className="object-cover transition duration-200 group-hover:scale-[1.015]"
                              />
                            ) : (
                              <div className="grid h-full place-items-center p-4 text-center">
                                <div>
                                  <div className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[#8f1f1f]">
                                    ожидает PNG
                                  </div>
                                  <div className="mt-3 font-mono text-sm text-[#202018]/58">
                                    {`${slide.id}-${variant.id}.png`}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div>
                              <div className="font-mono text-xs font-black uppercase tracking-[0.2em]">
                                вариант {variant.label}
                              </div>
                              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#8f1f1f]">
                                {isInvalidReady ? 'invalid 3:4' : variant.direction}
                              </div>
                              <p className="mt-1 text-sm leading-5 text-[#202018]/62">
                                {isInvalidReady
                                  ? auditItem?.issue ?? 'PNG is not valid for final assembly.'
                                  : variant.description}
                              </p>
                            </div>
                            <span
                              className={`grid h-7 w-7 place-items-center border-2 border-[#202018] font-mono text-xs ${
                                isSelected && isSelectable
                                  ? 'bg-[#8f1f1f] text-[#fff8e9]'
                                  : isInvalidReady
                                    ? 'bg-[#fff1f1] text-[#8f1f1f]'
                                    : isSelectable
                                    ? 'bg-[#fff8e9]'
                                    : 'bg-[#202018]/10 text-[#202018]/35'
                              }`}
                              aria-hidden
                            >
                              {isSelected && isSelectable ? '✓' : isInvalidReady ? '!' : ''}
                            </span>
                          </div>
                        </button>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </section>

        <section className="mt-10 border-2 border-[#202018] bg-[#fff8e9] p-4 shadow-[5px_5px_0_#202018]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-black">Выбор визуалов</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#202018]/66">
                Финальная папка собирается только после полного набора: 32 PNG готовы и выбран
                один вариант для каждого из 8 слайдов.
              </p>
              <pre className="mt-3 min-h-16 whitespace-pre-wrap border border-[#202018]/15 bg-[#f7edd7] p-3 font-mono text-sm">
                {selectedSummary || 'Пока ничего не выбрано.'}
              </pre>
              {staleSummary && (
                <div className="mt-3 border-2 border-[#8f1f1f] bg-[#fff1f1] p-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8f1f1f]">
                    устаревший выбор
                  </div>
                  <pre className="mt-2 whitespace-pre-wrap font-mono text-sm text-[#8f1f1f]">
                    {staleSummary}
                  </pre>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={saveSelection}
                disabled={selectionStatus.state === 'loading' || (selectedCount === 0 && staleCount === 0)}
                className="min-h-12 border-2 border-[#202018] bg-[#f7edd7] px-5 font-mono text-sm font-black uppercase tracking-[0.14em] text-[#202018] shadow-[4px_4px_0_#202018] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#202018]/18 disabled:text-[#202018]/45 disabled:hover:translate-y-0"
              >
                Сохранить выбор
              </button>
              <button
                type="button"
                onClick={assembleCarousel}
                disabled={!canAssemble || assembleStatus.state === 'loading'}
                className="min-h-12 border-2 border-[#202018] bg-[#8f1f1f] px-5 font-mono text-sm font-black uppercase tracking-[0.14em] text-[#fff8e9] shadow-[4px_4px_0_#202018] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#202018]/24 disabled:text-[#202018]/45 disabled:hover:translate-y-0"
              >
                Собрать карусель
              </button>
              <a
                href="/api/diary-factory/final-export?download=zip"
                target="_blank"
                className="grid min-h-12 place-items-center border-2 border-[#202018] bg-[#f7edd7] px-5 font-mono text-sm font-black uppercase tracking-[0.14em] text-[#202018] shadow-[4px_4px_0_#202018] transition hover:-translate-y-0.5"
              >
                Скачать ZIP
              </a>
            </div>
          </div>

          <div className="mt-4">
            <StatusBox status={selectionStatus} />
          </div>

          <div
            className={`mt-4 border-2 p-3 text-sm leading-6 ${
              assembleStatus.state === 'error'
                ? 'border-[#8f1f1f] bg-[#fff1f1] text-[#8f1f1f]'
                : assembleStatus.state === 'success'
                  ? 'border-[#2f6b4f] bg-[#eef8e7] text-[#202018]'
                  : 'border-[#202018]/15 bg-[#f7edd7] text-[#202018]/70'
            }`}
          >
            <div className="font-mono text-xs uppercase tracking-[0.16em]">
              {!allTextApproved
                ? 'Сначала утверди текст всех слайдов.'
                : !allVisualVariantsReady
                  ? `Сначала дождись всех визуальных вариантов: ${readyVariantCount} / ${expectedVariantCount}.`
                  : !allVisualAssetsOk
                    ? `Сначала исправь PNG не в 3:4: ${assetAudit?.failedCount ?? 0}.`
                  : !allFinalSlidesSelected
                    ? `Выбери по одному визуалу для каждого слайда: ${selectedCount} / ${diaryEntry.slides.length}.`
                : assembleStatus.message}
            </div>
            {assembleStatus.state === 'success' && (
              <ul className="mt-2 space-y-1 font-mono text-xs">
                {assembleStatus.files.map((file) => (
                  <li key={file}>{file}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function Counter({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 border-[#202018] bg-[#fff8e9] px-4 py-3 text-right shadow-[4px_4px_0_#202018]">
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#202018]/54">
        {label}
      </div>
      <div className="font-mono text-xl font-black">{value}</div>
    </div>
  );
}

function StatusMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 border-[#202018]/15 bg-[#f7edd7] p-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#202018]/54">
        {label}
      </div>
      <div className="mt-1 break-words font-mono text-sm font-black text-[#202018]">{value}</div>
    </div>
  );
}

function FactoryPresetCard({
  preset,
}: {
  preset: (typeof carouselFactoryConfig.presets)[number];
}) {
  const isActive = preset.status === 'active';

  return (
    <article
      className={`border-2 p-3 ${
        isActive
          ? 'border-[#8f1f1f] bg-[#fff1f1] shadow-[3px_3px_0_#202018]'
          : 'border-[#202018]/20 bg-[#f7edd7]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#8f1f1f]">
          {preset.label}
        </div>
        <div className="font-mono text-[10px] font-black uppercase tracking-[0.14em] text-[#202018]/50">
          {preset.status}
        </div>
      </div>
      <h3 className="mt-2 font-display text-xl font-black">{preset.title}</h3>
      <p className="mt-2 text-sm leading-5 text-[#202018]/70">{preset.purpose}</p>
      <div className="mt-3 space-y-2 font-mono text-[10px] leading-4 text-[#202018]/58">
        <div>
          <span className="font-black uppercase text-[#202018]/76">input:</span> {preset.input}
        </div>
        <div>
          <span className="font-black uppercase text-[#202018]/76">output:</span> {preset.output}
        </div>
      </div>
    </article>
  );
}

function StatusBox({ status }: { status: SaveStatus }) {
  return (
    <div
      className={`border-2 p-3 text-sm leading-6 ${
        status.state === 'error'
          ? 'border-[#8f1f1f] bg-[#fff1f1] text-[#8f1f1f]'
          : status.state === 'success'
            ? 'border-[#2f6b4f] bg-[#eef8e7] text-[#202018]'
            : 'border-[#202018]/15 bg-[#f7edd7] text-[#202018]/70'
      }`}
    >
      <div className="font-mono text-xs uppercase tracking-[0.16em]">{status.message}</div>
    </div>
  );
}

function PlanStatusBox({
  status,
  allTextApproved,
}: {
  status: PlanStatus;
  allTextApproved: boolean;
}) {
  const message = !allTextApproved ? 'Сначала утверди текст всех слайдов.' : status.message;

  return (
    <div
      className={`border-2 p-3 text-sm leading-6 ${
        status.state === 'error'
          ? 'border-[#8f1f1f] bg-[#fff1f1] text-[#8f1f1f]'
          : status.state === 'success'
            ? 'border-[#2f6b4f] bg-[#eef8e7] text-[#202018]'
            : 'border-[#202018]/15 bg-[#f7edd7] text-[#202018]/70'
      }`}
    >
      <div className="font-mono text-xs uppercase tracking-[0.16em]">{message}</div>
      {status.state === 'success' && (
        <div className="mt-2 font-mono text-xs">
          {status.plan} · {status.promptCount} prompts
        </div>
      )}
    </div>
  );
}
