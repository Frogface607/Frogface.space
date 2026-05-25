"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const items = [
  { href: "/", label: "01 / home" },
  { href: "/about", label: "02 / history" },
  { href: "/now", label: "03 / now" },
  { href: "/projects", label: "04 / projects" },
  { href: "/studio", label: "05 / studio" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="fixed top-0 inset-x-0 z-50 mix-blend-difference">
      <nav className="flex items-center justify-between px-6 md:px-10 py-5 font-mono text-[11px] uppercase tracking-[0.2em] text-paper">
        <Link href="/" className="flex items-center gap-2" data-cursor="hover">
          <span className="inline-block size-2 bg-lime blink" />
          <span>frogface.space</span>
        </Link>
        <ul className="hidden md:flex items-center gap-7">
          {items.map((it) => {
            const active = it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  data-cursor="hover"
                  className={clsx(
                    "transition-opacity hover:opacity-100",
                    active ? "opacity-100" : "opacity-50",
                  )}
                >
                  {it.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <a
          href="mailto:hi@frogface.space"
          data-cursor="hover"
          className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 border border-paper/40 rounded-full hover:border-lime hover:text-lime transition-colors"
        >
          → say hi
        </a>
      </nav>
    </header>
  );
}
