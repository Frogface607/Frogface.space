# FROGFACE.SPACE — Project Rules

> Personal site by Сергей Орлов (Frogface). Two-mode experience: vibe-world + B2B Studio landing.
> SPEC: `docs/superpowers/specs/2026-05-27-frogface-space-spec-v3.md` (v3 FINAL).

## Concept (one line)

**Frogface.space = cartoon swamp world you can walk around + B2B Studio landing for business automation.** Маскот — уставший предприниматель с нулём денег, пытается выбраться из болота.

## Architecture

### Two-mode experience

```
EXTERNAL WORLD (PixiJS isometric)
├── Хижина Frogface (HQ) → /hut (interior side-scroll)
└── Бар Edison (cartoon) → /bar (interior side-scroll)

INSIDE хижины:
  Frogface at desk → /now
  Постеры → /gallery (Edison афиши + design works)
  Шкаф → /about (biography scroll-comic)
  Door → back to external world

INSIDE бара:
  6 кликабельных модулей Edison Toolkit (бронь, AI-анонсы, меню, TG-бот, staff, admin)
  Дверь "хочешь такой же?" → /studio

STUDIO (отдельная business-страница)
└── /studio — B2B landing: pain cards (лягухи) → Edison cases → пакеты → brief form
```

### Routes

- `/` — external world (PixiJS)
- `/hut` — хижина interior
- `/bar` — Edison-бар interior (cartoon)
- `/now` — what I'm doing now (markdown, ручное в MVP)
- `/gallery` — Edison афиши + design archive
- `/about` — biography scroll-comic
- `/studio` — B2B landing (Frogface Studio - автоматизация бизнеса)

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS 4** (CSS-based config in globals.css, no config file)
- **PixiJS 8.18** (для внешнего мира и интерьеров)
- **Framer Motion 11** (оверлеи Studio / About / Gallery / Now)
- **Lenis** (smooth scroll где нужно)
- **next-intl** для будущего EN (после первых клиентов Studio)

## Маскот и Pipeline

### Frogface — Soul-ID locked + character sheets

- **Soul-ID:** `bb0b2bd4-cac2-454f-a969-58e9902e88ae` (soul_2, FrogfaceSerge)
- **Sheet UUIDs** (uploaded в Higgsfield):
  - `73e0ba05-0768-4645-afda-b63197fceaf4` — character v2 (turnaround + expressions + ABOUT)
  - `32a45125-2abc-493c-8900-1488fabf7c98` — pose sheet (8 поз + emotions + hands)
  - `6b8dce8f-04e8-498a-8652-5bf8df70d4b0` — walk cycle (4 dir × 6 frames)
- **Reference files:** `D:\PROJECTS\FROGFACE-SPACE\refs\character\`

### Production pipeline

```bash
# Любая сцена с Frogface
higgsfield generate create nano_banana_2 \
  --prompt "Same anthropomorphic frog character from reference sheets, in signature black hoodie with frog mark, peace pendant, white sneakers. Scene: [DESC]. Match outlined cartoonish style from reference, NOT photorealistic." \
  --aspect_ratio "16:9" \
  --resolution "2k" \
  --image 73e0ba05-0768-4645-afda-b63197fceaf4 \
  --image 32a45125-2abc-493c-8900-1488fabf7c98 \
  --wait

# Walk-cycle спрайты для PixiJS
--image 6b8dce8f-04e8-498a-8652-5bf8df70d4b0

# Анимации (image-to-video)
higgsfield generate create seedance_v2 --image <png> --prompt "..." --wait
```

## Color tokens (canon из character sheet)

```css
--canon-olive:  #6B7A3F  /* frog skin */
--canon-sage:   #8C9A6B  /* light green */
--canon-tan:    #D4B886  /* warm tan, mugs */
--canon-ink:    #2F2F2F  /* hoodie black */
--canon-grey:   #6E6E6E  /* mid */
--canon-light:  #BFBFBF  /* light grey */
--canon-paper:  #F4F4F0  /* paper / off-white */
```

## Conventions

- **Russian** UI text, **English** code/comments/commits
- **Tone:** honest ironic. *«я ебался, понял, сделал, тебе тоже могу»* — не корпоратив, не панк, не мотиватор
- **Frogface positioning:** «уставший предприниматель с нулём денег, пытается выбраться из болота» — не magical wizard, не founder calculated/adaptive
- **Outfit lock:** в каждом prompt явно указывать signature outfit (hoodie + peace pendant + sneakers)
- **Style lock:** в каждом prompt — outlined cartoonish painterly, no hard ink outlines, NOT photorealistic
- **No-text lock:** избегаем text artifacts (`no text in image, no speech bubbles`)
- **Edison cartoon в мире, реальные фото — только в /studio**

## Hard rules

- ⛔ **WIZL на русскую аудиторию НЕ транслируется** — cannabis-тематика = 38-ФЗ риск. WIZL живёт только на wizl.space (EN/TH).
- ⛔ **Никакого 3D** — только 2.5D PixiJS
- ⛔ **Никакой Pixar / реализма / нуара / магии** — только outlined cartoonish painterly canon (из character sheets)
- ⛔ **Tier-up — руками Босса**, не автомат
- ⛔ **/now автопостинг — релиз 2**, не MVP
- ⛔ **Никаких новых проектов в хижине** (лавовая лампа = OPERATOR, газета = POSADYAT и т.д.) — добавляем по мере того как сами становятся активны

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — lint check
- `npm run type-check` — TypeScript check

## Higgsfield CLI

```bash
higgsfield account status     # Ultra plan, credit balance
higgsfield model list --image # available models
higgsfield generate create nano_banana_2 ...
higgsfield upload create ./img.png  # upload as reference
```

Soul-ID + sheet UUIDs — see "Маскот" раздел выше или `refs/character/_soul-id.txt` + `_uuids.txt`.

## Source of truth

- **Design:** `docs/superpowers/specs/2026-05-27-frogface-space-spec-v3.md`
- **Edison Toolkit catalog (для /studio):** `D:\PROJECTS\FROGFACE-VAULT\canonical\edison-toolkit-catalog.md`
- **Boss positioning + canon:** `D:\claude-data\projects\D--PROJECTS\memory\MEMORY.md`
- **Character refs:** `D:\PROJECTS\FROGFACE-SPACE\refs\character\`
- **Style exploration archive:** `D:\PROJECTS\FROGFACE-SPACE\refs\character\batch-02-nb\` (canon-style)

## Current state (27 мая 2026)

- ✅ Skeleton Next 16 + PixiJS + Tailwind 4 — installed
- ✅ Soul-ID + sheet pipeline отлажен, batch-02 production-quality
- ✅ Spec v3 — fixed
- 🟡 PixiJS world infra — стартуем после этого CLAUDE.md
- 🟡 Asset pack v3 (хижина outside/inside, бар outside/inside) — в очереди
- 🟡 Routes / pages skeleton — в очереди
- 🟡 /studio landing — после мира
