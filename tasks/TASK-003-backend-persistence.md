# TASK-003: Подключить полноценный бэкенд (сохранение данных)

**Статус:** pending
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

- [ ] Все данные синхронизируются с Supabase
- [ ] localStorage используется как кэш/оффлайн fallback
- [ ] Данные не теряются при очистке браузера
- [ ] Чаты агентов сохраняются в `chat_messages`
- [ ] При загрузке — сначала localStorage, потом fetch из Supabase
