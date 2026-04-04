# Moltbot ↔ Cursor Protocol

## Overview
Moltbot (OpenClaw AI on VPS) creates structured coding tasks based on Sergey's voice commands.
Cursor picks them up and executes. Communication through VPS workspace (HTTPS).

## Architecture

```
Sergey (voice/text) → Moltbot (structures) → VPS workspace → Cursor (executes) → Git commit → Deploy
```

## How to Fetch Tasks from Moltbot

When Sergey says "возьми задачу от Moltbot", "check Moltbot tasks", or "что Moltbot приготовил":

1. Fetch task list: `curl -s "https://a884a0ba36a4.vps.myjino.ru/workspace/cursor-tasks/?token=moltbot2026"`
2. Fetch specific task: `curl -s "https://a884a0ba36a4.vps.myjino.ru/workspace/cursor-tasks/TASK-NNN-slug.md?token=moltbot2026"`
3. Read the task — it contains full context, requirements, files to modify
4. Execute the task according to the requirements
5. Commit all changes with message referencing the task ID: `[TASK-NNN] description`

## Sending Updates to Moltbot

Talk to Moltbot via API:
```bash
curl -s -X POST https://a884a0ba36a4.vps.myjino.ru/v1/chat/completions \
  -H "Authorization: Bearer moltbot2026" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"TASK-001 completed. All requirements met."}],"max_tokens":200}'
```

## Important Rules

- **Read the full task before starting** — Moltbot provides context, files, and criteria
- **Follow success criteria** — each task has checkboxes, verify all pass
- **Commit with task reference** — e.g. `[TASK-001] MyReply brand update`
- **If a task is unclear** — ask Sergey or send question to Moltbot via API
- **Language**: Sergey speaks Russian, task files mix Russian and English. Code comments in English.

## Priority Levels

- **CRITICAL** — do immediately, blocks everything
- **HIGH** — do today
- **MEDIUM** — do this week
- **LOW** — when time permits

## Projects Context

- **MyReply** — SaaS for auto-replies to reviews. Next.js + Supabase. Priority #1.
- **Edison Bar** — Restaurant website. Focus on content generation.
- **frogface.space** — Personal Life OS / Command Center. This repo.
- **RECEPTOR** — Music visualization. Low priority.

## VPS Access

- Tasks endpoint: `https://a884a0ba36a4.vps.myjino.ru/workspace/cursor-tasks/`
- Chat API: `https://a884a0ba36a4.vps.myjino.ru/v1/chat/completions`
- Auth token: `moltbot2026`
- All requests need `?token=moltbot2026` (workspace) or `Authorization: Bearer moltbot2026` (API)

## Git Workflow

Cursor works locally on `master` branch.
All code deploys to Vercel automatically on push to GitHub.
GitHub repo: Frogface607/Frogface.space
