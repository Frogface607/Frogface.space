# 3D Frogface Character Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first browser-loadable 3D Frogface character asset with a neutral base body and separate present-day outfit layer.

**Architecture:** Use Three.js as the shared 3D foundation. Generate first-pass GLB assets procedurally from simple named meshes so the model is immediately inspectable in WebGL and later replaceable with Blender-polished geometry.

**Tech Stack:** Next.js 16, React 19, TypeScript, Three.js, GLTFExporter, GLTFLoader.

---

## File Structure

- Modify `package.json` and `package-lock.json`: add `three`.
- Create `scripts/generate-frogface-glb.mjs`: procedural model generator and GLB exporter.
- Create `public/3d/frogface/`: generated GLB assets and asset notes.
- Create `src/components/character/FrogfaceViewer.tsx`: client-side Three.js viewer for inspection.
- Create `src/app/character/page.tsx`: preview route.

## Task 1: Add Three.js

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install dependency**

Run: `npm install three`

Expected: `three` appears in `dependencies`.

- [ ] **Step 2: Verify package install**

Run: `npm ls three`

Expected: output includes `three@...` under `frogface-space`.

- [ ] **Step 3: Commit dependency**

Run:

```bash
git add package.json package-lock.json
git commit -m "chore: add three for 3d character work"
```

## Task 2: Generate First GLB Assets

**Files:**
- Create: `scripts/generate-frogface-glb.mjs`
- Create: `public/3d/frogface/frogface-base.glb`
- Create: `public/3d/frogface/frogface-present.glb`
- Create: `public/3d/frogface/README.md`

- [ ] **Step 1: Write generator**

Create `scripts/generate-frogface-glb.mjs` with:

- named groups `Frogface_Base`, `Frogface_Outfit_Present`, `Frogface_Accessories`
- olive body, tan belly/mouth, darker spots, sleepy eyes
- boxer shorts in base
- grey jeans as outfit mesh
- gold necklace around the neck with peace pendant hanging on the chest
- GLB export for base-only and present outfit variants

- [ ] **Step 2: Run generator**

Run: `node scripts/generate-frogface-glb.mjs`

Expected:

```text
Wrote public/3d/frogface/frogface-base.glb
Wrote public/3d/frogface/frogface-present.glb
```

- [ ] **Step 3: Add asset notes**

Create `public/3d/frogface/README.md` describing which groups are base, outfit, and accessories.

- [ ] **Step 4: Commit assets**

Run:

```bash
git add scripts/generate-frogface-glb.mjs public/3d/frogface
git commit -m "feat: generate first frogface 3d character assets"
```

## Task 3: Add Browser Preview Route

**Files:**
- Create: `src/components/character/FrogfaceViewer.tsx`
- Create: `src/app/character/page.tsx`

- [ ] **Step 1: Build viewer component**

Create a client component that:

- initializes a Three.js scene
- loads `/3d/frogface/frogface-present.glb` with `GLTFLoader`
- uses `OrbitControls`
- adds warm key light, soft fill light, and ground shadow plane
- shows a small model-status label outside the canvas
- cleans up renderer, controls, and DOM nodes on unmount

- [ ] **Step 2: Build route**

Create `/character` as a full-screen inspection page with restrained UI and a link back to `/`.

- [ ] **Step 3: Verify TypeScript**

Run: `npm run type-check`

Expected: no TypeScript errors.

- [ ] **Step 4: Commit viewer**

Run:

```bash
git add src/components/character/FrogfaceViewer.tsx src/app/character/page.tsx
git commit -m "feat: add frogface 3d character preview"
```

## Task 4: Visual Verification

**Files:**
- No planned source edits unless verification exposes a bug.

- [ ] **Step 1: Start local server**

Run: `npm run dev`

Expected: Next.js starts on an available local port.

- [ ] **Step 2: Open preview**

Open `/character` in the browser.

Expected: the model loads, rotates with mouse/touch controls, and the jeans/necklace are visible.

- [ ] **Step 3: Check model anatomy**

Verify:

- Frogface silhouette reads from the sheet.
- Base body is visible beneath the outfit logic.
- Jeans are grey and separate from boxer shorts.
- Necklace sits around the neck.
- Peace pendant hangs on the upper chest.

- [ ] **Step 4: Final verification**

Run:

```bash
npm run type-check
npm run build
```

Expected: both commands finish successfully.

## Self-Review

Spec coverage:

- Base body in boxer shorts: Task 2.
- Present outfit layer with grey jeans: Task 2.
- Necklace and peace pendant placement: Task 2 and Task 4.
- Browser-loadable GLB: Task 2 and Task 3.
- Preview route: Task 3.
- Blender upgrade path: preserved by named mesh groups and generated asset notes.

Placeholder scan: no TBD/TODO/fill-in placeholders.

Type consistency: route, component, generator, and asset names use the same `frogface-base` and `frogface-present` naming.
