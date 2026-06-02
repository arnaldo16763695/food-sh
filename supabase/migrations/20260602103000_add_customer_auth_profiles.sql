create table if not exists public.customer_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.customer_profiles enable row level security;

create policy "customer_profiles_select_own"
  on public.customer_profiles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "customer_profiles_insert_own"
  on public.customer_profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "customer_profiles_update_own"
  on public.customer_profiles
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.handle_customer_profile_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.customer_profiles (user_id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (user_id) do update
  set
    full_name = case
      when public.customer_profiles.full_name = '' then excluded.full_name
      else public.customer_profiles.full_name
    end,
    phone = case
      when public.customer_profiles.phone = '' then excluded.phone
      else public.customer_profiles.phone
    end,
    updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_customer_profile on auth.users;

create trigger on_auth_user_created_create_customer_profile
  after insert on auth.users
  for each row
  execute procedure public.handle_customer_profile_from_auth_user();

insert into public.customer_profiles (user_id, full_name, phone)
select
  users.id,
  coalesce(users.raw_user_meta_data ->> 'full_name', ''),
  coalesce(users.raw_user_meta_data ->> 'phone', '')
from auth.users as users
where not exists (
  select 1
  from public.customer_profiles as profiles
  where profiles.user_id = users.id
);

alter table public.orders
  add column if not exists customer_user_id uuid references auth.users (id) on delete restrict;

create index if not exists orders_customer_user_created_idx
  on public.orders (customer_user_id, created_at desc);
