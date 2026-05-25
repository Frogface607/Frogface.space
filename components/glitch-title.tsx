"use client";
import { useEffect, useRef } from "react";

export function GlitchTitle({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const letters = el.querySelectorAll<HTMLSpanElement>("[data-letter]");
    if (!letters.length) return;

    let raf = 0;
    const loop = () => {
      letters.forEach((l) => {
        if (Math.random() < 0.018) {
          l.style.transform = `translateY(${(Math.random() - 0.5) * 8}px) skewX(${(Math.random() - 0.5) * 8}deg)`;
          l.style.color = Math.random() < 0.5 ? "var(--color-lime)" : "var(--color-punk)";
          setTimeout(() => {
            l.style.transform = "";
            l.style.color = "";
          }, 110 + Math.random() * 80);
        }
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <span ref={ref} className="inline-flex">
      {text.split("").map((ch, i) => (
        <span
          key={i}
          data-letter
          className="inline-block transition-[transform,color] duration-150"
          style={{ transitionTimingFunction: "var(--ease-thwack)" }}
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}
