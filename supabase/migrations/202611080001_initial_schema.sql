-- Base propuesta. Aplicar primero en un proyecto Supabase de desarrollo.
-- No contiene usuarios reales ni credenciales. Revisar supabase/README.md.
begin;
create extension if not exists btree_gist;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (length(trim(display_name)) between 1 and 100),
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, display_name)
  values (new.id, left(coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), 'Usuario'), 100));
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create table public.equipment (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null check(length(trim(name)) > 0),
  category text not null,
  description text not null default '',
  location text not null,
  condition text not null default 'operational' check(condition in ('operational', 'maintenance')),
  created_at timestamptz not null default now()
);
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references public.equipment(id),
  user_id uuid not null references public.profiles(id),
  purpose text not null check(length(trim(purpose)) between 1 and 200),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'active' check(status in ('active','cancelled','fulfilled')),
  created_at timestamptz not null default now(),
  check(ends_at > starts_at),
  constraint no_overlapping_reservations exclude using gist
    (equipment_id with =, tstzrange(starts_at, ends_at, '[)') with &&)
    where (status in ('active','fulfilled'))
);
create index reservations_user_idx on public.reservations(user_id);
create table public.loans (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null unique references public.reservations(id),
  equipment_id uuid not null references public.equipment(id),
  user_id uuid not null references public.profiles(id),
  delivered_by uuid not null references public.profiles(id),
  delivered_at timestamptz not null default now(),
  due_at timestamptz not null,
  status text not null default 'active' check(status in ('active','returned')),
  check(due_at >= delivered_at)
);
create unique index one_active_loan_per_equipment on public.loans(equipment_id) where status = 'active';
create index loans_user_idx on public.loans(user_id);
create table public.returns (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null unique references public.loans(id),
  received_by uuid not null references public.profiles(id),
  returned_at timestamptz not null default now(),
  condition text not null check(condition in ('good','damaged')),
  notes text not null default '',
  check(condition <> 'damaged' or length(trim(notes)) > 0)
);
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id),
  equipment_id uuid not null references public.equipment(id),
  action text not null,
  reservation_id uuid references public.reservations(id),
  loan_id uuid references public.loans(id),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.equipment enable row level security;
alter table public.reservations enable row level security;
alter table public.loans enable row level security;
alter table public.returns enable row level security;
alter table public.activity_log enable row level security;

-- Explicit grants: operational writes remain blocked until transactional RPCs exist.
revoke all on public.profiles,public.equipment,public.reservations,public.loans,public.returns,public.activity_log from anon,authenticated;
grant select on public.profiles,public.equipment,public.reservations,public.loans,public.returns,public.activity_log to authenticated;
grant update(display_name) on public.profiles to authenticated;
grant insert,update on public.equipment to authenticated;

create policy profiles_read on public.profiles for select to authenticated using(id = (select auth.uid()) or (select public.is_admin()));
create policy profiles_update_name on public.profiles for update to authenticated using(id = (select auth.uid())) with check(id = (select auth.uid()));
create policy equipment_read on public.equipment for select to authenticated using(true);
create policy equipment_insert_admin on public.equipment for insert to authenticated with check((select public.is_admin()));
create policy equipment_update_admin on public.equipment for update to authenticated using((select public.is_admin())) with check((select public.is_admin()));
create policy reservations_read on public.reservations for select to authenticated using(user_id = (select auth.uid()) or (select public.is_admin()));
create policy loans_read on public.loans for select to authenticated using(user_id = (select auth.uid()) or (select public.is_admin()));
create policy returns_read on public.returns for select to authenticated using((select public.is_admin()) or exists(select 1 from public.loans where loans.id = loan_id and loans.user_id = (select auth.uid())));
create policy activity_read_admin on public.activity_log for select to authenticated using((select public.is_admin()));
commit;
