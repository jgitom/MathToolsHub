-- MathToolsHub subscription and entitlement schema.
-- Run after schema.sql. Safe to run repeatedly.

alter table public.profiles
  add column if not exists content_access_until timestamptz,
  add column if not exists stripe_customer_id text unique;

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text not null unique,
  stripe_subscription_id text not null unique,
  stripe_price_id text,
  plan_id text check (plan_id is null or plan_id in ('monthly','yearly')),
  status text not null check (status in ('incomplete','incomplete_expired','trialing','active','past_due','canceled','unpaid','paused')),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  last_stripe_event_created timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  event_created timestamptz not null,
  processed_at timestamptz not null default now(),
  outcome text not null,
  detail jsonb not null default '{}'::jsonb
);

create table if not exists public.activity_entitlements (
  activity_id text primary key,
  access_tier text not null check (access_tier in ('free','premium')),
  title text not null,
  path text not null unique,
  category text not null check (category in ('quiz','game','programme','tool','download')),
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;
alter table public.stripe_webhook_events enable row level security;
alter table public.activity_entitlements enable row level security;

drop policy if exists "Users read own subscription" on public.subscriptions;
create policy "Users read own subscription" on public.subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Anyone reads activity entitlements" on public.activity_entitlements;
create policy "Anyone reads activity entitlements" on public.activity_entitlements
  for select to anon, authenticated using (active = true);

revoke all on public.subscriptions from anon;
revoke insert, update, delete on public.subscriptions from authenticated;
revoke all on public.stripe_webhook_events from anon, authenticated;
grant select on public.subscriptions to authenticated;
grant select on public.activity_entitlements to anon, authenticated;

create or replace function public.has_premium_access()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  ) or exists (
    select 1 from public.subscriptions s
    where s.user_id = (select auth.uid())
      and s.status in ('active','trialing')
      and (s.current_period_end is null or s.current_period_end > now())
  ) or exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.content_access_until > now()
  );
$$;

create or replace function public.get_my_subscription()
returns table (
  access_tier text,
  status text,
  plan_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean,
  stripe_customer_id text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    case when public.has_premium_access() then 'premium' else 'free' end,
    coalesce(s.status, 'none'),
    s.plan_id,
    s.current_period_end,
    coalesce(s.cancel_at_period_end, false),
    s.stripe_customer_id
  from (select auth.uid() as user_id) me
  left join public.subscriptions s on s.user_id = me.user_id;
$$;

grant execute on function public.has_premium_access() to authenticated;
grant execute on function public.get_my_subscription() to authenticated;

-- Private premium assets must use this policy; public GitHub Pages files are not protected by it.
insert into storage.buckets (id, name, public, file_size_limit)
values ('premium-content', 'premium-content', false, 104857600)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

drop policy if exists "Premium users read premium content" on storage.objects;
create policy "Premium users read premium content" on storage.objects
for select to authenticated using (
  bucket_id = 'premium-content' and public.has_premium_access()
);