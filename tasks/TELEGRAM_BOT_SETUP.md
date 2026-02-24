# Настройка Telegram-бота → Frogface API

## Суть
Telegram-бот = быстрый ввод задач голосом.
Frogface.space = единый дашборд, источник правды.
Бот создаёт задачи через HTTP API сайта.

## API Endpoints

### Создать задачу для Cursor
```
POST https://frogface.space/api/tasks
Content-Type: application/json

{
  "title": "Название задачи",
  "description": "Что нужно сделать",
  "project": "edison",        // myreply | edison | frogface | video
  "priority": "critical",     // boss | critical | high | normal | low
  "agent": "cursor"           // cursor | human
}
```

### Создать квест (RPG)
```
POST https://frogface.space/api/rpg
Content-Type: application/json

{
  "action": "create_quest",
  "title": "Афиша Эмберс",
  "project": "Edison",
  "priority": "critical",
  "xp": 400
}
```

### Завершить квест
```
POST https://frogface.space/api/rpg
Content-Type: application/json

{
  "action": "complete_quest",
  "query": "Афиша"
}
```

### Отправить сообщение в дашборд
```
POST https://frogface.space/api/notify
Content-Type: application/json

{
  "message": "Ночной отчёт: 3 задачи создано, 1 завершена",
  "from": "telegram-bot"
}
```

### Получить статус
```
GET https://frogface.space/api/report
```

### Получить задачи
```
GET https://frogface.space/api/tasks?status=pending&project=edison
```

## Инструкция для бота

Добавь в системный промпт Telegram-бота:

```
Когда пользователь просит создать задачу, квест или поручение:
1. Определи проект: myreply, edison, frogface или video
2. Определи приоритет: critical (срочно), high (важно), normal (обычно)
3. Отправь POST на https://frogface.space/api/tasks
4. Подтверди пользователю что задача создана

Когда пользователь спрашивает про статус:
1. GET https://frogface.space/api/report — общий отчёт
2. GET https://frogface.space/api/tasks?status=pending — ожидающие задачи

Когда пользователь говорит что что-то сделал:
1. POST https://frogface.space/api/rpg с action=complete_quest
```

## Авторизация
Если настроен API_SECRET в Vercel env, добавь хедер:
```
Authorization: Bearer <API_SECRET>
```
