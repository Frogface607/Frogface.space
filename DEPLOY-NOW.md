# Готов к деплою — нужен один шаг от тебя

Брат, всё что я мог — сделал. Commit `1ce8e0f` уже ушёл на GitHub (`master`).

## Если Vercel-GitHub интеграция уже настроена

**Ничего делать не нужно.** Push на master автоматически триггерит deploy. Зайди на:
- https://vercel.com/dashboard — увидишь build в работе или completed
- https://frogface.space — должна обновиться через 2-5 минут

## Если auto-deploy не настроен — manual deploy через CLI

В PowerShell:

```powershell
cd D:\PROJECTS\FROGFACE-SPACE
vercel login                # один раз — пройди device-code через браузер
vercel link                 # один раз — выбери существующий project Frogface.space или создай новый
vercel --prod               # деплой в production
```

Vercel сам определит что это Next.js 16 и соберёт. Build time ~2-3 минуты.

## Что в этой версии

- 7 живых страниц: `/`, `/hut`, `/bar`, `/studio`, `/now`, `/about`, `/gallery`
- World с PixiJS, fireflies, click-zones и CaseModal для бара
- Studio лендинг (B2B): Hero, Pain Cards, 11 Edison Modules, Packages $3K/$5K/$7.5-10K, Process с icons, About, Brief form
- 26 production assets в `public/world/`
- Fraunces + Geist + JetBrains Mono шрифты (через next/font)
- Spec v3 + CLAUDE.md + README.md + OVERNIGHT-SUMMARY.md

## Что в очереди (низкий приоритет)

- `#16` Seedance 2 анимации (лупы)
- `#31` Walk-cycle Frogface sprite-sheet
- Edison real screenshots в /studio
- Подключение реальной brief-формы → Telegram
- Mobile vertical adapter

## Если что-то покажется кривым на планшете

Скрин с пометками — поправлю за 5 минут. Главные подозреваемые:
- HUD pill на тёмных сценах — может всё ещё blend'ит
- Canvas object-fit cover на узком vertical — обрезает hut/bar по бокам external
- Tooltip на touch — может не появляться (touch не имеет hover)

Удачи на планшете 🐸
