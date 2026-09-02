-- Case Library redesign: adds structured metadata so a case can carry a
-- subtitle, be searched/filtered by skill, be marked featured/new, and be
-- gated by plan tier. Also extends the category taxonomy with two new
-- categories (Market Sizing, Business Model) used by the new case set.

alter table public.cases
  add column if not exists subtitle text,
  add column if not exists skills text[] not null default '{}',
  add column if not exists tags text[] not null default '{}',
  add column if not exists is_featured boolean not null default false,
  add column if not exists is_new boolean not null default false,
  add column if not exists min_plan text not null default 'free'
    check (min_plan in ('free', 'pro', 'coach'));

alter table public.cases drop constraint if exists cases_category_check;
alter table public.cases add constraint cases_category_check
  check (category in (
    'pazara-girisi', 'karlilik', 'buyume', 'birlesme-satin-alma',
    'fiyatlandirma', 'operasyon', 'pazar-buyuklugu', 'is-modeli'
  ));

create index if not exists cases_min_plan_idx on public.cases(min_plan);
create index if not exists cases_skills_idx on public.cases using gin(skills);
