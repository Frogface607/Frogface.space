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

const SCENE_W = 1920;
const SCENE_H = 1080;
const DEFAULT_WORLD_W = 1920;
const PLAYER_SPEED = 7.5;

type MoveDir = -1 | 0 | 1;

export function WorldStage({
  initialScene = 'external',
  onOpenCase,
}: {
  initialScene?: string;
  onOpenCase?: (caseId: string) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const worldRef = useRef<Container | null>(null);
  const playerRef = useRef<Container | null>(null);
  const fireflyRef = useRef<FireflyEmitter | null>(null);
  const keyDirRef = useRef<MoveDir>(0);
  const touchDirRef = useRef<MoveDir>(0);
  const playerXRef = useRef(520);
  const cameraXRef = useRef(0);
  const currentSceneRef = useRef(initialScene);
  const nearObjectRef = useRef<WorldObject | null>(null);
  const [currentScene, setCurrentScene] = useState(initialScene);
  const [hoveredObject, setHoveredObject] = useState<WorldObject | null>(null);
  const [nearObject, setNearObject] = useState<WorldObject | null>(null);
  const [showHints, setShowHints] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!hostRef.current) return;
    let mounted = true;

    const app = new Application();
    app
      .init({
        width: SCENE_W,
        height: SCENE_H,
        backgroundColor: 0x0e1218,
        backgroundAlpha: 1,
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

        const world = new Container();
        app.stage.addChild(world);
        worldRef.current = world;

        const fireflies = new FireflyEmitter({
          count: 42,
          bounds: { w: SCENE_W, h: SCENE_H },
          color: 0xb6ff3a,
          size: 3,
        });
        fireflies.attachToApp(app.ticker);
        app.stage.addChild(fireflies.container);
        fireflyRef.current = fireflies;

        app.ticker.add((ticker) => tick(ticker.deltaTime));
        renderScene(currentSceneRef.current);
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
        worldRef.current = null;
        playerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    currentSceneRef.current = currentScene;
    setHoveredObject(null);
    setNearObject(null);
    nearObjectRef.current = null;
    setShowHints(true);
    renderScene(currentScene);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScene]);

  useEffect(() => {
    if (!showHints) return;
    const t = setTimeout(() => setShowHints(false), 6500);
    return () => clearTimeout(t);
  }, [showHints, currentScene]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') keyDirRef.current = -1;
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') keyDirRef.current = 1;
      if ((event.key === 'Enter' || event.key === ' ') && nearObjectRef.current) {
        event.preventDefault();
        handleClick(nearObjectRef.current);
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (
        (key === 'arrowleft' || key === 'a') && keyDirRef.current === -1
        || (key === 'arrowright' || key === 'd') && keyDirRef.current === 1
      ) {
        keyDirRef.current = 0;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function tick(delta: number) {
    const scene = getScene(currentSceneRef.current);
    const world = worldRef.current;
    const player = playerRef.current;
    if (!scene || !world) return;

    const worldWidth = scene.worldWidth ?? DEFAULT_WORLD_W;
    const walkable = scene.walkable;
    const dir = touchDirRef.current || keyDirRef.current;

    if (walkable && player) {
      playerXRef.current = clamp(
        playerXRef.current + dir * PLAYER_SPEED * delta,
        walkable.minX,
        walkable.maxX,
      );

      const walking = dir !== 0;
      player.x = playerXRef.current;
      player.y = walkable.y + Math.sin(performance.now() / 120) * (walking ? 5 : 2);
      player.scale.x = dir < 0 ? -1 : 1;
      player.rotation = walking ? Math.sin(performance.now() / 90) * 0.025 : 0;

      const maxCamera = Math.max(0, worldWidth - SCENE_W);
      const targetCamera = clamp(playerXRef.current - SCENE_W * 0.45, 0, maxCamera);
      cameraXRef.current += (targetCamera - cameraXRef.current) * 0.09;
      world.x = -cameraXRef.current;

      updateNearObject(scene);
    }
  }

  async function renderScene(sceneId: string) {
    const app = appRef.current;
    const world = worldRef.current;
    if (!app || !world) return;

    const scene = getScene(sceneId);
    if (!scene) return;

    world.removeChildren();
    playerRef.current = null;
    cameraXRef.current = 0;

    if (scene.walkable) {
      playerXRef.current = scene.playerStart ?? scene.walkable.minX;
      await drawPlayableExternal(world, scene);
    } else {
      await drawStaticScene(world, scene, sceneId);
    }
  }

  async function drawPlayableExternal(world: Container, scene: Scene) {
    const worldWidth = scene.worldWidth ?? DEFAULT_WORLD_W;
    const laneY = scene.walkable?.y ?? 790;
    const imageLoaded = await drawGeneratedBackground(world, scene, worldWidth);

    if (!imageLoaded) {
      drawSky(world, worldWidth);
      drawFarTrees(world, worldWidth);
      drawSwampWater(world, worldWidth);
      drawWorldLandmarks(world);
      drawBoardwalk(world, worldWidth, laneY);
    }

    drawHotspots(world, scene);

    const player = createFrogfacePlayer();
    player.x = playerXRef.current;
    player.y = laneY;
    world.addChild(player);
    playerRef.current = player;

    if (!imageLoaded) {
      drawForegroundReeds(world, worldWidth);
    }
  }

  async function drawGeneratedBackground(world: Container, scene: Scene, worldWidth: number) {
    try {
      const tex = await Assets.load(scene.background);
      const bg = new Sprite(tex);
      bg.width = worldWidth;
      bg.height = SCENE_H;
      world.addChild(bg);
      return true;
    } catch {
      return false;
    }
  }

  async function drawStaticScene(world: Container, scene: Scene, sceneId: string) {
    try {
      const tex = await Assets.load(scene.background);
      const bg = new Sprite(tex);
      bg.width = SCENE_W;
      bg.height = SCENE_H;
      world.addChild(bg);
    } catch {
      const placeholder = new Graphics();
      placeholder.rect(0, 0, SCENE_W, SCENE_H);
      placeholder.fill({ color: sceneId === 'bar-interior' ? 0x241406 : 0x1a120a });
      world.addChild(placeholder);
      drawInteriorFallback(world, sceneId);
    }
    drawHotspots(world, scene);
  }

  function drawSky(world: Container, worldWidth: number) {
    const sky = new Graphics();
    sky.rect(0, 0, worldWidth, SCENE_H);
    sky.fill({ color: 0x111724 });
    sky.rect(0, 0, worldWidth, 420);
    sky.fill({ color: 0x182236, alpha: 0.9 });
    sky.circle(1280, 145, 82);
    sky.fill({ color: 0xe7d9ad, alpha: 0.22 });
    world.addChild(sky);
  }

  function drawFarTrees(world: Container, worldWidth: number) {
    const trees = new Graphics();
    for (let x = -80; x < worldWidth + 120; x += 130) {
      const h = 230 + ((x * 17) % 120);
      trees.rect(x, 380 - h, 58, h);
      trees.fill({ color: 0x151f1c, alpha: 0.88 });
      trees.circle(x + 28, 360 - h, 95);
      trees.fill({ color: 0x1e3028, alpha: 0.82 });
    }
    world.addChild(trees);
  }

  function drawSwampWater(world: Container, worldWidth: number) {
    const water = new Graphics();
    water.rect(0, 540, worldWidth, 360);
    water.fill({ color: 0x263d34, alpha: 0.95 });
    for (let x = 0; x < worldWidth; x += 180) {
      water.ellipse(x + 70, 650 + (x % 3) * 20, 95, 8);
      water.stroke({ color: 0xb6ff3a, width: 2, alpha: 0.18 });
    }
    world.addChild(water);
  }

  function drawWorldLandmarks(world: Container) {
    drawHut(world, 270, 355);
    drawSmallSign(world, 920, 620, 'NOW');
    drawPosterBoard(world, 1510, 430);
    drawSmallSign(world, 2410, 590, 'STUDIO');
    drawBar(world, 2900, 320);
  }

  function drawHut(world: Container, x: number, y: number) {
    const g = new Graphics();
    g.rect(x + 35, y + 150, 310, 240);
    g.fill({ color: 0x4a3320 });
    g.poly([x, y + 170, x + 190, y, x + 390, y + 170]);
    g.fill({ color: 0x24352b });
    g.rect(x + 145, y + 255, 80, 135);
    g.fill({ color: 0x1a120a });
    g.rect(x + 255, y + 220, 58, 54);
    g.fill({ color: 0xe9c46a, alpha: 0.9 });
    g.circle(x + 285, y + 248, 86);
    g.fill({ color: 0xe9c46a, alpha: 0.08 });
    world.addChild(g);
  }

  function drawBar(world: Container, x: number, y: number) {
    const g = new Graphics();
    g.rect(x, y + 115, 430, 330);
    g.fill({ color: 0x3b2112 });
    g.poly([x - 30, y + 135, x + 210, y, x + 470, y + 135]);
    g.fill({ color: 0x25140a });
    g.rect(x + 110, y + 210, 110, 170);
    g.fill({ color: 0x120a05 });
    g.rect(x + 255, y + 210, 95, 68);
    g.fill({ color: 0xe9c46a, alpha: 0.88 });
    g.rect(x + 108, y + 75, 225, 54);
    g.fill({ color: 0x080604, alpha: 0.92 });
    world.addChild(g);

    const label = new Text({
      text: 'EDISON',
      style: {
        fill: 0xe9c46a,
        fontSize: 32,
        fontFamily: 'monospace',
        letterSpacing: 5,
      },
    });
    label.x = x + 132;
    label.y = y + 84;
    world.addChild(label);
  }

  function drawSmallSign(world: Container, x: number, y: number, text: string) {
    const g = new Graphics();
    g.rect(x, y, 150, 82);
    g.fill({ color: 0x111111, alpha: 0.85 });
    g.stroke({ color: 0xe9c46a, width: 3, alpha: 0.7 });
    g.rect(x + 68, y + 82, 12, 115);
    g.fill({ color: 0x3f2b1c });
    world.addChild(g);

    const label = new Text({
      text,
      style: { fill: 0xf4ead5, fontSize: 25, fontFamily: 'monospace', letterSpacing: 3 },
    });
    label.anchor.set(0.5);
    label.x = x + 75;
    label.y = y + 42;
    world.addChild(label);
  }

  function drawPosterBoard(world: Container, x: number, y: number) {
    const g = new Graphics();
    g.rect(x, y, 260, 235);
    g.fill({ color: 0x1a120a });
    g.stroke({ color: 0xd4b886, width: 5, alpha: 0.65 });
    for (let i = 0; i < 4; i += 1) {
      g.rect(x + 24 + i * 56, y + 28 + (i % 2) * 38, 42, 70);
      g.fill({ color: i % 2 ? 0x8c9a6b : 0xd4b886, alpha: 0.9 });
    }
    world.addChild(g);
  }

  function drawBoardwalk(world: Container, worldWidth: number, laneY: number) {
    const g = new Graphics();
    g.rect(0, laneY - 28, worldWidth, 98);
    g.fill({ color: 0x342416, alpha: 0.96 });
    for (let x = 0; x < worldWidth; x += 72) {
      g.rect(x, laneY - 34, 48, 108);
      g.fill({ color: x % 144 === 0 ? 0x4a3320 : 0x3c2a1a, alpha: 0.95 });
      g.stroke({ color: 0x19100a, width: 2, alpha: 0.55 });
    }
    world.addChild(g);
  }

  function drawForegroundReeds(world: Container, worldWidth: number) {
    const g = new Graphics();
    for (let x = -20; x < worldWidth; x += 54) {
      const h = 80 + (x % 5) * 18;
      g.moveTo(x, SCENE_H);
      g.lineTo(x + 18, SCENE_H - h);
      g.stroke({ color: 0x617044, width: 6, alpha: 0.85 });
    }
    world.addChild(g);
  }

  function createFrogfacePlayer() {
    const frog = new Container();

    const body = new Graphics();
    body.ellipse(0, -105, 54, 74);
    body.fill({ color: 0x6b7a3f });
    body.ellipse(0, -92, 35, 48);
    body.fill({ color: 0xd4b886 });
    body.circle(-38, -178, 28);
    body.circle(38, -178, 28);
    body.fill({ color: 0x6b7a3f });
    body.ellipse(0, -160, 82, 56);
    body.fill({ color: 0x6b7a3f });
    body.ellipse(0, -143, 72, 18);
    body.fill({ color: 0xd4b886 });
    body.rect(-50, -118, 100, 38);
    body.fill({ color: 0x4b5563 });
    body.ellipse(-34, -178, 22, 10);
    body.ellipse(34, -178, 22, 10);
    body.fill({ color: 0xe8d9b8 });
    body.rect(-55, -181, 42, 5);
    body.rect(14, -181, 42, 5);
    body.fill({ color: 0x1d1d1b });
    body.ellipse(-78, -97, 16, 64);
    body.ellipse(78, -97, 16, 64);
    body.fill({ color: 0x6b7a3f });
    body.ellipse(-35, -24, 18, 62);
    body.ellipse(35, -24, 18, 62);
    body.fill({ color: 0x6b7a3f });
    body.ellipse(-48, 22, 42, 13);
    body.ellipse(48, 22, 42, 13);
    body.fill({ color: 0x6b7a3f });
    frog.addChild(body);

    frog.scale.set(0.84);
    return frog;
  }

  function drawHotspots(world: Container, scene: Scene) {
    for (const obj of scene.objects) {
      const objContainer = new Container();
      objContainer.x = obj.x;
      objContainer.y = obj.y;

      if (obj.image) {
        loadObjectImage(objContainer, obj);
      }

      const w = obj.w ?? 220;
      const h = obj.h ?? 220;
      const hitArea = new Graphics();
      hitArea.roundRect(0, 0, w, h, 14);
      hitArea.fill({ color: 0xffffff, alpha: 0.001 });
      objContainer.addChild(hitArea);

      const glow = new Graphics();
      glow.roundRect(0, 0, w, h, 14);
      glow.stroke({ color: 0xfff3a8, width: 4, alpha: 0.45 });
      glow.fill({ color: 0xfff3a8, alpha: 0.05 });
      glow.alpha = 0;
      objContainer.addChild(glow);

      objContainer.eventMode = 'static';
      objContainer.cursor = 'pointer';
      objContainer.on('pointertap', () => handleClick(obj));
      objContainer.on('pointerenter', () => {
        setHoveredObject(obj);
        glow.alpha = 1;
      });
      objContainer.on('pointerleave', () => {
        setHoveredObject((prev) => (prev?.id === obj.id ? null : prev));
        glow.alpha = 0;
      });

      world.addChild(objContainer);
    }
  }

  async function loadObjectImage(container: Container, obj: WorldObject) {
    if (!obj.image) return;
    try {
      const tex = await Assets.load(obj.image);
      const sprite = new Sprite(tex);
      if (obj.scale) sprite.scale.set(obj.scale);
      container.addChildAt(sprite, 0);
    } catch {
      // Procedural hotspots remain usable when image assets are missing.
    }
  }

  function updateNearObject(scene: Scene) {
    const playerX = playerXRef.current;
    const near = scene.objects.find((obj) => {
      const center = obj.x + (obj.w ?? 0) / 2;
      return Math.abs(center - playerX) < 170;
    }) ?? null;

    if (nearObjectRef.current?.id !== near?.id) {
      nearObjectRef.current = near;
      setNearObject(near);
    }
  }

  function drawInteriorFallback(world: Container, sceneId: string) {
    const label = new Text({
      text: sceneId === 'hut-interior' ? 'FROGFACE HUT' : 'EDISON BAR',
      style: {
        fill: 0xf4ead5,
        fontSize: 48,
        fontFamily: 'monospace',
        align: 'center',
        letterSpacing: 6,
      },
    });
    label.anchor.set(0.5);
    label.x = SCENE_W / 2;
    label.y = 170;
    world.addChild(label);
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
        break;
    }
  }

  function getScene(sceneId: string): Scene | undefined {
    return worldState.scenes[sceneId] as Scene | undefined;
  }

  const ambientColor = currentScene === 'bar-interior'
    ? '#1f1308'
    : currentScene === 'hut-interior'
      ? '#1a120a'
      : '#0e1218';
  const activeTooltip = hoveredObject?.tooltip ?? nearObject?.tooltip;
  const isExternal = currentScene === 'external';

  return (
    <div className="relative h-dvh w-full overflow-hidden" style={{ background: ambientColor }}>
      <div ref={hostRef} className="relative z-10 h-full w-full" />
      <div
        className="pointer-events-none absolute inset-0 z-[15]"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,0.48) 100%)',
        }}
        aria-hidden
      />

      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col">
        <div className="flex items-start justify-between p-4 md:p-6">
          <a
            href="/"
            className="pointer-events-auto rounded-full bg-black/75 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.24em] text-[#f4ead5] shadow-lg backdrop-blur transition-colors hover:text-[#fff8e0]"
          >
            frogface / world
          </a>
          <div className="pointer-events-auto flex gap-2">
            {!isExternal && (
              <button
                onClick={() => setCurrentScene('external')}
                className="rounded-full border border-[#f4ead5]/35 bg-black/75 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[#f4ead5]/90 shadow-lg backdrop-blur transition-colors hover:border-[#f4ead5]"
              >
                outside
              </button>
            )}
            <a
              href="/studio"
              className="rounded-full border border-[#b6ff3a]/60 bg-black/75 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[#b6ff3a] shadow-lg backdrop-blur transition-colors hover:bg-[#b6ff3a]/15"
            >
              studio
            </a>
          </div>
        </div>

        {showHints && isExternal && !activeTooltip && (
          <div className="hint-pulse pointer-events-none absolute bottom-24 left-1/2 max-w-[92vw] -translate-x-1/2 rounded-full border border-[#f4ead5]/15 bg-black/65 px-4 py-2 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-[#f4ead5]/85 backdrop-blur">
            A/D or arrows. Walk to doors and press enter.
          </div>
        )}

        {activeTooltip && (
          <button
            onClick={() => nearObjectRef.current && handleClick(nearObjectRef.current)}
            className="pointer-events-auto absolute bottom-28 left-1/2 max-w-[86vw] -translate-x-1/2 rounded-full border border-[#f4ead5]/15 bg-black/80 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.24em] text-[#f4ead5] backdrop-blur transition-colors hover:border-[#b6ff3a]/60"
          >
            {activeTooltip}
          </button>
        )}

        {isExternal && (
          <div className="pointer-events-none absolute inset-x-0 bottom-5 flex items-end justify-between px-5 md:hidden">
            <MoveButton dir={-1} onDirChange={(dir) => { touchDirRef.current = dir; }} />
            <MoveButton dir={1} onDirChange={(dir) => { touchDirRef.current = dir; }} />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes hintPulse {
          0%, 100% { opacity: 0.45; transform: translate(-50%, 0); }
          50% { opacity: 1; transform: translate(-50%, -4px); }
        }
        .hint-pulse {
          animation: hintPulse 2.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

function MoveButton({
  dir,
  onDirChange,
}: {
  dir: -1 | 1;
  onDirChange: (dir: MoveDir) => void;
}) {
  return (
    <button
      className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#f4ead5]/20 bg-black/90 shadow-lg backdrop-blur active:scale-95"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        onDirChange(dir);
      }}
      onPointerUp={() => onDirChange(0)}
      onPointerCancel={() => onDirChange(0)}
      onPointerLeave={() => onDirChange(0)}
      aria-label={dir < 0 ? 'Move left' : 'Move right'}
      type="button"
    >
      <span
        className={`block h-4 w-4 border-b-2 border-[#f4ead5] border-r-2 ${
          dir < 0 ? 'rotate-[135deg]' : '-rotate-45'
        }`}
        aria-hidden
      />
    </button>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
