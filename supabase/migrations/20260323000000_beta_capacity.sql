-- Closed beta: first N registered users (counts auth.users).

create table if not exists public.beta_capacity (
  id int primary key default 1 check (id = 1),
  max_users int not null default 100,
  updated_at timestamptz not null default now()
);

insert into public.beta_capacity (id, max_users)
values (1, 100)
on conflict (id) do nothing;

alter table public.beta_capacity enable row level security;

drop policy if exists "beta_capacity_read_all" on public.beta_capacity;
create policy "beta_capacity_read_all"
  on public.beta_capacity for select
  to anon, authenticated
  using (true);

-- Only service role should update max_users (dashboard / migration).

create or replace function public.get_beta_capacity()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_max int;
  v_current int;
begin
  select max_users into v_max from public.beta_capacity where id = 1;
  if v_max is null then
    v_max := 100;
  end if;

  select count(*)::int into v_current from auth.users;

  return jsonb_build_object(
    'max', v_max,
    'current', v_current,
    'remaining', greatest(0, v_max - v_current),
    'allowed', v_current < v_max,
    'full', v_current >= v_max
  );
end;
$$;

revoke all on function public.get_beta_capacity() from public;
grant execute on function public.get_beta_capacity() to anon, authenticated;
