# Frogface 2.5D World Design

Date: 2026-06-14  
Status: draft for Boss review

## Goal

Build the first genuinely game-like Frogface.space world without burying the project in full 3D character, rigging, topology, and mobile camera complexity.

The experience should feel like a small playable cartoon world: Frogface walks left and right through a swamp street, the camera follows, layers move with depth, lights and fog breathe, and key places open the site's sections.

This replaces the old "no 3D ever" constraint with a more practical rule: use 2.5D first, reserve real 3D for selected props, previews, and later upgrades.

## Core Decision

Use a side-scroll 2.5D world as the main Frogface experience.

- Frogface movement: left/right walking, idle, simple touch controls on mobile.
- World layout: hut on the left, swamp bridge and details in the center, Edison bar/studio gateway on the right.
- Visual structure: layered AI-generated images, parallax depth, animated loops, particles, water, fog, and lighting.
- Navigation: clickable/enterable hotspots route to `/hut`, `/bar`, `/studio`, `/gallery`, `/about`, and `/now`.
- 3D scope: optional small Three.js depth elements only where they help, not a full 3D game.

## Why This Path

Full 3D is the dream, but the immediate bottleneck is character quality, rigging, animation, asset sourcing, mobile performance, and export workflows. A 2.5D side-scroll world gives the emotional result faster: it feels alive, game-like, and personal while using tools we already control.

The site can still evolve toward 3D later. The 2.5D version becomes the canonical world map and art direction, not throwaway work.

## Art Pipeline

Primary image generation:

- Codex built-in Image 2 for high-quality static art layers and sprite/source images.
- Existing Frogface character sheet and Soul/canon references for consistency.
- Prompt lock: stylized cartoon/painterly, not photorealistic, not Pixar, no text artifacts.

Animation:

- Seedance 2 through Higgsfield for short looping clips when motion is worth the cost.
- Use video loops sparingly: water shimmer, fog drift, bar sign flicker, fireflies, interior ambience.
- Prefer CSS/canvas/particle animation for simple repeated effects.

Layer preparation:

- Generate wide horizontal scene panels.
- Split into depth layers: sky, far trees, mid swamp, ground path, foreground reeds, building fronts, overlays.
- Keep important objects on separate transparent PNG/WebP layers where possible.
- Store raw generations and chosen production assets separately.

## Experience Design

First screen opens directly into the world, not a landing page.

Player starts near the hut. The camera follows as Frogface walks. The environment should immediately communicate tired swamp entrepreneur energy: a beautiful but slightly broke command center, handmade signs, wet boards, warm windows, and Edison glow in the distance.

Expected interactions:

- Enter hut: opens `/hut`.
- Enter Edison bar: opens `/bar`.
- Studio sign or door: opens `/studio`.
- Poster board: opens `/gallery`.
- Desk/window hint: opens `/now`.
- Wardrobe/memory object: opens `/about`.

The first version can show a compact helper overlay only if needed, but the world should be understandable through affordances: doors glow, signs react, cursor changes, and mobile buttons are visible.

## Technical Architecture

Use the existing Next.js app.

Recommended runtime:

- PixiJS for the main 2.5D world, because the project already includes PixiJS and it fits layered sprites, camera movement, particles, and mobile performance.
- Three.js remains available for separate experiments, character preview, or selected 3D props.

Core modules:

- `WorldScene`: Pixi canvas host and lifecycle.
- `WorldCamera`: follows player and clamps to world bounds.
- `PlayerController`: keyboard, pointer, and mobile touch movement.
- `LayeredStage`: loads parallax image layers and animated overlays.
- `HotspotSystem`: world-space hit zones with hover/tap states and route actions.
- `WorldHud`: minimal route/menu controls and mobile movement buttons.

Asset organization:

- `public/world/frogface/` for optimized runtime assets.
- `refs/world/` for prompts, source generations, and chosen references.
- Keep generated source notes in markdown so future sessions can reproduce the look.

## MVP Scope

The first implementation pass should deliver one horizontal playable scene:

- One route: `/world` or replacing `/` after review.
- Frogface placeholder with idle and walk states.
- Three to five parallax background/foreground layers.
- At least four hotspots: hut, bar, studio, gallery/poster.
- Ambient effects: fog, fireflies, water shimmer, warm lights.
- Keyboard support on desktop.
- Touch controls on mobile.
- Vercel-safe build with optimized assets.

## Character Strategy

Do not block the world on a perfect 3D Frogface.

First playable version uses a 2D Frogface sprite/billboard generated from the existing character sheet. The sprite can be upgraded in stages:

1. Static idle sprite.
2. Two-to-four frame walk cycle.
3. Seedance-assisted short walk loop converted to sprites if quality is good.
4. Later replacement with a rigged 3D/2.5D character when the model pipeline is solved.

## Quality Bar

The first release should feel:

- alive, not static;
- personal, not template-like;
- readable on mobile;
- fast enough to deploy;
- expandable without rewriting the world.

It does not need:

- full physics;
- inventory;
- dialogue trees;
- combat;
- final 3D character;
- huge map;
- multiplayer or backend state.

## Risks And Mitigations

Asset inconsistency:

- Use the same canon references and locked style prompts.
- Generate whole scene concepts first, then split or regenerate layers from the approved direction.

Animation cost and file size:

- Use Seedance 2 only for high-impact loops.
- Convert video to compressed WebM or sprite strips when needed.
- Use procedural particles for simple ambience.

Mobile controls:

- Keep movement one-dimensional.
- Use large touch zones instead of complex camera controls.

Scope creep:

- Ship one beautiful street before adding interiors or a second area.
- Treat full 3D as a sandbox branch, not the critical path.

## Acceptance Criteria

- The world is playable with left/right movement on desktop and mobile.
- The scene has visible depth through parallax and foreground layers.
- At least four hotspots are discoverable and navigate to existing routes.
- Frogface appears in the world and reads as the canon character, even if placeholder quality.
- Ambient motion is present without relying on heavy full-screen video.
- The app passes type-check and production build.
- The result can be deployed to Vercel and reviewed on `frogface.space`.

## Open Follow-Up Decisions

- Whether `/world` launches as a sandbox first or becomes the homepage immediately.
- Whether the first Frogface sprite is generated as a clean side-view sheet or extracted from an animated Seedance loop.
- Whether the first environment is one long swamp street or a shorter dense diorama.
