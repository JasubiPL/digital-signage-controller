# Crear usuario admin en Supabase

## Objetivo

Crear un usuario en Supabase Auth y darle permisos de administrador global dentro del schema de la aplicacion.

El login de la app no permite autoregistro. Las cuentas se crean manualmente en Supabase y despues se relacionan con `public.profiles`.

El rol legado `admin` era global. En el modelo nuevo eso corresponde a:

```text
public.profiles.global_role = 'super_admin'
```

`public.user_companies` queda para roles limitados a una compania, como `operator`, `designer`, `viewer` o admins no globales.

## Paso 1: crear usuario en Supabase Auth

En Supabase Dashboard:

1. Abrir el proyecto.
2. Ir a `Authentication` > `Users`.
3. Crear un usuario nuevo.
4. Usar email y contrasena.
5. Dejar el email confirmado, o confirmar el usuario desde el Dashboard.

Supabase Auth guarda el usuario real en `auth.users`. La app usa ese `id` para relacionarlo con `public.profiles`.

## Paso 2: crear o actualizar el profile como admin global

En `SQL Editor`, reemplazar `admin@example.com` y `Admin Principal`:

```sql
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
```

## Verificacion

Confirmar que el usuario ya tiene permisos:

```sql
select
  p.email,
  p.full_name,
  p.global_role
from public.profiles p
where p.email = 'admin@example.com'
  and p.global_role = 'super_admin';
```

Despues de esto, el usuario puede iniciar sesion en `/login` con email y contrasena.

El dashboard resolvera sus accesos como admin global y mostrara todas las companias activas sin requerir filas en `public.user_companies`.

## Notas

- Si `companies` esta vacia, primero aplicar `supabase/seed.sql`.
- `global_role = 'super_admin'` es el equivalente del admin global del proyecto anterior.
- No insertar filas en `user_companies` para este caso global. Esa tabla se usara cuando una cuenta deba estar limitada a una o varias companias concretas.
