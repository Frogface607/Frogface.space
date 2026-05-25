"use client";
import { useEffect, useRef } from "react";

export function ParallaxFrog() {
  const headRef = useRef<SVGGElement>(null);
  const leftEye = useRef<SVGGElement>(null);
  const rightEye = useRef<SVGGElement>(null);
  const rootRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!rootRef.current || !headRef.current) return;
      const r = rootRef.current.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const nx = (e.clientX - cx) / window.innerWidth;
      const ny = (e.clientY - cy) / window.innerHeight;

      const tilt = nx * 5;
      const lift = -ny * 4;
      headRef.current.setAttribute(
        "transform",
        `translate(${nx * 14} ${ny * 10}) rotate(${tilt} 200 200)`,
      );

      const pupil = (g: SVGGElement | null) => {
        if (!g) return;
        g.setAttribute("transform", `translate(${nx * 5} ${ny * 5})`);
      };
      pupil(leftEye.current);
      pupil(rightEye.current);

      void lift;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <svg
      ref={rootRef}
      viewBox="0 0 400 400"
      className="size-full"
      aria-hidden
    >
      {/* halo */}
      <defs>
        <radialGradient id="halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#b6ff3a" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#b6ff3a" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#b6ff3a" stopOpacity="0" />
        </radialGradient>
        <filter id="ink" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" result="t" />
          <feDisplacementMap in="SourceGraphic" in2="t" scale="2" />
        </filter>
      </defs>

      <circle cx="200" cy="210" r="180" fill="url(#halo)" />

      <g ref={headRef} filter="url(#ink)">
        {/* body / shoulders */}
        <ellipse cx="200" cy="340" rx="150" ry="60" fill="#0e0e10" stroke="#f4ead5" strokeWidth="3" />
        <path d="M 90 320 Q 200 280 310 320" fill="none" stroke="#f4ead5" strokeWidth="2" opacity="0.5" />

        {/* head */}
        <ellipse cx="200" cy="210" rx="160" ry="135" fill="#1a1a1f" stroke="#f4ead5" strokeWidth="3.5" />

        {/* cheek shading */}
        <ellipse cx="120" cy="240" rx="35" ry="22" fill="#0e0e10" opacity="0.6" />
        <ellipse cx="280" cy="240" rx="35" ry="22" fill="#0e0e10" opacity="0.6" />

        {/* eye sockets */}
        <ellipse cx="135" cy="135" rx="62" ry="62" fill="#0e0e10" stroke="#f4ead5" strokeWidth="3.5" />
        <ellipse cx="265" cy="135" rx="62" ry="62" fill="#0e0e10" stroke="#f4ead5" strokeWidth="3.5" />

        {/* eye whites */}
        <circle cx="135" cy="138" r="50" fill="#f4ead5" />
        <circle cx="265" cy="138" r="50" fill="#f4ead5" />

        {/* pupils — parallax targets */}
        <g ref={leftEye}>
          <circle cx="135" cy="142" r="22" fill="#0e0e10" />
          <circle cx="142" cy="135" r="6" fill="#f4ead5" />
        </g>
        <g ref={rightEye}>
          <circle cx="265" cy="142" r="22" fill="#0e0e10" />
          <circle cx="272" cy="135" r="6" fill="#f4ead5" />
        </g>

        {/* mouth */}
        <path
          d="M 110 260 Q 200 295 290 260"
          fill="none"
          stroke="#f4ead5"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* nostrils */}
        <circle cx="180" cy="235" r="2.5" fill="#f4ead5" />
        <circle cx="220" cy="235" r="2.5" fill="#f4ead5" />

        {/* hoodie hint */}
        <path d="M 60 340 Q 50 280 100 260" fill="none" stroke="#f4ead5" strokeWidth="2" opacity="0.4" />
        <path d="M 340 340 Q 350 280 300 260" fill="none" stroke="#f4ead5" strokeWidth="2" opacity="0.4" />

        {/* lime sticker on cheek */}
        <g transform="translate(285 195) rotate(15)">
          <rect width="38" height="14" rx="2" fill="#b6ff3a" />
          <text x="19" y="10" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0e0e10" fontFamily="monospace">
            PANK
          </text>
        </g>
      </g>
    </svg>
  );
}
