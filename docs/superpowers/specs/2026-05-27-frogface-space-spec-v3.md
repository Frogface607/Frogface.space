# frogface.space — Design Spec v3 (FINAL)

> 27 мая 2026. Перебивает spec v1 (нуар), v2 (swamp WIZL-magic), v2.5 (isometric island-vault).
> Эта версия — **финальная архитектура** на базе голоса Босса 26-27 мая после ChatGPT character bible + Soul-ID тестов.

---

## 0. TL;DR

**Frogface.space = два режима один опыт.**

- **Мир** — cartoon-болото, по которому ходишь. Внутри 2 здания: **хижина Frogface** (личный бренд / vibe) и **бар Edison** (cartoon-кейс).
- **Studio** — отдельный B2B-лендинг про автоматизацию бизнеса. Та же эстетика (Frogface + лягухи), другая структура (pain → solution → pricing → CTA).

**Цель сайта:** отправить посетителя залипать → показать креатив и уровень → конвертировать в Studio-клиента или подписчика @sergeyorlove.

**Маскот:** Frogface — уставший предприниматель с нулём денег, пытается выбраться из болота. Soul-ID locked. Стиль = outlined cartoonish painterly (canon из character sheets).

---

## 1. Архитектура (два режима один опыт)

```
EXTERNAL WORLD (isometric cartoon-болото)
├── 🏚 Хижина Frogface
└── 🍺 Бар Edison (cartoon-версия)
   
INTERIORS (клик на здание → zoom-in)
├── Inside хижины:
│   ├── Frogface за столом с лавовой лампой → /now
│   ├── Постеры афиш на стене → /gallery (Edison-афиши, design works)
│   ├── Шкаф с фоторамками → /about (scroll-комикс биографии)
│   ├── Дверь → выход во внешний мир
│   └── [Пустые слоты на будущее: WIZL/8FATES/OPERATOR/POSADYAT/NOWHERE — добавляем по мере появления]
│
└── Inside Edison-бара (cartoon):
    ├── Барная стойка → кейс "система брони"
    ├── Стена с афишами → кейс "AI-анонсы концертов"
    ├── Доска меню → кейс "PWA меню"
    ├── Telegram-уведомления у входа → кейс "автопостинг анонсов"
    ├── Staff-доска за стойкой → кейс "Staff-панель"
    └── "Хочешь такой же бизнес?" → переход в Studio

STUDIO (отдельная business-страница /studio)
└── B2B-лендинг с pain-карточками, кейсами Edison, пакетами, brief-формой
```

### Routes

| URL | Что это |
|---|---|
| `/` | External world (PixiJS isometric scene) |
| `/hut` | Inside хижины (новая PixiJS-сцена, открывается оверлеем) |
| `/bar` | Inside Edison-бара (новая PixiJS-сцена, открывается оверлеем) |
| `/now` | Now-страница (открывается из кликa на Frogface в хижине) |
| `/gallery` | Галерея афиш и design works (открывается из постеров в хижине) |
| `/about` | Biography scroll-комикс (открывается из шкафа в хижине) |
| `/studio` | B2B-лендинг (открывается из бара или прямого URL) |

---

## 2. Маскот и стилистика — locked

### Frogface (Soul-ID + character sheets)

- **Soul-ID:** `bb0b2bd4-cac2-454f-a969-58e9902e88ae` (soul_2, name "FrogfaceSerge")
- **Pipeline для всех ассетов:** `nano_banana_2` + `--image <character-sheet-uuid>` (image-to-image, лочит стиль и характер)
- **Sheet UUIDs:**
  - `73e0ba05-0768-4645-afda-b63197fceaf4` — character v2 (4 turnaround + 4 expressions + ABOUT)
  - `32a45125-2abc-493c-8900-1488fabf7c98` — pose sheet (8 поз + 4 emotions + hands)
  - `6b8dce8f-04e8-498a-8652-5bf8df70d4b0` — walk cycle (4 dir × 6 frames)

### Prompt template для любой сцены

```
Same anthropomorphic frog character from the reference character sheets, 
in his signature black hoodie with frog mark, peace pendant, white sneakers. 
Scene: [SCENE DESCRIPTION]. 
Match the exact art style of the character sheets — outlined cartoonish 
illustration with confident clean ink outlines, vibrant flat colors, 
painterly soft shading, NOT photorealistic, NOT 3D rendered. 
[ASPECT/CAMERA] cinematic, [MOOD].
```

### Палитра (из character sheet)

```css
--canon-olive:    #6B7A3F  /* основная зелень лягухи */
--canon-sage:     #8C9A6B  /* светлая зелень */
--canon-tan:      #D4B886  /* тёплый тан, кружки */
--canon-ink:      #2F2F2F  /* hoodie black */
--canon-grey:     #6E6E6E  /* серый mid */
--canon-light:    #BFBFBF  /* серый светлый */
--canon-paper:    #F4F4F0  /* бумага / off-white */
```

---

## 3. External world — изометрический cartoon-мир

### Композиция

3/4 top-down view, фиксированная камера (всё в кадре), aspect 16:9 desktop.
На мобиле — vertical adapter (один объект показывается крупно за раз, swipe для переключения).

### Объекты MVP

1. **🏚 Хижина Frogface** — небольшой деревянный домик на сваях над водой, тёплое окно горит, frog-флаг на крыше
2. **🍺 Бар Edison** — побольше, янтарные окна, гитара у входа, вывеска "EDISON"
3. **Болото** — тростник, лилии, светлячки, лёгкий туман
4. **Мостки** — деревянные настилы между зданиями
5. **Опционально стартовые НПЦ** — 2-3 декоративные лягухи (на лилиях, на пеньке)

### Управление

- **Desktop:** курсор + click (можно WASD-pan камеры в будущем при расширении)
- **Mobile:** tap-on-object (без хождения, лягуха-камера сразу телепортируется к объекту по клику)
- **HUD:** минимальный — только кнопки навигации (top-right: ☰ menu / about / studio)

### Tier-evolution (Босс флипает руками)

| Tier | Что добавляется | Триггер |
|---|---|---|
| `swamp` (start) | Хижина + Edison-бар + базовое болото | дефолт |
| `riverbank` | Мостки тёплые, освещение лучше, NPC-лягухи активнее | Босс хочет |
| `village` | +1-2 здания (на момент когда WIZL/8FATES активны для русской аудитории — ЕСЛИ когда-нибудь) | Босс хочет |
| `city` | Каменная мостовая, площадь, witcher-style рынок | $30K+ MRR |
| `skyscraper` | На горизонте небоскрёб, мир становится background | $500K+ MRR |

**Важно:** WIZL на русскую аудиторию НЕ транслируется (cannabis = юр-риск в РФ, 38-ФЗ). WIZL остаётся только на wizl.space.

---

## 4. Inside хижины — личный бренд

### Композиция

Side-scroll cutaway view интерьера (как в Stardew Valley интерьерах). Один экран, виден весь внутри.

### Кликабельные объекты

| Объект | Действие | Контент |
|---|---|---|
| **Frogface за столом** | → `/now` | Now-page (что делаю / где я / над чем работаю). MVP — markdown в репо. Telegram-автопостинг — релиз 2 |
| **Лавовая лампа** | (пусто пока) | Слот для OPERATOR когда станет нужно |
| **Постеры афиш на стене** | → `/gallery` | Архив Edison-афиш + design works |
| **Шкаф с фоторамками** | → `/about` | Scroll-комикс биографии (Новоленино → филфак → Сбер → Edison → Бкк → сейчас) |
| **Гитара в углу** | tooltip / easter egg | Музыка, ссылка на трек "Исчезая" если зальём |
| **Газета на столе** | (пусто пока) | Слот для POSADYAT когда захочется |
| **Телефон на тумбочке** | (пусто пока) | Слот для NOWHERE когда захочется |
| **Дверь** | → external world | Выход, плавная анимация zoom-out |

### Стилистика интерьера

Тот же outlined cartoonish, тёплая интимная атмосфера. Окно в углу показывает болото снаружи (живая связь миров).

---

## 5. Inside Edison-бара — cartoon кейс автоматизаций

### Композиция

Side-scroll cutaway бара (как хижина). Стилистически — янтарное освещение, бутылки на полках, гитара на сцене.

**Важно:** реальные фотки edisonbar.ru идут только в Studio. В мире — cartoon-версия с теми же ключевыми точками (барная стойка, сцена, доска меню).

### Кликабельные объекты = модули Edison Toolkit

| Объект | Кейс из catalog | Подсказка |
|---|---|---|
| **Барная стойка** | Бронирование с FloorPlan ($1500) | "80% броней через сайт" |
| **Стена с афишами** | AI-генератор анонсов + Постер с QR | "5 сек на анонс вместо 15 мин" |
| **Доска меню** | Меню/каталог + PWA ($700) | "Realtime обновление" |
| **Telegram-уведомления у входа** | Cron-автопостинг + TG-бот | "Сам разносит за 7 дней до" |
| **Staff-доска за стойкой** | Staff-панель ($800) | "Стажёра вводят за день вместо недели" |
| **Касса** | Admin-панель "всё в одном" ($1500) | "90% операционки" |
| **Вывеска "EDISON"** | История бара | 9.5 лет, закрытие 31 мая, переход к Frogface Studio |
| **Дверь "хочешь такой же?"** | → `/studio` | CTA в business-режим |

### Сторителлинг

Бар — это **доказательство**. Каждый объект = модуль который **реально работал 9.5 лет**. Это сильнее любого pitch'а.

---

## 6. Studio — B2B-лендинг

### Структура (отдельная страница `/studio`)

| Раздел | Контент |
|---|---|
| **Hero** | Frogface за чертёжным столом, blueprints светятся, Edison через окно. H1: "Frogface Studio. Автоматизация и упаковка бизнеса.". Sub: история (9 лет, система, продаю). CTA: "Брифинг бесплатно → 30 мин" |
| **Pain cards** | 3-4 карточки. Каждая — лягуха-клиент в боли + 1 строка боли + "как решаем". Higgsfield-генерируем |
| **Что умеем (Edison Toolkit cases)** | 11 модулей с реальными скриншотами edisonbar.ru + Frogface-проводник в углу |
| **Пакеты** | Lite $3K / Pro $5K / Full $7.5-10K. Из edison-toolkit-catalog.md, без воды |
| **Process** | Брифинг → План → Build → Handover. 4 шага, Frogface в позах |
| **Кто за этим** | Кратко про Серёжу, линк на `/about` мира |
| **Brief form** | Бизнес / боль / бюджет / контакт → телега-бот |

### Эстетика Studio

- **Та же** outlined cartoonish что в мире — единый визуальный язык
- **Тон**: honest ironic, не корпоратив. *«я ебался, понял, сделал систему, тебе тоже сделаю»*
- **Реальные скриншоты edisonbar.ru** — для доверия в разделе Edison cases (это единственное место где реал-фото)
- **Лягухи для болей** — каждая боль = лягуха в стрессе (как наш test-02-edison-bar / proj-posadyat и т.д.)

### Связь с миром

- Из мира → клик на дверь бара или на табличку "Studio" в хижине → переход на `/studio`
- Из Studio → "← вернуться в болото" возвращает в мир
- Это **один сайт два mode**

---

## 7. Контент-фабрика и pipeline

### Asset generation

| Тип ассета | Tool | Reference |
|---|---|---|
| Frogface в любой сцене | `nano_banana_2` + `--image <sheet-uuid>` | character-v2 + pose-sheet |
| Декоративные лягухи (NPC) | `nano_banana_2` + `--image <character-v2>` | character-v2 |
| Фоны (хижина outside, bar outside, swamp) | `nano_banana_2` без character ref | Промпт со style match |
| Walk-cycle спрайты для PixiJS | `nano_banana_2` + `--image <walk-sheet>` | walk-sheet |
| Анимации (моргает, тянется) | `seedance_v2` + статичная PNG | Любая sourcе PNG |
| UI элементы (hands, mascot lockup) | `nano_banana_2` + `--image <pose-sheet>` | pose-sheet |

### Контент-loop

Каждое нововведение в мире:
1. Промпт по template (раздел 2)
2. Higgsfield gen → 4-5 вариантов
3. Босс выбирает
4. PNG в `public/world/{room}/{object}.png`
5. Регистрация в `worldState.json`
6. PixiJS подхватывает

---

## 8. Технологический стек

- **Next.js 16 App Router + React 19 + TS** (уже стоит)
- **Tailwind CSS 4** (уже стоит)
- **PixiJS 8.18** (для мира + интерьеров)
- **Framer Motion 11** (для оверлеев Studio / Now / About / Gallery)
- **Lenis** (smooth scroll где нужно)
- **Higgsfield CLI** + Nano Banana Pro + Soul-ID + Seedance (всё уже работает)

---

## 9. Roadmap (MVP → Release 1 → Release 2)

### MVP — 2-3 недели

- ✅ External world (хижина + бар + болото)
- ✅ Inside хижины (Frogface + постеры + шкаф + дверь)
- ✅ Inside Edison-бара (5-6 модулей кликабельны)
- ✅ /now (markdown в репо, ручное обновление)
- ✅ /gallery (Edison афиши)
- ✅ /about (scroll-комикс, статичный)
- ✅ /studio (B2B-лендинг, brief-форма → телега-бот)

### Release 2 — +1 неделя

- /now → автопостинг в Telegram @sergeyorlove
- Анимации Seedance для всех лягух
- Mobile-friendly mode

### Release 3+

- Новые проекты в хижине (лавовая лампа = OPERATOR, газета = POSADYAT, etc.) — по мере того как становятся активны
- Tier-up (riverbank → village → city → skyscraper)
- WIZL — только если/когда уходим из РФ полностью

---

## 10. Hard rules

- **WIZL на русскую аудиторию НЕ транслируется** (cannabis = 38-ФЗ риск). Не упоминаем на frogface.space. Только wizl.space, EN/TH аудитория.
- **Никакого 3D** — только 2.5D PixiJS
- **Никакой Pixar / реализма** — только outlined cartoonish painterly
- **Edison-бар в мире = cartoon**. Реальные фото — только в Studio
- **Tier-up — руками Босса**, не автомат
- **/now автопостинг — релиз 2**, не MVP

---

## 11. Источники истины

- [decision_frogface_relaunch_may2026.md](../../../../../claude-data/projects/D--PROJECTS/memory/decision_frogface_relaunch_may2026.md)
- [edison-toolkit-catalog.md](../../../../FROGFACE-VAULT/canonical/edison-toolkit-catalog.md)
- Character sheets: `D:\PROJECTS\FROGFACE-SPACE\refs\character\` (9 файлов + soul_id.txt + uuids.txt)
- Тесты Soul-ID + image-to-image: `refs/character/test/` + `refs/character/batch-01/` + `refs/character/batch-02-nb/`

---

_Spec v3 финальный. Любые изменения — через коммит этого файла._
