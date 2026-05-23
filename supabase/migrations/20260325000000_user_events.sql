-- Behavioral analytics: user_events (see master-tracking-prompt.md)

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
