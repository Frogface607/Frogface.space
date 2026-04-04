# Moltbot Task Queue

Задачи создаются Moltbot'ом (OpenClaw) на основе голосовых команд Сергея.
Cursor подхватывает и выполняет.

## Структура

```
moltbot-tasks/
├── pending/        ← Новые задачи от Moltbot
├── in-progress/    ← Cursor работает
├── completed/      ← Готово
└── templates/      ← Шаблон задачи
```

## Флоу

1. Сергей → голосовое/текст → Moltbot
2. Moltbot → структурирует → `git push` в `pending/`
3. Сергей → Cursor: "возьми задачу"
4. Cursor → выполняет → коммит → `completed/`

## Формат задач

См. `templates/TASK-TEMPLATE.md`
