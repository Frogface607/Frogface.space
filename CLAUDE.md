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

### Frogface — neutral base anchor + situational wardrobe (v3, 7 июня 2026)

**ВАЖНО:** перешли с «вшитого костюма» на нейтральный base + одежду по ситуации.
Причина: чёрное худи в каждом кадре ломало логику биографии (детство ≠ худи), а пацифик-цепочка «росла из капюшона» (баг дизайна). Теперь base = голое тело+лицо (трусы), одежда задаётся в промпте под сцену/эпоху.

- **Base anchor (ИСПОЛЬЗОВАТЬ ВСЕГДА):** `11307639-90db-44b9-8e9b-c098476b5f50` — `base-v3-neutral.png` (turnaround фас/¾/профиль/спина + 6 эмоций + 3 кисти, нейтральные серые трусы, БЕЗ худи/пацифика). Один `--image` достаточно для консистентности лица.
- **Soul-ID:** `bb0b2bd4-cac2-454f-a969-58e9902e88ae` (soul_2, FrogfaceSerge)
- **LEGACY (НЕ использовать — старый худи+пацифик):** `73e0ba05...` (char v2), `32a45125...` (pose), `6b8dce8f...` (walk cycle). Перегенерить под новый base по мере надобности.
- **Present-day сигнатура:** TBD (Босс выбирает). Пока для present-day сцен — чистое серое худи БЕЗ цепочки/пацифика.
- **Reference files:** `D:\PROJECTS\FROGFACE-SPACE\refs\character\`

### Production pipeline

```bash
# Любая сцена с Frogface (новый пайплайн)
higgsfield generate create nano_banana_2 \
  --prompt "the same anthropomorphic green frog character from the reference sheet (consistent face, body, design), wearing [CLOTHES FOR THIS SCENE/ERA]. Scene: [DESC]. Outlined cartoonish painterly style, NOT photorealistic, NOT 3D, NOT Pixar. No text in image." \
  --aspect_ratio "16:9" \
  --resolution "2k" \
  --image 11307639-90db-44b9-8e9b-c098476b5f50 \
  --wait

# Одежда задаётся словами: kid t-shirt+shorts / bartender apron / clean grey hoodie / etc.
# Walk-cycle спрайты — нужно перегенерить новый walk sheet под base-v3
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
- **Wardrobe (не outfit-lock!):** base = нейтральный (трусы), одежду задаём в промпте под сцену/эпоху. НИКАКОГО пацифика/цепочки. Present-day = чистое серое худи без украшений (пока TBD).
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
