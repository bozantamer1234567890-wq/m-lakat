-- Expand feedback with two more scoring dimensions, and give cases a
-- category + estimated duration so the case library can be filtered and
-- the feedback engine can recommend a targeted next case.

alter table public.feedback
  add column if not exists business_judgment_score int not null default 0
    check (business_judgment_score between 0 and 100),
  add column if not exists quantitative_reasoning_score int not null default 0
    check (quantitative_reasoning_score between 0 and 100);

alter table public.cases
  add column if not exists category text not null default 'operasyon'
    check (category in ('pazara-girisi', 'karlilik', 'buyume', 'birlesme-satin-alma', 'fiyatlandirma', 'operasyon')),
  add column if not exists estimated_minutes int not null default 30;
