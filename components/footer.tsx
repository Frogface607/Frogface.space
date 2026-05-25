export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 border-t border-graphite-line/60 mt-32">
      <div className="px-6 md:px-10 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 font-mono text-[11px] uppercase tracking-[0.2em] text-paper-dim">
        <div className="col-span-2 md:col-span-1">
          <div className="text-paper text-base font-display font-bold mb-2">Frogface</div>
          <div>студия одного панка<br />by Серёжа Орлов</div>
        </div>
        <div>
          <div className="text-paper mb-3">links</div>
          <ul className="space-y-1">
            <li><a href="https://github.com/Frogface607" data-cursor="hover" className="hover:text-lime">github</a></li>
            <li><a href="https://t.me/frogface_hq" data-cursor="hover" className="hover:text-lime">telegram</a></li>
            <li><a href="https://instagram.com/frogface.space" data-cursor="hover" className="hover:text-lime">instagram</a></li>
          </ul>
        </div>
        <div>
          <div className="text-paper mb-3">products</div>
          <ul className="space-y-1">
            <li><a href="https://wizl.space" data-cursor="hover" className="hover:text-lime">wizl.space</a></li>
            <li><a href="https://edisonbar.ru" data-cursor="hover" className="hover:text-lime">edison bar</a></li>
            <li><a href="https://posadyat.ru" data-cursor="hover" className="hover:text-lime">posadyat</a></li>
          </ul>
        </div>
        <div>
          <div className="text-paper mb-3">{year}</div>
          <div>built in irkutsk → bangkok → spb → irk again</div>
        </div>
      </div>
    </footer>
  );
}
