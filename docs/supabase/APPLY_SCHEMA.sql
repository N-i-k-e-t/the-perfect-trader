-- Run once in Supabase Dashboard → SQL Editor
-- Project: firqlsjixojnrofycwbs (Tokyo)
-- Same as supabase/migrations/*.sql — safe to re-run (idempotent)
--
-- Step 4: Run user_events migration (tracking layer)
-- Command: npx supabase db push OR run migration file manually
-- File: supabase/migrations/20260325000000_user_events.sql

create table if not exists public.trader_snapshots (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  version text not null default '1.1.0',
  updated_at timestamptz not null default now()
);

alter table public.trader_snapshots enable row level security;

drop policy if exists "trader_snapshots_select_own" on public.trader_snapshots;
drop policy if exists "trader_snapshots_insert_own" on public.trader_snapshots;
drop policy if exists "trader_snapshots_update_own" on public.trader_snapshots;
drop policy if exists "trader_snapshots_delete_own" on public.trader_snapshots;

create policy "trader_snapshots_select_own"
  on public.trader_snapshots for select
  using (auth.uid() = user_id);

create policy "trader_snapshots_insert_own"
  on public.trader_snapshots for insert
  with check (auth.uid() = user_id);

create policy "trader_snapshots_update_own"
  on public.trader_snapshots for update
  using (auth.uid() = user_id);

create policy "trader_snapshots_delete_own"
  on public.trader_snapshots for delete
  using (auth.uid() = user_id);

create index if not exists trader_snapshots_updated_at_idx
  on public.trader_snapshots (updated_at desc);

-- Closed beta: first 100 users (see supabase/migrations/20260323000000_beta_capacity.sql)
create table if not exists public.beta_capacity (
  id int primary key default 1 check (id = 1),
  max_users int not null default 100,
  count_offset int not null default 0,
  updated_at timestamptz not null default now()
);
insert into public.beta_capacity (id, max_users) values (1, 100) on conflict (id) do nothing;
alter table public.beta_capacity add column if not exists count_offset int not null default 0;
alter table public.beta_capacity enable row level security;
drop policy if exists "beta_capacity_read_all" on public.beta_capacity;
create policy "beta_capacity_read_all" on public.beta_capacity for select to anon, authenticated using (true);
create or replace function public.get_beta_capacity() returns jsonb language plpgsql security definer set search_path = public, auth as $$
declare v_max int; v_raw int; v_offset int; v_current int;
begin
  select max_users, coalesce(count_offset, 0) into v_max, v_offset from public.beta_capacity where id = 1;
  if v_max is null then v_max := 100; end if;
  select count(*)::int into v_raw from auth.users;
  v_current := greatest(0, v_raw - v_offset);
  return jsonb_build_object('max', v_max, 'current', v_current, 'remaining', greatest(0, v_max - v_current), 'allowed', v_current < v_max, 'full', v_current >= v_max);
end; $$;
revoke all on function public.get_beta_capacity() from public;
grant execute on function public.get_beta_capacity() to anon, authenticated;

-- ── user_events (from supabase/migrations/20260325000000_user_events.sql) ──

create table if not exists public.user_events (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null unique,
  user_id uuid references auth.users (id) on delete set null,
  anonymous_id text not null,
  session_id text not null,
  event_name text not null,
  event_category text not null,
  event_properties jsonb not null default '{}'::jsonb,

  timestamp_utc timestamptz not null,
  timezone text,
  timezone_offset int,

  page_path text,
  page_title text,
  referrer text,

  device_type text,
  os text,
  browser text,
  browser_version text,
  screen_width int,
  screen_height int,
  viewport_width int,
  viewport_height int,
  is_pwa boolean default false,
  is_touch boolean default false,
  connection_type text,

  geo_country text,
  geo_country_name text,
  geo_region text,
  geo_region_name text,
  geo_city text,
  geo_lat double precision,
  geo_lon double precision,
  geo_isp text,

  app_version text,
  schema_version text,
  is_online boolean default true,
  analytics_consent boolean default false,
  is_beta_user boolean default false,
  is_pro_user boolean default false,
  is_admin boolean default false,

  session_start_utc timestamptz,
  session_duration_ms bigint,
  page_view_count int,
  event_sequence int,

  created_at timestamptz not null default now()
);

create index if not exists idx_user_events_user_id on public.user_events (user_id);
create index if not exists idx_user_events_event_name on public.user_events (event_name);
create index if not exists idx_user_events_timestamp on public.user_events (timestamp_utc desc);
create index if not exists idx_user_events_session on public.user_events (session_id);
create index if not exists idx_user_events_category on public.user_events (event_category);

alter table public.user_events enable row level security;

drop policy if exists "user_events_select_own" on public.user_events;
create policy "user_events_select_own"
  on public.user_events for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "user_events_insert_authenticated" on public.user_events;
create policy "user_events_insert_authenticated"
  on public.user_events for insert
  to authenticated
  with check (user_id is null or auth.uid() = user_id);

drop policy if exists "user_events_insert_anon" on public.user_events;
create policy "user_events_insert_anon"
  on public.user_events for insert
  to anon
  with check (user_id is null);
