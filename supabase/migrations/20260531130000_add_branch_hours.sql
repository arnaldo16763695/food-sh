create table if not exists public.branch_hours (
  id uuid primary key default gen_random_uuid(),
  branch_id text not null references public.branches (slug) on update cascade on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  opens_at time,
  closes_at time,
  is_closed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint branch_hours_branch_weekday_unique unique (branch_id, weekday),
  constraint branch_hours_open_close_check check (
    is_closed = true
    or (opens_at is not null and closes_at is not null and opens_at < closes_at)
  )
);

create index if not exists branch_hours_branch_weekday_idx
  on public.branch_hours (branch_id, weekday);

alter table public.branch_hours enable row level security;

create policy "Public can read branch hours"
  on public.branch_hours
  for select
  to anon, authenticated
  using (true);
