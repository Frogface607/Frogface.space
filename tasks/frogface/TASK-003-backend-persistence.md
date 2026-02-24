# TASK-003: Подключить полноценный бэкенд (сохранение данных)

**Статус:** done
**Приоритет:** high
**Проект:** frogface
**Исполнитель:** cursor
**Создано:** 2026-02-23
**Обновлено:** 2026-02-23
**Квест:** fs5

## Описание

Перевести все данные из localStorage в Supabase. Сейчас квесты, статусы агентов и чаты хранятся локально — при очистке браузера всё теряется. Нужно синхронизировать с Supabase, сохранив оффлайн-режим (PWA).

## Контекст

Текущее хранение:
- Квесты: `ff_hq_quests` в localStorage
- Цепочки квестов: `ff_quest_chains` в localStorage  
- Чаты агентов: `ff_chat_<agentId>` в localStorage
- Статусы агентов: `ff_agent_status_<agentId>` в localStorage

Supabase уже подключен, есть таблицы: `kv_store`, `activity_log`, `chat_messages`.

## Файлы

- `src/lib/use-persisted-state.ts`
- `src/lib/use-chat-history.ts`
- `src/lib/supabase.ts`
- `src/app/api/quests/route.ts`
- `supabase/schema.sql`

## Критерии готовности

- [x] Все данные синхронизируются с OpenClaw (Supabase опционально)
- [x] localStorage используется как кэш/оффлайн fallback
- [x] Данные не теряются при очистке браузера
- [x] Чаты агентов сохраняются через /api/kv
- [x] При загрузке — сначала localStorage, потом fetch из API

## Результат

Единый storage layer: OpenClaw primary → Supabase fallback. usePersistedState и useChatHistory работают через /api/kv. Supabase больше не нужен.
