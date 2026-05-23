-- Resettable beta counter: effective count = auth.users - count_offset

alter table public.beta_capacity
  add column if not exists count_offset int not null default 0;

comment on column public.beta_capacity.count_offset is
  'Subtracted from auth.users count so beta wave can reset without deleting accounts.';

create or replace function public.get_beta_capacity()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_max int;
  v_raw int;
  v_offset int;
  v_current int;
begin
  select max_users, coalesce(count_offset, 0)
    into v_max, v_offset
  from public.beta_capacity
  where id = 1;

  if v_max is null then
    v_max := 100;
  end if;

  select count(*)::int into v_raw from auth.users;
  v_current := greatest(0, v_raw - v_offset);

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
