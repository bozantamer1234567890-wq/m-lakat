-- SaaS subscription support: add plan/billing fields to profiles

alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists plan text not null default 'free' check (plan in ('free', 'pro')),
  add column if not exists current_period_end timestamptz;

create index if not exists profiles_stripe_customer_id_idx on public.profiles(stripe_customer_id);
