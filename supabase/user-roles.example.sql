-- Example role assignments for real Supabase Auth users.
-- Replace emails and names before running this in Supabase SQL Editor.

-- Super usuario: administra usuarios, marcas, taquillas, campanias y archivos.
insert into public.profiles (id, email, full_name, global_role)
select
  u.id,
  u.email,
  'Super Usuario',
  'super_admin'
from auth.users u
where u.email = 'super.usuario@example.com'
on conflict (id) do update
set
  email = excluded.email,
  full_name = excluded.full_name,
  global_role = excluded.global_role,
  updated_at = now();

-- Manager: consulta informacion y puede comentar incidentes.
insert into public.profiles (id, email, full_name, global_role)
select
  u.id,
  u.email,
  'Manager',
  'manager'
from auth.users u
where u.email = 'manager@example.com'
on conflict (id) do update
set
  email = excluded.email,
  full_name = excluded.full_name,
  global_role = excluded.global_role,
  updated_at = now();

-- Consultor: solo puede leer informacion general.
insert into public.profiles (id, email, full_name, global_role)
select
  u.id,
  u.email,
  'Consultor',
  'user'
from auth.users u
where u.email = 'consulta@example.com'
on conflict (id) do update
set
  email = excluded.email,
  full_name = excluded.full_name,
  global_role = excluded.global_role,
  updated_at = now();
