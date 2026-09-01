-- Timestamped feedback: the AI can tie specific score assessments to a
-- moment in the transcript (mm:ss from session start), and the UI can show
-- the *real* candidate message at that moment as evidence — no audio
-- involved, this is purely derived from existing message timestamps.

alter table public.feedback
  add column if not exists timestamped_notes jsonb not null default '[]';
