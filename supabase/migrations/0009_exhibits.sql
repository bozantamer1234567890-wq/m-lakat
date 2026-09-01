-- Live Exhibits: the AI interviewer can attach a structured exhibit
-- (table or bar chart) to one of its messages, which the client renders
-- as a real data panel instead of plain prose.

alter table public.messages
  add column if not exists exhibit jsonb;
