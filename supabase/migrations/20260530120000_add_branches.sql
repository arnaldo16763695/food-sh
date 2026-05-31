create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists branches_public_active_idx
  on public.branches (slug)
  where is_active;

insert into public.branches (slug, name, is_active)
select distinct
  p.branch_id,
  'Sucursal ' || initcap(p.branch_id),
  true
from public.products p
where not exists (
  select 1
  from public.branches b
  where b.slug = p.branch_id
);

alter table public.products
  add constraint products_branch_id_fkey
  foreign key (branch_id)
  references public.branches (slug)
  on update cascade
  on delete restrict;

alter table public.branches enable row level security;

create policy "Public can read active branches"
  on public.branches
  for select
  to anon, authenticated
  using (is_active);
