-- Run once in Supabase Dashboard → SQL Editor
-- Project: firqlsjixojnrofycwbs (Tokyo)
-- Same as supabase/migrations/*.sql — safe to re-run (idempotent)

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
  updated_at timestamptz not null default now()
);
insert into public.beta_capacity (id, max_users) values (1, 100) on conflict (id) do nothing;
alter table public.beta_capacity enable row level security;
drop policy if exists "beta_capacity_read_all" on public.beta_capacity;
create policy "beta_capacity_read_all" on public.beta_capacity for select to anon, authenticated using (true);
create or replace function public.get_beta_capacity() returns jsonb language plpgsql security definer set search_path = public, auth as $$
declare v_max int; v_current int;
begin
  select max_users into v_max from public.beta_capacity where id = 1;
  if v_max is null then v_max := 100; end if;
  select count(*)::int into v_current from auth.users;
  return jsonb_build_object('max', v_max, 'current', v_current, 'remaining', greatest(0, v_max - v_current), 'allowed', v_current < v_max, 'full', v_current >= v_max);
end; $$;
revoke all on function public.get_beta_capacity() from public;
grant execute on function public.get_beta_capacity() to anon, authenticated;
