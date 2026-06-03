'use client';

import { useEffect, useRef } from 'react';

/**
 * Lightweight canvas firefly layer for the hero.
 * No PixiJS — keeps the landing fast. Pauses when tab hidden.
 */
export function Fireflies({ count = 26 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    type Fly = {
      x: number;
      y: number;
      vy: number;
      ax: number;
      freq: number;
      phase: number;
      baseX: number;
      r: number;
      life: number;
      lifeSpeed: number;
    };

    const flies: Fly[] = Array.from({ length: count }, () => {
      const baseX = Math.random() * w;
      return {
        x: baseX,
        y: Math.random() * h,
        vy: -(Math.random() * 0.25 + 0.08),
        ax: Math.random() * 26 + 8,
        freq: Math.random() * 0.018 + 0.004,
        phase: Math.random() * Math.PI * 2,
        baseX,
        r: Math.random() * 1.6 + 0.8,
        life: Math.random(),
        lifeSpeed: Math.random() * 0.0035 + 0.0012,
      };
    });

    let raf = 0;
    let running = true;

    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (const f of flies) {
        f.y += f.vy;
        f.phase += f.freq;
        f.x = f.baseX + Math.sin(f.phase) * f.ax;
        f.life += f.lifeSpeed;
        const a = Math.sin((f.life % 1) * Math.PI) * 0.8;
        if (f.y < -10) {
          f.y = h + 10;
          f.baseX = Math.random() * w;
        }
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 243, 168, ${a})`;
        ctx.shadowColor = 'rgba(255, 243, 168, 0.9)';
        ctx.shadowBlur = 8;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onVis = () => {
      running = !document.hidden;
      if (running) raf = requestAnimationFrame(tick);
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [count]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
