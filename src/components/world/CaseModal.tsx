'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { getCase } from '@/lib/world/cases';

const TAG_COLORS: Record<string, string> = {
  CONTENT: '#b6ff3a',
  AUTOMATION: '#7d5cff',
  OPS: '#e9c46a',
  TECH: '#7dc4ff',
};

export function CaseModal({ caseId, onClose }: { caseId: string | null; onClose: () => void }) {
  useEffect(() => {
    if (!caseId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [caseId, onClose]);

  if (!caseId) return null;
  const data = getCase(caseId);
  if (!data) return null;

  const tagColor = TAG_COLORS[data.tag] ?? '#b6ff3a';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90dvh] overflow-y-auto bg-canon-paper text-canon-ink shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'caseModal-in 240ms cubic-bezier(0.2, 0.9, 0.2, 1) both',
        }}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-canon-paper/95 backdrop-blur border-b border-canon-ink/10 flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span
              className="font-mono text-[10px] uppercase tracking-[0.25em] px-2 py-1"
              style={{ background: tagColor + '22', color: tagColor === '#e9c46a' ? '#7a6a30' : tagColor }}
            >
              {data.tag}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-canon-grey">
              EDISON TOOLKIT
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="font-mono text-sm text-canon-grey hover:text-canon-ink"
          >
            ✕ ESC
          </button>
        </div>

        <div className="px-6 md:px-10 py-8 md:py-12">
          {/* Title */}
          <h2 className="font-display font-bold text-3xl md:text-5xl leading-[0.95] tracking-tight mb-6">
            {data.title}
          </h2>

          {/* Edison result — main quote */}
          <div
            className="border-l-4 pl-4 py-2 mb-8 italic text-canon-ink text-lg md:text-xl"
            style={{ borderColor: tagColor }}
          >
            {data.edisonResult}
          </div>

          {/* What it does */}
          <div className="mb-8">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-canon-grey mb-2">
              что делает
            </div>
            <p className="text-canon-ink/85 leading-relaxed">{data.whatItDoes}</p>
          </div>

          {/* Where it applies */}
          {data.applies.length > 0 && data.applies[0] !== '—' && (
            <div className="mb-8">
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-canon-grey mb-3">
                кому подходит
              </div>
              <div className="flex flex-wrap gap-2">
                {data.applies.map((a) => (
                  <span
                    key={a}
                    className="px-3 py-1 text-xs border border-canon-ink/20 rounded-full"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Price */}
          {data.priceModule !== '—' && (
            <div className="bg-canon-ink/5 px-5 py-4 mb-8 grid grid-cols-2 gap-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-canon-grey mb-1">
                  модуль
                </div>
                <div className="font-display font-bold text-2xl">{data.priceModule}</div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-canon-grey mb-1">
                  в пакете
                </div>
                <div className="font-display font-bold text-2xl text-canon-olive">
                  {data.pricePackage}
                </div>
              </div>
            </div>
          )}

          {/* CTA */}
          {data.priceModule !== '—' ? (
            <div className="flex flex-wrap gap-3">
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 bg-canon-ink text-canon-paper font-mono text-sm uppercase tracking-[0.2em] px-6 py-4 hover:bg-canon-olive transition-colors"
              >
                Хочу такой →
              </Link>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-[0.2em] text-canon-grey border-b border-canon-grey/40 hover:text-canon-ink hover:border-canon-ink py-1"
              >
                Назад в бар
              </button>
            </div>
          ) : (
            <div className="text-canon-grey font-mono text-xs italic">
              (Easter egg • not for sale)
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes caseModal-in {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
