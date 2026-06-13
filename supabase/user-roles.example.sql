-- Example role assignments for real Supabase Auth users.
-- Replace emails and names before running this in Supabase SQL Editor.
-- Run supabase/seed.sql first so companies exist.

-- Global admin.
insert into public.profiles (id, email, full_name, global_role)
select
  u.id,
  u.email,
  'Admin Principal',
  'super_admin'
from auth.users u
where u.email = 'admin@example.com'
on conflict (id) do update
set
  email = excluded.email,
  full_name = excluded.full_name,
  global_role = excluded.global_role,
  updated_at = now();

-- Company-scoped admin.
with target_user as (
  insert into public.profiles (id, email, full_name, global_role)
  select
    u.id,
    u.email,
    'Admin ETN',
    'user'
  from auth.users u
  where u.email = 'admin-etn@example.com'
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    updated_at = now()
  returning id
),
target_company as (
  select id
  from public.companies
  where slug = 'etn'
)
insert into public.user_companies (user_id, company_id, role)
select
  target_user.id,
  target_company.id,
  'admin'
from target_user, target_company
on conflict (user_id, company_id) do update
set role = excluded.role;

-- Company-scoped viewer.
with target_user as (
  insert into public.profiles (id, email, full_name, global_role)
  select
    u.id,
    u.email,
    'Viewer GHO',
    'user'
  from auth.users u
  where u.email = 'viewer-gho@example.com'
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    updated_at = now()
  returning id
),
target_company as (
  select id
  from public.companies
  where slug = 'gho'
)
insert into public.user_companies (user_id, company_id, role)
select
  target_user.id,
  target_company.id,
  'viewer'
from target_user, target_company
on conflict (user_id, company_id) do update
set role = excluded.role;
