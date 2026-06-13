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

-- Usuario consulta: solo puede leer informacion.
insert into public.profiles (id, email, full_name, global_role)
select
  u.id,
  u.email,
  'Usuario Consulta',
  'user'
from auth.users u
where u.email = 'consulta@example.com'
on conflict (id) do update
set
  email = excluded.email,
  full_name = excluded.full_name,
  global_role = excluded.global_role,
  updated_at = now();
