# Crear super usuario en Supabase

## Objetivo

Crear un usuario en Supabase Auth y darle permisos de super usuario dentro del
schema de la aplicacion.

El login de la app no permite autoregistro. Las cuentas se crean desde
Supabase Dashboard o desde `/dashboard/users` cuando ya existe un super usuario.

El modelo vigente solo tiene dos roles:

```text
public.profiles.global_role = 'super_admin'
public.profiles.global_role = 'user'
```

## Paso 1: crear usuario en Supabase Auth

En Supabase Dashboard:

1. Abrir el proyecto.
2. Ir a `Authentication` > `Users`.
3. Crear un usuario nuevo.
4. Usar email y contrasena.
5. Dejar el email confirmado, o confirmar el usuario desde el Dashboard.

Supabase Auth guarda el usuario real en `auth.users`. La app usa ese `id` para
relacionarlo con `public.profiles`.

## Paso 2: crear o actualizar el profile como super usuario

En `SQL Editor`, reemplazar `super.usuario@example.com` y `Super Usuario`:

```sql
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
```

## Verificacion

Confirmar que el usuario ya tiene permisos:

```sql
select
  p.email,
  p.full_name,
  p.global_role
from public.profiles p
where p.email = 'super.usuario@example.com'
  and p.global_role = 'super_admin';
```

Despues de esto, el usuario puede iniciar sesion en `/login` con email y
contrasena. El dashboard resolvera sus accesos como super usuario y mostrara
todas las companias activas.

## Notas

- Si `companies` esta vacia, primero aplicar `supabase/seed.sql`.
- `super_admin` es el unico rol con permisos de escritura.
- `user` es el rol normal de consulta.
