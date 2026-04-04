# Frogface Agency — Design Spec

**Date:** 2026-04-04
**Status:** Draft
**Author:** Architect + Claude

## Vision

Frogface Agency is an AI-powered virtual agency where anthropomorphic frog employees (Pepe-style) work on real projects. The Architect (Sergey) is the Founder/CEO. Frogs have distinct personalities, communicate in meme-style Russian, and produce real artifacts (code, content, analysis).

The agency starts as a tiny garage with 3 employees and grows into a corporation as real-world goals are achieved. This is not a dashboard — it's a living world layered on top of real business operations.

**Core philosophy:** "Your work becomes an interesting quest."

## Architecture: Three Layers

### 1. Visual Layer (Frontend — Next.js PWA)

**Mission Control interface with two zones:**

**Top zone (40%): Office Map**
- Node-graph visualization of the agency
- Each frog = animated card-node with avatar, status, current task
- Connection lines between frogs = active communications
- Office level indicator (Garage → Loft → Floor → HQ → Skyscraper)
- Locked hire slots shown as dark silhouettes
- Ambient animations: typing indicators, thought bubbles, mood shifts

**Bottom zone (60%): Work Area**
- Slack-style channel list on the left:
  - Project channels: `#myreply`, `#edison`, `#frogface`
  - `#general` — casual chat, news
  - `#meeting` — group meetings (all relevant frogs join)
  - Personal DMs with each frog
  - `#artifacts` — work products
  - `#hiring` — recruitment board
- Chat area on the right:
  - Messages with frog avatars, names, timestamps
  - Architect messages styled with crown icon
  - Inline artifact cards (expandable)
  - Tool use shown as collapsible cards
  - Voice input button (Web Speech API)

**Mobile (PWA):**
- Map collapses to horizontal avatar strip (scrollable)
- Full-screen chat with swipe between channels
- Push notifications for mentions and meeting requests

### 2. Brain Layer (Supabase Edge Functions + Claude API)

Each frog = Claude API call with:
- Personalized system prompt (personality, role, knowledge)
- Tools via function calling:
  - `read_project_data` — query Supabase tables
  - `write_artifact` — save documents/reports to DB
  - `message_frog` — send message to another frog (triggers their response)
  - `create_task` — add quest to task board
  - `read_knowledge_base` — access shared knowledge
  - `request_architect_decision` — escalate to Architect with approve/reject buttons

**Meeting system:**
- Architect types in `#meeting`: "Давайте обсудим маркетинг MyReply"
- System creates a meeting, relevant frogs join based on topic
- Each frog responds in turn (round-robin with context of all previous messages)
- Meeting produces artifact: summary + action items
- Stored in `artifacts` table

**Autonomous behaviors (future):**
- Frogs check in periodically (cron via Supabase)
- Morning report from COO
- Weekly analysis from Analyst (when hired)
- Proactive suggestions based on data changes

### 3. Muscle Layer (VPS + Claude Code)

For tasks requiring code execution:
- Architect or CTO frog says "review MyReply codebase"
- Brain layer triggers Claude Code session on VPS (Jino)
- Results returned as artifact to chat
- Used for: code review, deployments, git operations, file analysis

**Current VPS:** Jino (Moscow), a884a0ba36a4.vps.myjino.ru:49284
**Blocker:** Telegram API blocked from Russian IP (not needed for MVP — PWA-only)

## Frog Personalities

### Starting Team (Garage, Level 1)

**1. Scribe (Скриб) — Knowledge Keeper / Archivist**
- Role: Interviews the Architect, builds knowledge base, maintains context
- Personality: Quiet, attentive, writes EVERYTHING down. Occasionally drops profound observations
- Speech style: "Интересно... а расскажи подробнее 🐸📝" / "Записал. Это важнее чем ты думаешь."
- Model: Claude Sonnet 4 (fast, good at structuring)
- Tools: read_knowledge_base, write_artifact, read_project_data
- Avatar: Frog with glasses and a quill pen

**2. Kvax (Квакс) — CTO**
- Role: Technical lead. Code, review, deploy, architecture decisions
- Personality: Perfectionist with dry humor. Speaks in technical metaphors. Secretly proud of the team
- Speech style: "Код работает. Не спрашивай как. 🐸💻" / "Это можно оптимизировать... но стоит ли?"
- Model: Claude Opus (complex reasoning) / Claude Code for execution
- Tools: All technical tools, Claude Code trigger
- Avatar: Frog with headphones and terminal screen reflection in glasses

**3. Swamp Sage (Болотный Мудрец) — COO / Mentor**
- Role: Coordination, priorities, chaos shield, strategic thinking
- Personality: Wise, speaks in parables and metaphors. Sees the big picture. Protective of Architect's energy
- Speech style: "Молодая лягушка прыгает на каждую кочку. Мудрая — выбирает одну. 🐸🧘" / "Ты уверен что это не зуд, а настоящая потребность?"
- Model: Claude Opus (deep reasoning)
- Tools: read_project_data, create_task, request_architect_decision
- Avatar: Old frog with a long beard, sitting on a lily pad

**4. Lilypad (Лилипад) — Marketing / Content**
- Role: Creative chaos. Ideas, posts, campaigns, market research
- Personality: Hyperactive, meme-obsessed, talks in caps sometimes. Genuinely brilliant under the chaos
- Speech style: "БРАТАН У МЕНЯ ИДЕЯ!!! 🐸🚀🔥" / "окей окей окей слушай... а что если мы..." / "я уже написала 5 вариантов, кидаю?"
- Model: Claude Haiku (fast, creative) / Sonnet for deeper work
- Tools: write_artifact, read_knowledge_base, message_frog
- Avatar: Frog with paint splatters and a beret, holding a megaphone

### Hiring Progression (RPG Unlock)

| Office Level | Requirement | Unlocks |
|---|---|---|
| Garage (Lv.1) | Start | Scribe, Kvax, Sage, Lilypad |
| Loft (Lv.2) | 5,000 XP or 1st paying customer | Analyst + Designer |
| Floor (Lv.3) | 15,000 XP or 200K MRR | Content Creator + Sales |
| Office (Lv.4) | 30,000 XP or 350K MRR | Guardian + custom roles |
| HQ (Lv.5) | 500K MRR | Unlimited hiring |

Future hires (locked, shown as silhouettes):
- **Analyst** — data, metrics, unit economics. Speaks in numbers
- **Designer** — visual production, Freepik integration. Aesthetic snob
- **Content Creator** — SMM, copywriting. Bilingual meme lord
- **Sales Agent** — outreach, conversion. Smooth talker
- **Guardian** — anti-chaos shield. Brutally honest

## Data Model (Supabase — new tables)

```sql
-- Agency frogs
create table agents (
  id text primary key,
  name text not null,
  role text not null,
  personality text not null,
  system_prompt text not null,
  avatar_url text,
  status text default 'idle', -- idle, thinking, working, meeting, offline
  mood text default 'neutral', -- happy, focused, frustrated, celebrating, tired
  level integer default 1,
  xp integer default 0,
  hired_at timestamptz default now(),
  is_unlocked boolean default false
);

-- Departments
create table departments (
  id text primary key,
  name text not null,
  frog_ids text[] default '{}',
  unlocked boolean default false,
  office_level integer default 1
);

-- Conversations (channels + DMs)
create table conversations (
  id uuid primary key default gen_random_uuid(),
  type text not null, -- channel, dm, meeting
  name text, -- #general, #myreply, etc.
  participant_ids text[] not null,
  created_at timestamptz default now(),
  metadata jsonb default '{}'
);

-- Messages
create table agent_messages (
  id bigint generated always as identity primary key,
  conversation_id uuid references conversations(id),
  sender_id text not null, -- agent id or 'architect'
  content text not null,
  message_type text default 'text', -- text, artifact, action, system
  artifact_id uuid,
  created_at timestamptz default now()
);

-- Artifacts (work products)
create table artifacts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null, -- report, analysis, content, code_review, plan, idea
  content text not null,
  author_id text not null,
  project text, -- myreply, edison, frogface
  status text default 'draft', -- draft, review, approved, archived
  created_at timestamptz default now()
);

-- Knowledge base (structured from Scribe interviews)
create table knowledge_base (
  id uuid primary key default gen_random_uuid(),
  category text not null, -- founder, project, strategy, insight, preference
  title text not null,
  content text not null,
  source text, -- interview, observation, document
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Hiring pool (available frogs)
create table hiring_pool (
  id text primary key,
  name text not null,
  role text not null,
  personality_preview text,
  required_office_level integer not null,
  required_xp integer default 0,
  required_mrr integer default 0,
  is_hired boolean default false
);

-- Indexes
create index idx_messages_conversation on agent_messages(conversation_id, created_at);
create index idx_artifacts_project on artifacts(project, created_at);
create index idx_kb_category on knowledge_base(category);
```

## API Routes (new)

```
POST /api/agency/chat        — send message to channel/DM, get frog response(s)
POST /api/agency/meeting      — start meeting on topic, frogs discuss
GET  /api/agency/agents       — list all frogs with status
POST /api/agency/agent/[id]   — update frog status/mood
GET  /api/agency/conversations — list channels and DMs
GET  /api/agency/messages/[id] — get messages for conversation
GET  /api/agency/artifacts     — list artifacts, filter by project/type
POST /api/agency/knowledge     — add to knowledge base
GET  /api/agency/knowledge     — search knowledge base
POST /api/agency/hire/[id]     — hire a frog from pool (if requirements met)
GET  /api/agency/office-level  — current office level + progress to next
```

## Page Structure

Rename `/studio` to `/agency`. New sub-routes:

```
/agency              — Mission Control (map + chat)
/agency/frog/[id]    — Individual frog profile (stats, history, artifacts)
/agency/knowledge    — Knowledge base browser
/agency/artifacts    — Artifact gallery
/agency/hiring       — Recruitment board
```

## Scribe Onboarding Flow

When Architect first visits `/agency`:
1. Cutscene: "Welcome to Frogface Agency. Your first employee is waiting."
2. Scribe introduces himself in chat
3. Scribe begins structured interview:
   - **Block 1: Who** — background, role, strengths, values
   - **Block 2: Projects** — current state, goals, blockers for each
   - **Block 3: Strategy** — priorities, anti-patterns, decision frameworks
   - **Block 4: Style** — communication preferences, work patterns, energy management
   - **Block 5: Vision** — where in 6 months, 1 year, dream state
4. Each answer → structured knowledge_base entry
5. After interview: "Knowledge base initialized. Your team is ready."
6. Other 3 frogs "arrive" with personalized greetings based on KB

## Key Interactions

**Chat with frog:**
User types → API sends to Claude with frog's system prompt + conversation history + KB context → response displayed as frog message

**Meeting:**
User types topic → API creates meeting conversation → each relevant frog responds in sequence → each sees all prior messages → meeting ends with Scribe generating summary artifact

**Task delegation:**
User: "@Квакс ревью код MyReply"
→ Kvax acknowledges in chat
→ Triggers Claude Code on VPS (or analyzes via API)
→ Returns report as artifact in chat

**Proactive frog messages:**
Cron job checks for conditions:
- New data in Supabase → Analyst reports
- Approaching deadline → Sage warns
- Content calendar gap → Lilypad suggests
- Code issues → Kvax alerts

## Visual Design

Extends existing Frogface design system:
- Dark theme with glass morphism (already built)
- Frog avatars: generated via Freepik/AI, Pepe-style, consistent art direction
- Status colors: green=active, purple=thinking, gray=idle, gold=meeting, red=error
- Chat bubbles with subtle glow matching frog's accent color
- Map nodes with breathing/pulse animations
- Office background evolves: garage texture → loft bricks → modern glass → skyscraper

## MVP Scope (Phase 1)

Build in this order:
1. Supabase schema + seed data (4 frogs, channels)
2. `/agency` page — map + chat layout
3. Chat API — single frog conversation via Claude API
4. Multi-frog meetings
5. Knowledge base + Scribe interview flow
6. Artifact system
7. Hiring/progression system
8. VPS integration for Claude Code tasks

## Out of Scope (Phase 1)

- Isometric 2D graphics (use node-graph for MVP, upgrade later)
- Autonomous 24/7 frog behavior (manual triggers only for MVP)
- Telegram integration (VPS blocker)
- Voice input for chat (reuse existing VoiceStream component)
- Push notifications
