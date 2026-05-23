-- Server-side beta waitlist (replaces localStorage-only capture on /beta)

create table if not exists public.beta_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'beta_page',
  created_at timestamptz not null default now(),
  invited_at timestamptz,
  notes text
);

alter table public.beta_waitlist enable row level security;

-- No direct client access; use API routes with service role or RPC below.

create or replace function public.join_beta_waitlist(p_email text, p_source text default 'beta_page')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
begin
  if v_email is null or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    return jsonb_build_object('ok', false, 'error', 'invalid_email');
  end if;

  insert into public.beta_waitlist (email, source)
  values (v_email, coalesce(nullif(trim(p_source), ''), 'beta_page'))
  on conflict (email) do nothing;

  return jsonb_build_object(
    'ok', true,
    'email', v_email,
    'duplicate', not found
  );
end;
$$;

revoke all on function public.join_beta_waitlist(text, text) from public;
grant execute on function public.join_beta_waitlist(text, text) to anon, authenticated;
