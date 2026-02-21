-- Frogface Life OS — Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Key-value store for simple state (HQ quests, agent statuses, etc.)
create table if not exists kv_store (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- Activity log / chronicle
create table if not exists activity_log (
  id bigint generated always as identity primary key,
  source text not null default 'system',  -- 'hq', 'agent:moltbot', 'command', etc.
  type text not null default 'log',        -- 'story', 'achievement', 'gold', 'xp', 'log'
  text text not null,
  created_at timestamptz default now()
);

-- Chat messages (all agents + command center)
create table if not exists chat_messages (
  id bigint generated always as identity primary key,
  agent_id text not null,                  -- 'moltbot', 'gm', 'analyst', 'command', etc.
  role text not null,                      -- 'user', 'assistant', 'agent', 'system'
  content text not null,
  created_at timestamptz default now()
);

-- Indexes for fast lookups
create index if not exists idx_chat_agent on chat_messages (agent_id, created_at);
create index if not exists idx_log_source on activity_log (source, created_at);

-- Enable Row Level Security (public access since this is a personal app with auth on app level)
alter table kv_store enable row level security;
alter table activity_log enable row level security;
alter table chat_messages enable row level security;

-- Allow all operations for anon key (personal app, auth handled by middleware)
create policy "Allow all on kv_store" on kv_store for all using (true) with check (true);
create policy "Allow all on activity_log" on activity_log for all using (true) with check (true);
create policy "Allow all on chat_messages" on chat_messages for all using (true) with check (true);
