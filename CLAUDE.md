# FROGFACE.SPACE — Life OS

Personal life operating system with RPG mechanics. Built by Сергей (frogface.hq).

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 (no config file — uses CSS-based config in globals.css)
- Supabase (DB, auth) — project linked via .env.local
- Lucide React icons, clsx + tailwind-merge
- PWA enabled (manifest.json, sw.js)

## Architecture
- `src/app/(dashboard)/` — all main pages behind sidebar layout
- `src/app/api/` — API routes (chat, quests, log, memory, status)
- `src/components/` — shared components
- `src/lib/` — utilities, agents config, Supabase client, hooks
- `supabase/schema.sql` — DB schema (kv_store, activity_log, chat_messages)

## Pages
- `/` — HQ dashboard (Zen Mode + full view)
- `/quests` — quest journal
- `/player` — player stats & skills
- `/projects` — mission board
- `/studio` — AI agents office (8 agents)
- `/chronicle` — Game Master chronicle
- `/command` — chat with Moltbot

## Design System (RPG theme)
Color tokens defined in globals.css:
- `--accent` — primary purple
- `--bg-deep`, `--bg-card`, `--bg-hover` — dark backgrounds
- `--text`, `--text-bright`, `--text-dim` — text hierarchy
- `--xp` — green (experience), `--gold` — amber (money/MRR)
- `--hp` — red (health/critical), `--mana` — blue (energy)
- `--border` — subtle borders

## Conventions
- Russian UI text, English code/comments/commits
- RPG metaphors: quests (tasks), XP (progress), Gold (MRR), Mana (energy)
- Zen Mode = minimal single-quest focus view
- 8 AI agents with personalized system prompts in `src/lib/agents.ts`
- Voice input via Web Speech API, TTS for responses

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — lint check

## Current State (April 2026)
- Chapter 2 starting — previous data from Jan/Feb needs refresh
- Supabase tables exist but app mostly uses localStorage
- OpenClaw VPS integration paused (Telegram API blocked from Russian IP)
