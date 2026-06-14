# Frogface 2.5D World Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the existing `/world` PixiJS scene into the first playable 2.5D side-scroll Frogface world.

**Architecture:** Keep the existing Next.js route and PixiJS world component, but replace the external scene behavior with a horizontal playable street. The first pass uses procedural Pixi art and lightweight particles so the world is immediately testable; Codex built-in Image 2 assets can replace the procedural layers after the controls and composition are proven.

**Tech Stack:** Next.js 16, React 19, TypeScript, PixiJS 8, existing `src/lib/world` data files.

---

## File Structure

- Modify `src/lib/world/types.ts`: extend world data with optional `worldWidth`, `walkable`, `playerStart`, and parallax `layers`.
- Modify `src/lib/world/worldState.json`: configure the external world as a wide side-scroll swamp street with hut, bar, studio, gallery, now/about hotspots.
- Replace `src/components/world/WorldStage.tsx`: implement camera follow, keyboard/touch left-right movement, procedural layered stage, player sprite placeholder, hotspots, fog/fireflies/water shimmer.
- Modify `src/app/world/page.tsx`: update route comments and keep modal integration.
- Later asset pass: generate project-bound Image 2 scene layers, save under `public/world/frogface/`, and swap procedural layers for image sprites.

---

### Task 1: Data Model For A Wide Walkable Scene

**Files:**
- Modify: `src/lib/world/types.ts`
- Modify: `src/lib/world/worldState.json`

- [ ] **Step 1: Extend scene types**

Add optional properties to `Scene`:

```ts
export interface WorldLayer {
  id: string;
  kind: 'procedural' | 'image';
  image?: string;
  depth: number;
  tint?: string;
}

export interface Scene {
  background: string;
  ambient?: 'swamp-night' | 'hut-warm' | 'bar-warm';
  worldWidth?: number;
  playerStart?: number;
  walkable?: { minX: number; maxX: number; y: number };
  layers?: WorldLayer[];
  objects: WorldObject[];
}
```

- [ ] **Step 2: Update external world data**

Set `external.worldWidth` to `3600`, `playerStart` to `520`, and `walkable` to `{ "minX": 240, "maxX": 3320, "y": 790 }`. Keep existing interiors unchanged.

- [ ] **Step 3: Run type-check**

Run: `npm run type-check`  
Expected: no TypeScript errors.

---

### Task 2: Playable Pixi Side-Scroll Stage

**Files:**
- Replace: `src/components/world/WorldStage.tsx`

- [ ] **Step 1: Implement camera/player loop**

Create a Pixi scene that:

- initializes at `1920x1080`;
- reads `scene.worldWidth`;
- moves the player with `ArrowLeft`, `ArrowRight`, `A`, `D`;
- supports mobile buttons through React pointer handlers;
- clamps player X to `walkable.minX/maxX`;
- follows the player with a smoothed camera offset;
- renders hotspots in world coordinates.

- [ ] **Step 2: Draw procedural layers**

Draw wide swamp layers directly in Pixi:

- sky gradient rectangle;
- far tree silhouettes;
- mid swamp water;
- wooden path;
- hut at left;
- Edison bar/studio at right;
- foreground reeds;
- glow zones and warm windows.

- [ ] **Step 3: Add player placeholder**

Draw Frogface as a stylized simple Pixi container: green body, sleepy eyes, belly, shorts, slight bob while walking. This is not final art; it is a playable placeholder until Image 2 sprite assets are generated.

- [ ] **Step 4: Preserve interactions**

Use existing `parseClick` behavior:

- `scene:*` switches current scene;
- `route:*` navigates through Next router;
- `case:*` opens the existing case modal.

- [ ] **Step 5: Run type-check**

Run: `npm run type-check`  
Expected: no TypeScript errors.

---

### Task 3: Mobile HUD And Route Polish

**Files:**
- Modify: `src/components/world/WorldStage.tsx`
- Modify: `src/app/world/page.tsx`

- [ ] **Step 1: Add minimal HUD**

Add:

- top-left world label;
- contextual tooltip for hovered/nearby hotspot;
- bottom-left and bottom-right touch movement buttons;
- small "enter" button when Frogface is near a hotspot on mobile.

- [ ] **Step 2: Keep the page full-screen**

Ensure `/world` fills the viewport and avoids normal document scrolling.

- [ ] **Step 3: Run build**

Run: `npm run build`  
Expected: production build succeeds.

---

### Task 4: Browser Verification

**Files:**
- No code changes unless verification finds issues.

- [ ] **Step 1: Start dev server**

Run: `npm run dev -- --port 3002`  
Expected: Next dev server starts.

- [ ] **Step 2: Open `/world` in browser**

Use Browser/Playwright to verify:

- canvas is not blank;
- Frogface moves left/right;
- camera follows;
- hotspots are visible/reactive;
- mobile viewport shows touch controls without overlap.

- [ ] **Step 3: Fix discovered issues**

If controls, canvas sizing, or layout fail, patch the smallest affected file and repeat type-check/build.

---

### Task 5: Image 2 Asset Pass

**Files:**
- Create: `refs/world/frogface-25d-prompts.md`
- Create or update: `public/world/frogface/*`
- Modify: `src/lib/world/worldState.json`
- Modify: `src/components/world/WorldStage.tsx`

- [ ] **Step 1: Generate first concept layer with Codex built-in Image 2**

Generate a wide side-scroll swamp street concept for Frogface.space. Use no Higgsfield for static images.

- [ ] **Step 2: Save selected image into workspace**

Move/copy the selected generated image into `public/world/frogface/` with a descriptive filename.

- [ ] **Step 3: Replace one procedural layer**

Load the image layer through Pixi `Assets.load()` while keeping procedural fallback.

- [ ] **Step 4: Verify and build**

Run: `npm run type-check` and `npm run build`.  
Expected: both pass.

---

## Self-Review

- Spec coverage: playable movement, parallax/depth, hotspots, mobile controls, ambient motion, and Image 2 asset path are covered.
- Scope: one external side-scroll scene first; interiors and final 3D character are excluded.
- No placeholders: procedural art is an intentional first-pass implementation, not missing work.
