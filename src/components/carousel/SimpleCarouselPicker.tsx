'use client';

import { useEffect, useMemo, useState } from 'react';
import { diaryEntry } from '@/lib/diaryFactory';

type VisualVariant = {
  id: string;
  label: string;
  direction: string;
  description: string;
  fileName?: string;
  src?: string;
  ready: boolean;
};

type VisualSlide = {
  id: string;
  index: number;
  title: string;
  variants: VisualVariant[];
};

type AssetsPayload = {
  slides?: VisualSlide[];
  variantCount?: number;
  expectedVariantCount?: number;
};

type SelectionPayload = {
  selected?: Record<string, string>;
};

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const api = {
  assets: '/api/diary-factory/assets',
  selection: '/api/diary-factory/selection',
  exportSelected: '/api/carousel-factory/export-selected',
};

export function SimpleCarouselPicker() {
  const [slides, setSlides] = useState<VisualSlide[]>([]);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [readyCount, setReadyCount] = useState(0);
  const [expectedCount, setExpectedCount] = useState(diaryEntry.slides.length * 4);

  const selectedCount = useMemo(() => Object.keys(selected).length, [selected]);

  const requestPickerData = async () => {
    const [assetsResponse, selectionResponse] = await Promise.all([
      fetch(api.assets),
      fetch(api.selection),
    ]);

    if (!assetsResponse.ok) throw new Error('Не смог загрузить варианты.');

    const assets = (await assetsResponse.json()) as AssetsPayload;
    const selection = selectionResponse.ok
      ? ((await selectionResponse.json()) as SelectionPayload)
      : {};

    return { assets, selection };
  };

  const applyPickerData = (assets: AssetsPayload, selection: SelectionPayload) => {
    setSlides(assets.slides ?? []);
    setReadyCount(assets.variantCount ?? 0);
    setExpectedCount(assets.expectedVariantCount ?? diaryEntry.slides.length * 4);
    setSelected(selection.selected ?? {});
  };

  const load = async () => {
    setError(null);
    const { assets, selection } = await requestPickerData();
    applyPickerData(assets, selection);
  };

  useEffect(() => {
    let ignore = false;

    void requestPickerData()
      .then(({ assets, selection }) => {
        if (ignore) return;
        applyPickerData(assets, selection);
      })
      .catch((loadError) => {
        if (ignore) return;
        setError(loadError instanceof Error ? loadError.message : 'Неизвестная ошибка загрузки.');
      });

    return () => {
      ignore = true;
    };
  }, []);

  const saveSelection = async (nextSelected: Record<string, string>) => {
    setSaveState('saving');
    setError(null);

    try {
      const response = await fetch(api.selection, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected: nextSelected }),
      });
      const payload = (await response.json()) as SelectionPayload & { ok?: boolean; error?: string };

      if (!response.ok || payload.ok === false) {
        throw new Error(payload.error ?? 'Не смог сохранить выбор.');
      }

      setSelected(payload.selected ?? nextSelected);
      setSaveState('saved');
    } catch (saveError) {
      setSaveState('error');
      setError(saveError instanceof Error ? saveError.message : 'Неизвестная ошибка сохранения.');
    }
  };

  const toggleVariant = (slideId: string, variantId: string) => {
    const nextSelected = { ...selected };

    if (nextSelected[slideId] === variantId) {
      delete nextSelected[slideId];
    } else {
      nextSelected[slideId] = variantId;
    }

    setSelected(nextSelected);
    void saveSelection(nextSelected);
  };

  return (
    <main className="min-h-dvh bg-[#f6f2e8] text-[#181814]">
      <header className="sticky top-0 z-30 border-b-2 border-[#181814] bg-[#f6f2e8]/94 px-4 py-4 backdrop-blur md:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#a52522]">
              carousel picker
            </div>
            <h1 className="mt-1 font-display text-3xl font-black md:text-5xl">
              День 4
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill label="готово" value={`${readyCount} / ${expectedCount}`} />
            <StatusPill label="выбрано" value={`${selectedCount} / ${diaryEntry.slides.length}`} />
            <button
              type="button"
              onClick={() => void load()}
              className="min-h-11 border-2 border-[#181814] bg-white px-4 font-mono text-xs font-black uppercase tracking-[0.12em] shadow-[3px_3px_0_#181814] transition hover:-translate-y-0.5"
            >
              Обновить
            </button>
            <a
              href={api.exportSelected}
              className={`grid min-h-11 place-items-center border-2 border-[#181814] px-4 font-mono text-xs font-black uppercase tracking-[0.12em] shadow-[3px_3px_0_#181814] transition hover:-translate-y-0.5 ${
                selectedCount > 0
                  ? 'bg-[#a52522] text-white'
                  : 'pointer-events-none bg-[#181814]/12 text-[#181814]/42'
              }`}
            >
              Скачать выбранное
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-2 border-[#181814] bg-white p-4 shadow-[4px_4px_0_#181814]">
          <div>
            <div className="font-display text-2xl font-black">{diaryEntry.title}</div>
            <div className="mt-1 max-w-3xl text-sm leading-6 text-[#181814]/62">
              По одному варианту на слайд. Готовые картинки кликаются, пустые слоты ждут генерацию.
            </div>
          </div>
          <a
            href="/diary-factory"
            className="font-mono text-[10px] font-black uppercase tracking-[0.14em] text-[#181814]/46 underline decoration-[#a52522] underline-offset-4"
          >
            backstage
          </a>
        </div>

        {error && (
          <div className="mb-5 border-2 border-[#a52522] bg-[#fff0ee] p-3 font-mono text-xs font-black uppercase tracking-[0.12em] text-[#a52522]">
            {error}
          </div>
        )}

        <div className="space-y-7">
          {slides.map((slide) => {
            const textSlide = diaryEntry.slides.find((item) => item.id === slide.id);
            const selectedVariant = selected[slide.id];

            return (
              <section key={slide.id} className="border-t-2 border-[#181814] pt-4">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#a52522]">
                      слайд {String(slide.index).padStart(2, '0')}
                    </div>
                    <h2 className="mt-1 font-display text-2xl font-black">
                      {textSlide?.textVariants[0]?.heading ?? slide.title}
                    </h2>
                    <p className="mt-2 max-w-xl whitespace-pre-line text-sm leading-6 text-[#181814]/62">
                      {textSlide?.text ?? ''}
                    </p>
                  </div>
                  <div className="border-2 border-[#181814] bg-white px-3 py-2 font-mono text-xs font-black uppercase tracking-[0.12em]">
                    {selectedVariant ? `выбран ${selectedVariant.toUpperCase()}` : 'не выбран'}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {slide.variants.map((variant) => {
                    const isSelected = selectedVariant === variant.id;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        disabled={!variant.ready}
                        onClick={() => toggleVariant(slide.id, variant.id)}
                        className={`group text-left transition ${
                          variant.ready ? 'hover:-translate-y-1' : 'cursor-not-allowed opacity-55'
                        }`}
                      >
                        <div
                          className={`overflow-hidden border-2 bg-white shadow-[4px_4px_0_#181814] ${
                            isSelected ? 'border-[#a52522]' : 'border-[#181814]'
                          }`}
                        >
                          <div className="relative aspect-[3/4] bg-[#e7e2d7]">
                            {variant.src ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={variant.src}
                                alt={`${slide.id}-${variant.id}`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="grid h-full place-items-center p-5 text-center font-mono text-xs font-black uppercase tracking-[0.14em] text-[#181814]/42">
                                пока нет
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-3 border-t-2 border-[#181814] px-3 py-2">
                            <div className="font-mono text-xs font-black uppercase tracking-[0.18em]">
                              {variant.label}
                            </div>
                            <div
                              className={`h-4 w-4 border-2 border-[#181814] ${
                                isSelected ? 'bg-[#a52522]' : 'bg-white'
                              }`}
                              aria-hidden="true"
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-7 border-2 border-[#181814] bg-[#181814] p-4 text-white shadow-[4px_4px_0_#a52522]">
          <div className="font-mono text-xs font-black uppercase tracking-[0.14em]">
            {saveState === 'saving'
              ? 'сохраняю выбор'
              : saveState === 'saved'
                ? 'выбор сохранен'
                : saveState === 'error'
                  ? 'выбор не сохранился'
                  : 'готов к выбору'}
          </div>
        </div>
      </section>
    </main>
  );
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 border-[#181814] bg-white px-3 py-2 text-right shadow-[3px_3px_0_#181814]">
      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#181814]/52">
        {label}
      </div>
      <div className="font-mono text-sm font-black">{value}</div>
    </div>
  );
}
