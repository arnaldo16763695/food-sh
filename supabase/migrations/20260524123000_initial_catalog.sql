create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  external_id text not null,
  branch_id text not null,
  sku text not null,
  name text not null,
  description text not null default '',
  image_url text,
  price_usd double precision not null check (price_usd >= 0),
  price_ves double precision not null check (price_ves >= 0),
  stock double precision not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  online_enabled boolean not null default true,
  updated_at_source timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint products_branch_external_unique unique (branch_id, external_id)
);

create index if not exists products_public_branch_updated_idx
  on public.products (branch_id, updated_at desc)
  where is_active and online_enabled;

alter table public.products enable row level security;

create policy "Public can read visible products"
  on public.products
  for select
  to anon, authenticated
  using (is_active and online_enabled);
