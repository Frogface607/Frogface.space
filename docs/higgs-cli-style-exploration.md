# Higgsfield CLI — Style Exploration Run

> Брат, после `auth login` ты залогинен. Делаем 3 шага: модели → тест → 6 стилей. Ассеты осядут в `D:\PROJECTS\FROGFACE-SPACE\refs\style-exploration\`.

---

## Шаг 0 — папка для рефов (один раз)

```powershell
$refs = "D:\PROJECTS\FROGFACE-SPACE\refs\style-exploration"
New-Item -ItemType Directory -Path $refs -Force | Out-Null
cd $refs
```

---

## Шаг 1 — посмотреть какие image-модели у тебя есть (10 секунд)

```powershell
higgsfield model list --image
```

Скопируй мне в чат **последние 30-40 строк** вывода (особенно где упоминается **Nano Banana Pro**, **Soul**, **Seedream**). Мне нужен точный `model_id`.

Если хочешь — сразу баланс и план:
```powershell
higgsfield account
```

---

## Шаг 2 — один тестовый кадр (1-2 минуты)

После шага 1 ты увидишь точный ID. **Точный ID для Nano Banana Pro = `nano_banana_2`** (в нейминге Higgsfield `_2` = Pro версия).

```powershell
higgsfield generate create nano_banana_2 `
  --prompt "Mystical nighttime swamp scene, anthropomorphic frog character in oversized dark hoodie standing on a wooden plank in misty swamp water, warm golden window of small wooden bar glowing on the right, glowing white mushrooms on moss-covered mound on the left, deep purple-blue night sky with crescent moon, fireflies, soft fog, side view cinematic landscape, Studio Ghibli watercolor painting style, Spirited Away atmosphere, painterly soft edges no hard outlines, dreamy cozy mood" `
  --aspect-ratio 16:9 `
  --wait
```

Когда отработает — кинь мне ссылку из вывода (обычно последняя строка). Я гляну, что получилось и **подгоню остальные 5 промптов под твой стиль**.

Если упадёт «model not found» — кинь точный ID из шага 1, поправлю.

---

## Шаг 3 — все 6 стилей одной волной (после теста)

Я заполню этот блок точными командами после твоего отчёта по шагам 1-2. Будет шесть запросов параллельно (одинаковая сцена, 6 разных стилей):

1. Studio Ghibli (тест из шага 2)
2. Moebius / Jean Giraud
3. Carson Ellis × Phoebe Wahl folk-storybook
4. Japanese sumi-e ink wash
5. Alex Face Bangkok street mural
6. Risograph print (lime + purple + cream)

Все картинки лягут в `refs/style-exploration/` с понятными именами `01-ghibli.png`, `02-moebius.png` и т.д. Сравним side-by-side, выберешь главное направление.

---

## Полезное на потом

**Стоимость одной генерации:** ~$0.10-0.20 на 1K-2K (зависит от модели). С Ultra-планом — твои квоты внутри.

**Download картинки на диск из URL** (если `--wait` вернул только URL):
```powershell
Invoke-WebRequest <url> -OutFile "$refs\01-ghibli.png"
```

**Soul-ID main character lock** — после выбора стиля сделаем отдельно. Нужно будет 5+ reference photos лягухи (берём из лучших генераций и через `soul-id create`).

**Стоимость заранее без запуска**:
```powershell
higgsfield generate cost nano_banana_pro --prompt "..." --aspect-ratio 16:9
```
