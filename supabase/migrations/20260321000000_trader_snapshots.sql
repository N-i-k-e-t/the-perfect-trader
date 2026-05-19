-- Edit schema here, then run: npm run db:push  (remote) or npm run db:reset (local)
-- https://supabase.com/docs/guides/cli/local-development

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

create policy "trader_snapshots_select_own"
  on public.trader_snapshots for select
  using (auth.uid() = user_id);

create policy "trader_snapshots_insert_own"
  on public.trader_snapshots for insert
  with check (auth.uid() = user_id);

create policy "trader_snapshots_update_own"
  on public.trader_snapshots for update
  using (auth.uid() = user_id);

create index if not exists trader_snapshots_updated_at_idx
  on public.trader_snapshots (updated_at desc);
