# Frogface — Character Bible Spec (для расширения в ChatGPT)

> Дата: 26 мая 2026. После reveal base character sheet (Frogface в чёрном hoodie, peace-пацифик, белые кроссы, 4 ракурса + 4 эмоции + 2 ролики-поз). Этот файл — список того, что **ещё нужно дополнить**, чтобы получить production-ready библию для frogface.space + контент-фабрики.

---

## 1. POSITIONING (зафиксировано)

**Boss's line, не переписывать:**

> «Уставший предприниматель, который с нулём денег пытается выбраться из болота.»

**Не:**
- ❌ Magical wizard (это WIZL.space)
- ❌ Corporate founder с calculated/adaptive vibe
- ❌ Hustler-bro мотиватор
- ❌ Супергерой с маской

**Да:**
- ✅ Грязные кроссы, hoodie с пятнами кофе
- ✅ Уставший но капабельный
- ✅ Self-aware ирония, не depression
- ✅ Барахтается, но делает
- ✅ Authentic «вот так и живу»

---

## 2. VISUAL CANON (из base sheet, не менять)

- **Outfit**: oversized чёрный hoodie с frog-mark на груди и спине, чёрные штаны, белые кроссы
- **Pendant**: серебряная пацифик-подвеска на цепочке
- **Skin**: olive green с чуть тёплым оттенком
- **Глаза**: большие, выразительные, чуть уставшие
- **Палитра**: olive #6B7A3F / sage #8C9A6B / tan #D4B886 / dark grey #2F2F2F / mid grey #6E6E6E / light grey #BFBFBF / white #F4F4F0
- **Стиль рисовки**: confident outlines, soft shading, vibrant flat-ish colors (не painterly watercolor, не realistic)

---

## 3. POSE LIBRARY — что ещё нужно ChatGPT-у сгенерить

### 3.1 Walk cycle (priority 1 — для PixiJS-анимации)
4 направления × 6-8 кадров каждое. Простой walk без роликов.
- **NE** (вправо-наверх) × 8 frames
- **NW** (влево-наверх) × 8 frames
- **SE** (вправо-вниз) × 8 frames
- **SW** (влево-вниз) × 8 frames

### 3.2 Idle / стоит на месте (priority 1)
- Stands looking forward, slight breathing
- Stands hands in hoodie pocket
- Stands scratching head (thinking)
- Stands looking at phone

### 3.3 Sit / work poses (priority 1 — для «лягуха работает в проекте»)
- Sitting at laptop, screen glow on face, tired
- Sitting at bar stool with empty coffee mug
- Sitting on plank dangling legs over swamp water
- Sitting cross-legged with notebook, drawing
- Slumped over desk, head on arms (burned out moment)

### 3.4 KEY CONCEPT ART (priority 1 — для Hero сцены)
**«Уставший предприниматель в болоте»** — главный визуал сайта:
- Frogface стоит спиной/3-4 на деревянной досочке посреди болота
- Рядом ноут открытый светит экраном на лягуху
- Кружка кофе пустая на досочке
- Туман снизу, болото вокруг
- Закат или ночь — тёплый янтарный свет от ноута + лунный
- Лицо: устал, но не сдался

### 3.5 Emotional reactions (priority 2 — для NPC dialog / спич-баблов)
- Surprised (raised brows)
- Tired (drooping eyes, sigh)
- Smug / smirk (one-side smile)
- Frustrated (clenched fist, scowl)
- Soft proud (small smile, looking at camera)
- Realisation (eyes wide, lightbulb)
- Looking up at sky (hopeful)
- Crying laugh / cringe (face-palm)

### 3.6 Hand close-ups (priority 2 — для UI buttons / icons)
- Thumb up
- Fist (gentle)
- Pointing
- Holding phone
- Holding pen
- Open palm

### 3.7 Action — но не ролики (priority 3)
Роликовые позы из base sheet оставляем **только как стилевой акцент** для тематических кадров (например ABOUT-страница, биография — момент «я в Бангкоке катаюсь»). Не использовать как main передвижение.

Что добавить вместо:
- Walking with purpose
- Running (when stressed)
- Jumping over puddle
- Climbing ladder
- Sitting in boat rowing

### 3.8 Lockup / mascot logo variants (priority 1 — для brand)
- Full mascot mark (как в углах base sheet)
- Just the frog-face icon (для favicon / app icon)
- Wordmark "Frogface" with mascot inline
- Stamp-style "FROGFACE" with frog peeking

### 3.9 Outfit variants (priority 3 — для разнообразия контента)
Опционально, для контент-фабрики:
- Same hoodie, but white version
- Rain coat / poncho version
- Tank top + shorts (Bangkok heat)
- Coat (Irkutsk winter)

---

## 4. DELIVERABLE FORMAT (для ChatGPT и архива)

Каждый ассет:
- **PNG**, прозрачный фон (где возможно)
- **Min 1024×1024** для одиночных поз, **2048×2048** для walk-cycle листов
- **Имя файла**: `frogface_<category>_<variant>_<frame?>.png`
  - Пример: `frogface_walk_NE_03.png`
  - Пример: `frogface_idle_phone.png`
  - Пример: `frogface_concept_swamp-laptop.png`
- **Сохранять в** `D:\PROJECTS\FROGFACE-SPACE\refs\character\` (создать папку)

---

## 5. ГОТОВЫЙ BRIEF ДЛЯ CHATGPT (копипаст)

```
Привет, нужно расширить character bible моего маскота Frogface.

Базовый character sheet уже есть (вышлю файл). Зафиксировано:
- Frogface — антропоморфная зелёная лягуха, oversized чёрный hoodie с frog-mark на груди и спине, чёрные штаны, белые кроссы, серебряная пацифик-подвеска
- Стиль: confident outlines, soft shading, vibrant flat-ish colors. Не painterly watercolor. Не realistic.
- Палитра: olive / sage / tan / greys / white

Позиционинг: «уставший предприниматель, который с нулём денег пытается выбраться из болота». Не magical wizard. Не corporate founder. Грязные кроссы, кофе пятна на hoodie, self-aware ирония.

Нужно сгенерить дополнительные ассеты по следующему списку. Все в той же стилистике, ровный консистентный персонаж.

ПРИОРИТЕТ 1:
1. Walk-cycle: 4 направления (NE/NW/SE/SW), по 6-8 кадров каждое. Простая ходьба без роликов.
2. Idle stand poses (4 варианта: looking forward, hands in pocket, scratching head, looking at phone)
3. Sit/work poses (5 вариантов: at laptop tired, on bar stool with empty mug, on plank over water, cross-legged with notebook, slumped over desk)
4. KEY CONCEPT ART: «уставший предприниматель в болоте» — Frogface на досочке посреди болота, ноут открытый светит на лицо, пустая кружка кофе, туман, закат/ночь. Это главный визуал сайта.
5. Mascot lockups: full mark, icon-only, wordmark "Frogface", stamp-style.

ПРИОРИТЕТ 2:
6. Emotional reactions (8 штук: surprised / tired / smug / frustrated / soft proud / realisation / looking up / face-palm)
7. Hand close-ups (6 штук: thumb up / fist / pointing / phone / pen / open palm)

ПРИОРИТЕТ 3:
8. Non-skate action (walking with purpose, running stressed, jumping puddle, climbing ladder, rowing boat)
9. Outfit variants (white hoodie, rain coat, tank top, winter coat)

Каждый ассет — PNG прозрачный, минимум 1024×1024, имя `frogface_<category>_<variant>_<frame>.png`.

Начнём с приоритета 1 — давай по одному блоку.
```

---

## 6. AFTER CHATGPT — что делаем дальше

1. **Сохранить все PNG** в `D:\PROJECTS\FROGFACE-SPACE\refs\character\`
2. **Загрузить 5-10 ключевых в Higgsfield** через `higgsfield upload create`
3. **Soul-ID lock** через `higgsfield soul-id create --name FrogfaceSerge --soul-2 --image <id1>...<id5>`
4. **Использовать Soul-ID в batch-генерациях** background scenes / NPC через nano_banana_2 (`--image <soul_id_ref>`)

После Soul-ID любая будущая сцена с Frogface будет **консистентной** — тот же персонаж.

---

_Файл: `D:\PROJECTS\FROGFACE-SPACE\docs\character-bible-spec-for-chatgpt.md`_
