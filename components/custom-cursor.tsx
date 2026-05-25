"use client";
import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mq.matches) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    document.body.classList.add("frog-cursor");

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const t = e.target as HTMLElement;
      const interactive = !!t.closest("a, button, [data-cursor='hover']");
      setHovering(interactive);
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    let frame = 0;
    const tick = () => {
      const node = ref.current;
      if (node) {
        x += (tx - x) * 0.22;
        y += (ty - y) * 0.22;
        node.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.body.classList.remove("frog-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  const scale = pressed ? 0.78 : hovering ? 1.45 : 1;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[9999] will-change-transform"
      style={{ transition: "filter 200ms" }}
    >
      <svg
        width="42"
        height="42"
        viewBox="0 0 42 42"
        style={{
          transform: `scale(${scale})`,
          transition: "transform 180ms var(--ease-thwack, ease)",
        }}
      >
        {/* eyes */}
        <circle cx="13" cy="13" r="9" fill="#b6ff3a" stroke="#0e0e10" strokeWidth="2" />
        <circle cx="29" cy="13" r="9" fill="#b6ff3a" stroke="#0e0e10" strokeWidth="2" />
        <circle cx="13" cy="14" r="3" fill="#0e0e10" />
        <circle cx="29" cy="14" r="3" fill="#0e0e10" />
        <circle cx="14" cy="13" r="1" fill="#f4ead5" />
        <circle cx="30" cy="13" r="1" fill="#f4ead5" />
        {/* mouth */}
        <path
          d={pressed ? "M 10 30 Q 21 25 32 30" : hovering ? "M 10 28 Q 21 36 32 28" : "M 11 30 L 31 30"}
          fill="none"
          stroke="#0e0e10"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
