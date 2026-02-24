# TASK-002: RPG-движок — квесты из потоков сознания

**Статус:** done
**Приоритет:** critical
**Проект:** frogface
**Исполнитель:** cursor
**Создано:** 2026-02-23
**Обновлено:** 2026-02-23
**Квест:** fs4

## Описание

Доработать RPG-движок: сделать так, чтобы квесты автоматически создавались из голосовых потоков сознания. Сейчас квесты хардкодятся в `INITIAL_CHAINS`. Нужна динамическая система, где Moltbot может создавать квесты через API, а прогресс и XP считаются автоматически.

## Контекст

Текущая система квестов — статический массив `INITIAL_CHAINS` в `quests/page.tsx`. Квесты хранятся в localStorage через `usePersistedState`. Нужно переключить на Supabase и сделать CRUD через API.

## Файлы

- `src/app/(dashboard)/quests/page.tsx`
- `src/lib/quest-store.ts`
- `src/app/api/quests/route.ts`
- `supabase/schema.sql`

## Критерии готовности

- [x] Квесты хранятся в Supabase (не только localStorage)
- [x] API для CRUD квестов (create, read, update, delete)
- [x] Moltbot может создавать квесты через чат-команды
- [x] XP автоматически начисляется при завершении квеста
- [x] Прогресс цепочек пересчитывается динамически

## Результат

/api/rpg с полным CRUD: create_quest, complete_quest, update_progress, add_achievement, morning_report. Автоматический level-up с экспоненциальной кривой XP. PlayerState в Supabase. Страница /player загружает живые данные.
