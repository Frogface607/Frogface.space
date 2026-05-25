const ITEMS = [
  "now: иркутск, последняя неделя edison",
  "★",
  "now: пишу историю в скролл-комикс",
  "★",
  "now: студия открыта для коммерческих заказов",
  "★",
  "now: 9.5 лет edison → закрывается 31 мая",
  "★",
  "now: wizl space идёт в фоне",
  "★",
];

export function NowTicker() {
  const line = ITEMS.join("    ");
  return (
    <div className="relative z-10 overflow-hidden border-y border-graphite-line/60 bg-graphite-soft/40 backdrop-blur-sm">
      <div className="ticker-track flex whitespace-nowrap font-mono text-[12px] uppercase tracking-[0.25em] text-paper-dim py-3">
        <span className="px-6">{line}</span>
        <span className="px-6" aria-hidden>{line}</span>
      </div>
    </div>
  );
}
