'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Application, Assets, Container, Graphics, Sprite, Text } from 'pixi.js';
import worldStateRaw from '@/lib/world/worldState.json';
import {
  parseClick,
  type Scene,
  type WorldObject,
  type WorldState,
} from '@/lib/world/types';
import { FireflyEmitter } from '@/lib/world/particles';

const worldState = worldStateRaw as unknown as WorldState;

// Base scene resolution (16:9). Canvas scales to fit container.
const SCENE_W = 1920;
const SCENE_H = 1080;

export function WorldStage({
  initialScene = 'external',
  onOpenCase,
}: {
  initialScene?: string;
  onOpenCase?: (caseId: string) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const sceneContainerRef = useRef<Container | null>(null);
  const fireflyRef = useRef<FireflyEmitter | null>(null);
  const [currentScene, setCurrentScene] = useState(initialScene);
  const [hoveredObject, setHoveredObject] = useState<WorldObject | null>(null);
  const router = useRouter();

  // Init PIXI app
  useEffect(() => {
    if (!hostRef.current) return;
    let mounted = true;

    const app = new Application();
    app
      .init({
        width: SCENE_W,
        height: SCENE_H,
        backgroundColor: 0x1a1320,
        backgroundAlpha: 0, // transparent so CSS background fills letterboxes
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
      })
      .then(() => {
        if (!mounted || !hostRef.current) {
          app.destroy(true);
          return;
        }
        appRef.current = app;
        hostRef.current.appendChild(app.canvas);
        app.canvas.style.position = 'absolute';
        app.canvas.style.inset = '0';
        app.canvas.style.width = '100%';
        app.canvas.style.height = '100%';
        app.canvas.style.objectFit = 'cover';

        // Scene container for transitions
        const sceneContainer = new Container();
        app.stage.addChild(sceneContainer);
        sceneContainerRef.current = sceneContainer;

        // Fireflies (always on top of scene)
        const fireflies = new FireflyEmitter({
          count: 35,
          bounds: { w: SCENE_W, h: SCENE_H },
          color: 0xfff3a8,
          size: 3,
        });
        fireflies.attachToApp(app.ticker);
        app.stage.addChild(fireflies.container);
        fireflyRef.current = fireflies;

        renderScene(currentScene);
      });

    return () => {
      mounted = false;
      if (fireflyRef.current) {
        fireflyRef.current.destroy();
        fireflyRef.current = null;
      }
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
        sceneContainerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render when scene changes
  useEffect(() => {
    if (!appRef.current || !sceneContainerRef.current) return;
    setHoveredObject(null); // clear stuck tooltip
    renderScene(currentScene);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScene]);

  async function renderScene(sceneId: string) {
    const app = appRef.current;
    const container = sceneContainerRef.current;
    if (!app || !container) return;
    const scene = worldState.scenes[sceneId] as Scene | undefined;
    if (!scene) {
      console.warn('Unknown scene:', sceneId);
      return;
    }
    container.removeChildren();

    // Background
    try {
      const tex = await Assets.load(scene.background);
      const bg = new Sprite(tex);
      bg.width = SCENE_W;
      bg.height = SCENE_H;
      container.addChild(bg);
    } catch {
      // Placeholder if asset missing
      const placeholder = new Graphics();
      placeholder.rect(0, 0, SCENE_W, SCENE_H);
      placeholder.fill({ color: 0x1a2620, alpha: 1 });
      container.addChild(placeholder);

      const label = new Text({
        text: `[${sceneId}]\nЖдём ассет: ${scene.background}`,
        style: {
          fill: 0xb6ff3a,
          fontSize: 36,
          fontFamily: 'monospace',
          align: 'center',
        },
      });
      label.anchor.set(0.5);
      label.x = SCENE_W / 2;
      label.y = SCENE_H / 2;
      container.addChild(label);
    }

    // Objects
    for (const obj of scene.objects) {
      const objContainer = new Container();
      objContainer.x = obj.x;
      objContainer.y = obj.y;

      if (obj.image) {
        try {
          const tex = await Assets.load(obj.image);
          const sprite = new Sprite(tex);
          if (obj.scale) sprite.scale.set(obj.scale);
          objContainer.addChild(sprite);
        } catch {
          // skip if image missing
        }
      }

      // Invisible hit-area for click-zones — subtle hover glow only
      const w = obj.w ?? objContainer.width ?? 200;
      const h = obj.h ?? objContainer.height ?? 200;
      const hitArea = new Graphics();
      hitArea.rect(0, 0, w, h);
      hitArea.fill({ color: 0xffffff, alpha: 0.0001 });
      objContainer.addChild(hitArea);

      // Hover glow overlay (revealed on enter)
      const glow = new Graphics();
      glow.rect(0, 0, w, h);
      glow.stroke({ color: 0xfff3a8, width: 3, alpha: 0 });
      glow.fill({ color: 0xfff3a8, alpha: 0 });
      objContainer.addChild(glow);

      objContainer.eventMode = 'static';
      objContainer.cursor = 'pointer';
      objContainer.on('pointertap', () => handleClick(obj));
      objContainer.on('pointerenter', () => {
        setHoveredObject(obj);
        glow.alpha = 1;
        glow.clear();
        glow.rect(0, 0, w, h);
        glow.stroke({ color: 0xfff3a8, width: 3, alpha: 0.6 });
        glow.fill({ color: 0xfff3a8, alpha: 0.08 });
      });
      objContainer.on('pointerleave', () => {
        setHoveredObject((prev) => (prev?.id === obj.id ? null : prev));
        glow.alpha = 0;
      });

      container.addChild(objContainer);
    }
  }

  function handleClick(obj: WorldObject) {
    if (!obj.click) return;
    const action = parseClick(obj.click);
    switch (action.type) {
      case 'scene':
        setCurrentScene(action.target);
        break;
      case 'route':
        router.push(action.path);
        break;
      case 'case':
        if (onOpenCase) onOpenCase(action.caseId);
        else console.log('Open case:', action.caseId);
        break;
    }
  }

  // Ambient color per scene (no double-image — canvas covers viewport fully)
  const sceneAmbient: Record<string, string> = {
    'external': '#0e1218',
    'hut-interior': '#1a120a',
    'bar-interior': '#1f1308',
  };
  const ambientColor = sceneAmbient[currentScene] ?? '#0e1218';

  return (
    <div
      className="relative w-full h-dvh overflow-hidden"
      style={{ background: ambientColor }}
    >
      <div ref={hostRef} className="relative w-full h-full z-10" />
      {/* Soft vignette around canvas edges */}
      <div
        className="pointer-events-none absolute inset-0 z-[15]"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 65%, rgba(0,0,0,0.45) 100%)',
        }}
        aria-hidden
      />

      {/* HUD overlay */}
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col">
        {/* Top bar */}
        <div className="flex items-start justify-between p-4 md:p-6">
          <a
            href="/"
            className="pointer-events-auto font-mono text-[11px] uppercase tracking-[0.3em] text-[#f4ead5] hover:text-[#fff8e0] bg-black/75 backdrop-blur shadow-lg px-3 py-1.5 rounded-full"
          >
            frogface{currentScene === 'external' ? '' : ' / ' + sceneLabel(currentScene)}
          </a>
          <div className="pointer-events-auto flex gap-2">
            {currentScene !== 'external' && (
              <button
                onClick={() => setCurrentScene('external')}
                className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.25em] border border-[#f4ead5]/35 text-[#f4ead5]/90 hover:border-[#f4ead5] hover:text-[#fff8e0] bg-black/75 backdrop-blur shadow-lg rounded-full transition-colors"
              >
                ← болото
              </button>
            )}
            <a
              href="/studio"
              className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.25em] border border-[#b6ff3a]/60 text-[#b6ff3a] bg-black/75 backdrop-blur shadow-lg hover:bg-[#b6ff3a]/15 rounded-full transition-colors"
            >
              studio →
            </a>
          </div>
        </div>

        {/* Tooltip */}
        {hoveredObject?.tooltip && (
          <div className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-black/75 backdrop-blur text-[#f4ead5] font-mono text-xs uppercase tracking-[0.3em] rounded-full border border-[#f4ead5]/15">
            {hoveredObject.tooltip}
          </div>
        )}
      </div>
    </div>
  );
}

function sceneLabel(id: string): string {
  if (id === 'hut-interior') return 'хижина';
  if (id === 'bar-interior') return 'edison';
  return id;
}
