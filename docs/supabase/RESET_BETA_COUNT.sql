-- Reset beta signup counter to 0 (keeps existing auth users; bumps count_offset).
-- Run in: https://supabase.com/dashboard/project/firqlsjixojnrofycwbs/sql/new
-- Or: npm run beta:reset

alter table public.beta_capacity
  add column if not exists count_offset int not null default 0;

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

-- Set offset = all users registered so far → displayed count becomes 0
update public.beta_capacity
set
  count_offset = (select count(*)::int from auth.users),
  updated_at = now()
where id = 1;

select public.get_beta_capacity() as beta_after_reset;
