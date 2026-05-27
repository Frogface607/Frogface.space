// Firefly particles for swamp scenes
// Soft glow points drifting upward, fading in/out

import { Container, Graphics, Ticker } from 'pixi.js';

interface Firefly {
  g: Graphics;
  vx: number;
  vy: number;
  ax: number; // amplitude of horizontal wiggle
  freq: number; // wiggle frequency
  phase: number; // wiggle phase
  baseX: number;
  life: number; // 0..1
  lifeSpeed: number;
}

export class FireflyEmitter {
  container: Container;
  flies: Firefly[] = [];
  ticker: Ticker | null = null;
  private bounds: { w: number; h: number };
  private color: number;
  private size: number;

  constructor(opts: {
    count?: number;
    bounds: { w: number; h: number };
    color?: number;
    size?: number;
  }) {
    this.container = new Container();
    this.container.eventMode = 'none';
    this.bounds = opts.bounds;
    this.color = opts.color ?? 0xb6ff3a;
    this.size = opts.size ?? 4;
    const count = opts.count ?? 30;
    for (let i = 0; i < count; i++) this.spawn();
  }

  private spawn() {
    const g = new Graphics();
    g.circle(0, 0, this.size).fill({ color: this.color, alpha: 1 });
    g.alpha = 0;
    this.container.addChild(g);
    const f: Firefly = {
      g,
      vx: 0,
      vy: -(Math.random() * 0.3 + 0.15),
      ax: Math.random() * 30 + 10,
      freq: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
      baseX: Math.random() * this.bounds.w,
      life: Math.random(),
      lifeSpeed: Math.random() * 0.003 + 0.001,
    };
    f.g.x = f.baseX;
    f.g.y = Math.random() * this.bounds.h;
    this.flies.push(f);
  }

  attachToApp(ticker: Ticker) {
    this.ticker = ticker;
    ticker.add(this.update);
  }

  detach() {
    if (this.ticker) {
      this.ticker.remove(this.update);
      this.ticker = null;
    }
  }

  destroy() {
    this.detach();
    this.container.destroy({ children: true });
    this.flies = [];
  }

  private update = (delta: { deltaTime: number }) => {
    const dt = delta.deltaTime;
    for (const f of this.flies) {
      // Drift up
      f.g.y += f.vy * dt;
      // Horizontal wiggle
      f.phase += f.freq * dt;
      f.g.x = f.baseX + Math.sin(f.phase) * f.ax;
      // Life cycle (fade in/out)
      f.life += f.lifeSpeed * dt;
      const lifeNorm = f.life % 1;
      // alpha curve — bell
      f.g.alpha = Math.sin(lifeNorm * Math.PI) * 0.85;

      // Respawn when out of bounds
      if (f.g.y < -20) {
        f.g.y = this.bounds.h + 20;
        f.baseX = Math.random() * this.bounds.w;
      }
    }
  };
}
