-- Diagnostic onboarding: a short, fixed case used once per user to produce
-- an initial "interview readiness" score, plus a real/training interview
-- style flag so the AI knows whether it may offer hints.

alter table public.sessions
  add column if not exists kind text not null default 'practice' check (kind in ('practice', 'diagnostic')),
  add column if not exists interview_style text not null default 'real' check (interview_style in ('real', 'training'));

alter table public.cases
  add column if not exists is_diagnostic boolean not null default false;

insert into public.cases (title, industry, difficulty, category, estimated_minutes, is_published, is_diagnostic, summary, prompt)
select
  'Hazırlık Ölçümü',
  'Genel',
  'medium',
  'operasyon',
  5,
  false,
  true,
  'Yapı, analiz, iş muhakemesi, iletişim ve sayısal akıl yürütme becerilerini hızlıca ölçen kısa bir case.',
  'Müvekkilimiz orta ölçekli bir perakende zinciri. Son 12 ayda kârlılığı %20 azaldı. Bu, adayın genel mülakat hazırlığını ölçmek için kullanılan kısa (yaklaşık 5 turluk) bir diagnostic case''idir — normal case''lerden daha hızlı ilerlemeli, adayı yapı kurmaya, bir hipotez öne sürmeye, kısa bir hesaplama yapmaya ve bulgularını özetlemeye yönlendirmelisin.'
where not exists (select 1 from public.cases where is_diagnostic = true);
