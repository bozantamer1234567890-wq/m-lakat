-- Switch billing provider from Stripe to iyzico (Türkiye desteği için)

alter table public.profiles
  drop column if exists stripe_customer_id,
  drop column if exists stripe_subscription_id;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_reference_code text,
  pricing_plan_reference_code text,
  status text not null,
  raw jsonb,
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "payments are viewable by owner"
  on public.payments for select
  using (auth.uid() = user_id);

create index if not exists payments_user_id_idx on public.payments(user_id);
