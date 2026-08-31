-- CaseTutor-clone (m-lakat) initial schema

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: one row per auth.users, holds app-specific profile data
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  target_firm text,
  language text not null default 'tr',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles are insertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

-- auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- cases: case interview scenarios (AI-generated or curated)
-- ---------------------------------------------------------------------------
create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  industry text not null,
  difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  summary text not null,
  prompt text not null, -- full case brief given to the AI interviewer as system context
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.cases enable row level security;

create policy "published cases are readable by anyone signed in"
  on public.cases for select
  using (is_published = true);

-- ---------------------------------------------------------------------------
-- sessions: one interview attempt by a user against a case
-- ---------------------------------------------------------------------------
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id uuid not null references public.cases(id) on delete cascade,
  mode text not null default 'text' check (mode in ('text', 'voice')),
  phase text not null default 'opening' check (phase in ('opening', 'structure', 'analysis', 'recommendation', 'completed')),
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.sessions enable row level security;

create policy "sessions are managed by owner"
  on public.sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- messages: transcript of a session (user + assistant turns)
-- ---------------------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  audio_url text,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "messages are managed by session owner"
  on public.messages for all
  using (
    exists (
      select 1 from public.sessions s
      where s.id = messages.session_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.sessions s
      where s.id = messages.session_id and s.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- feedback: AI-generated evaluation for a completed session
-- ---------------------------------------------------------------------------
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.sessions(id) on delete cascade,
  overall_score int not null check (overall_score between 0 and 100),
  structure_score int not null check (structure_score between 0 and 100),
  analysis_score int not null check (analysis_score between 0 and 100),
  communication_score int not null check (communication_score between 0 and 100),
  strengths text not null,
  improvements text not null,
  summary text not null,
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

create policy "feedback is managed by session owner"
  on public.feedback for all
  using (
    exists (
      select 1 from public.sessions s
      where s.id = feedback.session_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.sessions s
      where s.id = feedback.session_id and s.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- indexes
-- ---------------------------------------------------------------------------
create index if not exists sessions_user_id_idx on public.sessions(user_id);
create index if not exists messages_session_id_idx on public.messages(session_id);
create index if not exists cases_published_idx on public.cases(is_published);
