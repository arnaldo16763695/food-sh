create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  branch_id text not null references public.branches (slug) on update cascade on delete restrict,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  fulfillment_type text not null check (fulfillment_type in ('pickup', 'delivery')),
  notes text not null default '',
  currency text not null check (currency in ('USD', 'VES')),
  subtotal_usd double precision not null default 0 check (subtotal_usd >= 0),
  subtotal_ves double precision not null default 0 check (subtotal_ves >= 0),
  status text not null default 'submitted' check (status in ('draft', 'submitted', 'cancelled')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists orders_branch_created_idx
  on public.orders (branch_id, created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on update cascade on delete restrict,
  product_name text not null,
  sku text not null,
  quantity integer not null check (quantity > 0),
  note text not null default '',
  exclusions text[] not null default '{}',
  unit_price_usd double precision not null check (unit_price_usd >= 0),
  unit_price_ves double precision not null check (unit_price_ves >= 0),
  line_total_usd double precision not null check (line_total_usd >= 0),
  line_total_ves double precision not null check (line_total_ves >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists order_items_order_idx
  on public.order_items (order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
