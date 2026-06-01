alter table public.branches
  add column if not exists online_order_mode text not null default 'auto';

alter table public.branches
  drop constraint if exists branches_online_order_mode_check;

alter table public.branches
  add constraint branches_online_order_mode_check
  check (online_order_mode in ('auto', 'force_closed', 'force_open'));
