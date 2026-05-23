-- Changelog email subscribers (public insert via service-role API only)
create table if not exists public.changelog_subscribers (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    created_at timestamptz not null default now()
);

alter table public.changelog_subscribers enable row level security;

-- No policies: clients cannot read/write; API uses service role
