# 3D Frogface Character Design

Date: 2026-06-12  
Status: approved direction, ready for implementation plan

## Goal

Create the first reusable 3D Frogface character for frogface.space: not a one-off render, but a web/game-ready asset that can walk inside the future 3D world.

The character starts from the existing canon reference sheet:

- `refs/character/base-v3-neutral.png`
- Soul ID: `FrogfaceSerge`
- Current canon: anthropomorphic frog, olive skin, warm belly, tired expressive eyes, visible spots, long hands and feet.

## Core Decision

Build the character as two layers in one asset pipeline:

1. **Base Frogface**: neutral body in boxer shorts. This is the rig master and source of truth.
2. **Present-day outfit layer**: grey jeans plus a necklace with a peace-sign pendant.

The necklace must sit around the neck, with the pendant hanging naturally on the upper chest. It must not grow out of the chest or be fused into the body.

## Why Base-First

The base version keeps the character reusable. Future scenes can add hoodies, bartender clothing, travel clothes, studio clothes, or joke outfits without rebuilding identity every time.

The outfit layer gives the site the current recognizable Frogface look immediately.

## Visual Canon

- Stylized game character, not photorealistic.
- Not Pixar, not glossy toy, not generic mascot.
- Soft painterly surface feel translated into 3D through colors, roughness, and simple toon-friendly shapes.
- Big sleepy eyes, slightly ironic expression, calm tired posture.
- Olive skin with darker spots on head, back, arms, and legs.
- Cream/tan belly and mouth area.
- Oversized hands and feet should remain readable from a third-person game camera.

## Production Pipeline

Stage 0: Generate sculpt/reference support with Higgsfield from the existing character sheet.

Stage 1: Create a first procedural/blockout GLB locally for immediate WebGL use:

- Body, head, eyes, belly, arms, legs, hands, feet.
- Spots as mesh decals or material marks.
- Boxer shorts as base clothing.
- Separate jeans mesh.
- Separate necklace chain and peace pendant.

Stage 2: Preview the GLB in a local Three.js viewer and inspect silhouette, scale, and materials.

Stage 3: If Blender becomes available, upgrade the model through Blender for sculpt polish, cleaner topology, rigging, and animation export.

Stage 4: Integrate the approved model into the 3D frogface.space world prototype.

## Deliverables For First Implementation Pass

- `public/3d/frogface/frogface-base.glb`
- `public/3d/frogface/frogface-present.glb` or one GLB with toggled outfit groups
- a local preview route or viewer for rotation, lighting, and inspection
- short README notes for asset anatomy and next steps

## Acceptance Criteria

- The model reads as the same Frogface from the sheet.
- It can be loaded in a browser without special tooling.
- Base body and present-day outfit are separable in structure.
- Grey jeans are visible and clearly not shorts.
- Necklace hangs from the neck; peace pendant placement is believable.
- The result is good enough to become the first playable character placeholder, even before sculpt-level polish.

## Explicit Non-Goals

- No full open-world implementation in this pass.
- No final animation set in this pass.
- No irreversible clothing lock.
- No replacement of the existing 2D pages yet.
