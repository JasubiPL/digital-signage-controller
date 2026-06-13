# Politicas RLS

## Estado

RLS queda versionado en migraciones SQL:

- `supabase/migrations/202606120002_rls_policies.sql`
- `supabase/migrations/202606120006_two_global_roles.sql`

La migracion `202606120006_two_global_roles.sql` simplifica el modelo a dos
roles globales y deja fuera los roles por compania.

## Modelo de roles

### `super_admin`

Origen:

- `public.profiles.global_role = 'super_admin'`

Alcance:

- Super usuario.
- Puede leer, crear, actualizar y borrar datos de todas las companias.
- Puede gestionar usuarios desde `/dashboard/users`.

### `user`

Origen:

- `public.profiles.global_role = 'user'`

Alcance:

- Usuario normal de consulta.
- Puede leer informacion de companias activas.
- No puede crear, editar ni eliminar datos.
- No ve la opcion `Usuarios`.

## Funciones helper

- `public.current_global_role()`
- `public.is_super_admin()`
- `public.has_any_super_admin()`
- `public.can_read_company(company_id uuid)`
- `public.has_company_role(company_id uuid, allowed_roles text[])`

`has_company_role()` se mantiene como compatibilidad para codigo y politicas de
Storage existentes, pero internamente ya traduce el modelo nuevo:

- Checks de escritura con `array['admin']` solo pasan si el usuario es `super_admin`.
- Checks de lectura pasan para `super_admin` o `user` cuando la compania esta activa.

## Politicas por tabla

### `profiles`

- `SELECT`: el propio usuario o `super_admin`.
- `INSERT`: solo el propio usuario con `global_role = 'user'`.
- `UPDATE`: el propio usuario sin escalar rol, `super_admin`, o bootstrap del primer `super_admin` cuando aun no existe ninguno.
- `DELETE`: solo `super_admin`.

### `companies`

- `SELECT`: `super_admin`, usuarios `user` para companias activas o cualquier autenticado antes de que exista el primer `super_admin`.
- `INSERT`, `UPDATE`, `DELETE`: solo `super_admin`.

### Tablas con `company_id`

Tablas:

- `locations`
- `campaigns`
- `screens`
- `campaign_locations`
- `campaign_screens`
- `media_files`

Lectura:

- `super_admin`
- `user` para companias activas.

Escritura:

- Solo `super_admin`.

## Garantias

- Solo existen dos roles operativos: `super_admin` y `user`.
- Usuarios normales pueden consultar informacion, pero no mutar datos.
- Solo `super_admin` ve y puede abrir `/dashboard/users`.
- Cambiar `company_id` no permite escalar privilegios porque las politicas de escritura requieren `super_admin`.
- `service_role` queda reservado para operaciones server-side administrativas despues de verificar que el usuario actual sea `super_admin`.

## Pruebas manuales recomendadas

Crear al menos:

- Un usuario `super_admin`.
- Un usuario `user`.

Validar:

- `super_admin` puede leer companias activas.
- `super_admin` puede crear, editar y borrar taquillas, campanias, archivos y usuarios.
- `user` puede leer dashboard, taquillas, campanias y archivos visibles.
- `user` no ve botones de crear, editar ni eliminar.
- `user` no ve el menu `Usuarios`.
- `user` no puede abrir `/dashboard/users` aunque escriba la URL directa.

## Pendientes

- Ejecutar pruebas con sesiones reales.
- Generar tipos TypeScript desde Supabase despues de aplicar migraciones.
