alter table public.orders
  add column if not exists pago_validado boolean not null default false,
  add column if not exists payment_reference text,
  add column if not exists payment_validated_at timestamptz,
  add column if not exists pos_facturado boolean not null default false,
  add column if not exists pos_facturado_at timestamptz,
  add column if not exists pos_reference text;

create index if not exists orders_pos_ready_idx
  on public.orders (branch_id, created_at asc)
  where status = 'submitted' and pago_validado and not pos_facturado;
