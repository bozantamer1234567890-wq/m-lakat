-- Onboarding wizard: a few short questions right after the diagnostic that
-- let the dashboard personalize its daily recommendation and show a
-- countdown to the user's real interview date.

alter table public.profiles
  add column if not exists interview_date date,
  add column if not exists experience_level text
    check (experience_level in ('beginner', 'intermediate', 'advanced')),
  add column if not exists daily_practice_minutes int,
  add column if not exists preferred_mode text check (preferred_mode in ('text', 'voice')),
  add column if not exists onboarding_completed_at timestamptz;
