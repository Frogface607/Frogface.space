-- 8FATES Database Schema

-- Stories catalog
create table if not exists stories (
  id text primary key,
  title text not null,
  subtitle text,
  setting text,
  year text,
  themes text[] default '{}',
  beats jsonb not null,
  ending_types jsonb not null,
  active boolean default false,
  publish_date date,
  created_at timestamptz default now()
);

-- Game sessions
create table if not exists game_sessions (
  id uuid primary key default gen_random_uuid(),
  story_id text references stories(id),
  traits jsonb not null,
  choice_history jsonb not null default '[]',
  tags text[] default '{}',
  ending_type text,
  ending_data jsonb,
  started_at timestamptz default now(),
  completed_at timestamptz,
  fingerprint text -- anonymous player tracking
);

-- Daily statistics (aggregated)
create table if not exists daily_stats (
  id uuid primary key default gen_random_uuid(),
  story_id text references stories(id),
  date date not null,
  total_players integer default 0,
  ending_distribution jsonb not null default '[]',
  updated_at timestamptz default now(),
  unique(story_id, date)
);

-- Living World newspapers
create table if not exists newspapers (
  id uuid primary key default gen_random_uuid(),
  story_id text references stories(id),
  day_number integer not null,
  headline text not null,
  content text not null,
  published_at timestamptz default now(),
  unique(story_id, day_number)
);

-- Indexes
create index if not exists idx_sessions_story on game_sessions(story_id);
create index if not exists idx_sessions_date on game_sessions(started_at);
create index if not exists idx_sessions_ending on game_sessions(ending_type);
create index if not exists idx_stats_date on daily_stats(date);
create index if not exists idx_newspapers_story on newspapers(story_id, day_number);

-- RLS
alter table stories enable row level security;
alter table game_sessions enable row level security;
alter table daily_stats enable row level security;
alter table newspapers enable row level security;

create policy "Stories are publicly readable"
  on stories for select using (true);

create policy "Anyone can create sessions"
  on game_sessions for insert with check (true);

create policy "Sessions are readable"
  on game_sessions for select using (true);

create policy "Stats are publicly readable"
  on daily_stats for select using (true);

create policy "Newspapers are publicly readable"
  on newspapers for select using (true);
