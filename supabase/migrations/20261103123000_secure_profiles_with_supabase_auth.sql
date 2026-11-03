create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text not null,
  avatar_url text,
  role text not null default 'student'
    check (role in ('student', 'instructor', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists auth_user_id uuid references auth.users(id) on delete cascade;

create unique index if not exists profiles_email_lower_key
  on public.profiles (lower(email));
create unique index if not exists profiles_auth_user_id_key
  on public.profiles (auth_user_id)
  where auth_user_id is not null;

update public.profiles as profile
set auth_user_id = auth_user.id
from auth.users as auth_user
where lower(profile.email) = lower(auth_user.email)
  and auth_user.email_confirmed_at is not null
  and profile.auth_user_id is null;

alter table public.profiles enable row level security;

do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
  loop
    execute format('drop policy %I on public.profiles', existing_policy.policyname);
  end loop;
end;
$$;

create policy "Users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using (auth_user_id = (select auth.uid()));

revoke all on public.profiles from public, anon;
revoke insert, update, delete, truncate, references, trigger
  on public.profiles from authenticated;
grant select on public.profiles to authenticated;

create or replace function public.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is null or exists (
    select 1
    from public.profiles as profile
    where lower(profile.email) = lower(new.email)
  ) then
    return new;
  end if;

  insert into public.profiles (id, auth_user_id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    'student'
  )
  on conflict do nothing;

  return new;
end;
$$;

revoke all on function public.create_profile_for_auth_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_profile_for_auth_user();