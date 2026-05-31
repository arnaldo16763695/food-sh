create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  is_superadmin boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_branch_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.admin_profiles (user_id) on delete cascade,
  branch_id uuid not null references public.branches (id) on delete cascade,
  role text not null check (role in ('branch_manager', 'branch_operator')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint admin_branch_access_user_branch_unique unique (user_id, branch_id)
);

create index if not exists admin_branch_access_user_idx
  on public.admin_branch_access (user_id);

create index if not exists admin_branch_access_branch_idx
  on public.admin_branch_access (branch_id);

alter table public.admin_profiles enable row level security;
alter table public.admin_branch_access enable row level security;
