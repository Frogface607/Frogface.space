# frogface.space

Personal site by Серёжа Орлов (Frogface). Two-mode experience: **cartoon swamp world** you can walk around + **B2B Studio landing** for business automation.

> Маскот: уставший предприниматель с нулём денег, пытается выбраться из болота.

## Quick start

```bash
npm install
npm run dev        # → http://localhost:3000 (or 3001 if 3000 busy)
npm run build      # production build
npm run lint
npm run type-check
```

## Project structure

```
src/
├── app/
│   ├── page.tsx                  # External swamp world (WorldStage)
│   ├── hut/page.tsx              # Inside Frogface hut (WorldStage interior)
│   ├── bar/page.tsx              # Inside Edison bar (WorldStage interior)
│   ├── now/page.tsx              # /now stub
│   ├── gallery/page.tsx          # /gallery stub
│   ├── about/page.tsx            # /about stub
│   ├── studio/page.tsx           # B2B landing (full sections)
│   ├── globals.css               # Canon palette + Tailwind 4
│   └── layout.tsx                # Root layout + fonts
├── components/
│   ├── world/WorldStage.tsx      # PixiJS application + scene switching
│   └── ui/StubPage.tsx           # Generic stub for in-progress routes
└── lib/world/
    ├── types.ts                  # Scene/Object/Tier types + parseClick
    ├── worldState.json           # 3 scenes config (external + 2 interiors)
    └── particles.ts              # Firefly emitter for swamp ambience

public/world/                     # AI-generated assets (8 base + overnight batch)
├── external/                     # hut.png, bar.png, swamp-bg.png
├── interior/                     # hut.png, bar.png
├── studio/                       # hero.png, pain-*.png
├── now/                          # hero.png
└── about/                        # hero.png

refs/character/                   # Source character sheets (9 files from Босса)
├── *.png                         # Character bible (turnaround, poses, walk, hands)
├── _soul-id.txt                  # FrogfaceSerge Soul-ID
└── _uuids.txt                    # Higgsfield upload UUIDs

refs/character/test/              # Soul-ID test gens (3 scenes)
refs/character/batch-01/          # Soul-ID batch (12 ассетов, illustrative)
refs/character/batch-02-nb/       # NB+sheets batch (3 ассета, outlined cartoon canon)
refs/character/batch-01/          # First production batch
refs/overnight/                   # Overnight batch (variants for selection)

docs/
├── superpowers/specs/
│   └── 2026-05-27-frogface-space-spec-v3.md   # FINAL design spec
├── character-bible-spec-for-chatgpt.md         # ChatGPT brief
├── world-voice-brief-questions.md              # Voice brief questions
├── higgs-cli-style-exploration.md              # Style exploration log
└── prompts-chatgpt-style-exploration.md        # ChatGPT style prompts
```

## Spec

Read [docs/superpowers/specs/2026-05-27-frogface-space-spec-v3.md](docs/superpowers/specs/2026-05-27-frogface-space-spec-v3.md) for the full design. Two-mode architecture:

- **`/`** — external isometric swamp world (PixiJS)
  - Click on хижина → `/hut` interior
  - Click on бар → `/bar` interior
  - Top-right button → `/studio`

- **`/hut`** — inside Frogface hut
  - Click on Frogface at desk → `/now`
  - Click on posters → `/gallery`
  - Click on bookshelf → `/about`
  - Click on door → back to external

- **`/bar`** — inside Edison bar (cartoon)
  - 6 cliсkable Edison Toolkit modules
  - "Хочешь такой же бизнес?" door → `/studio`

- **`/studio`** — separate B2B landing (light theme, не cartoon)
  - Hero / Pain Cards / Edison Modules / Packages / Process / About / Brief

## Asset pipeline

All Frogface scenes generated through Higgsfield `nano_banana_2` model with character sheets as image-to-image refs:

```bash
higgsfield generate create nano_banana_2 \
  --prompt "Same anthropomorphic frog character from reference sheets, in signature black hoodie..., [SCENE]. Outlined cartoonish painterly style matching reference, NOT photorealistic." \
  --aspect_ratio 16:9 \
  --resolution 2k \
  --image 73e0ba05-0768-4645-afda-b63197fceaf4 \
  --image 32a45125-2abc-493c-8900-1488fabf7c98 \
  --wait
```

Sheet UUIDs (in `refs/character/_uuids.txt`):
- `73e0ba05-...` — character v2 (turnaround + expressions + ABOUT)
- `32a45125-...` — pose sheet (8 poses + emotions + hands)
- `6b8dce8f-...` — walk cycle (4 dir × 6 frames)

Soul-ID `FrogfaceSerge` (`bb0b2bd4-...`) trained but `nano_banana_2 + sheets` gives more canon-style output than Soul-V2 endpoint.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 (CSS-based config in `globals.css`)
- PixiJS 8.18 (world rendering)
- Framer Motion 11 (UI overlays)
- Lenis (smooth scroll)
- Higgsfield CLI + Nano Banana Pro + Seedance 2 (asset generation)

## Hard rules

- ⛔ **WIZL** не транслируется на русскую аудиторию (38-ФЗ риск). Только wizl.space (EN/TH).
- ⛔ Никакого 3D, Pixar, реализма, нуара или магии. Только outlined cartoonish painterly canon.
- ⛔ Edison-бар в мире = cartoon. Реальные фото — только в `/studio` modules section.
- ⛔ Tier-up — руками Босса.

## Current state (27 мая 2026)

- ✅ Spec v3 (FINAL) написан
- ✅ Soul-ID + sheet pipeline отлажен
- ✅ World infra (PixiJS + 3 scenes + click zones + fireflies)
- ✅ 8 base assets + overnight batch (~18 variants)
- ✅ Studio landing skeleton (полная структура из spec)
- 🟡 Walk-cycle спрайт Frogface — в очереди (есть sheet, нужно собрать sprite-sheet)
- 🟡 Interior click zones — координаты нужно подогнать под реальные PNG
- 🟡 Now → Telegram автопостинг (Release 2)
- 🟡 Brief form подключение (Release 2)

## Links

- **Production:** https://frogface.space (когда задеплоим)
- **Канал:** [@sergeyorlove](https://t.me/sergeyorlove) — С Лицом Лягушки
- **Edison archive:** https://edisonbar.ru (закрывается 31 мая 2026)
- **WIZL:** https://wizl.space (соседняя вселенная EN/TH)
