# Politicas RLS

## Estado

RLS queda versionado en migraciones SQL:

- `supabase/migrations/202606120002_rls_policies.sql`
- `supabase/migrations/202606120006_two_global_roles.sql`
- `supabase/migrations/202606140001_manager_incidents.sql`

La migracion `202606120006_two_global_roles.sql` simplifica el modelo base y
deja fuera los roles por compania. La migracion
`202606140001_manager_incidents.sql` agrega `manager` e incidentes.

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
- No accede a incidentes.
- No ve la opcion `Usuarios`.

### `manager`

Origen:

- `public.profiles.global_role = 'manager'`

Alcance:

- Puede leer informacion de companias activas como Consultor.
- Puede ver `/dashboard/incidents`.
- Puede comentar incidentes y adjuntar imagenes en sus comentarios.
- No puede crear, editar, cerrar, cancelar ni eliminar incidentes.
- No ve la opcion `Usuarios`.

## Funciones helper

- `public.current_global_role()`
- `public.is_super_admin()`
- `public.has_any_super_admin()`
- `public.can_read_company(company_id uuid)`
- `public.can_access_incidents(company_id uuid)`
- `public.can_comment_incidents(company_id uuid)`
- `public.has_company_role(company_id uuid, allowed_roles text[])`

`has_company_role()` se mantiene como compatibilidad para codigo y politicas de
Storage existentes, pero internamente ya traduce el modelo nuevo:

- Checks de escritura con `array['admin']` solo pasan si el usuario es `super_admin`.
- Checks de lectura pasan para `super_admin`, `manager` o `user` cuando la compania esta activa.

## Politicas por tabla

### `profiles`

- `SELECT`: el propio usuario o `super_admin`.
- `INSERT`: solo el propio usuario con `global_role = 'user'`.
- `UPDATE`: el propio usuario sin escalar rol, `super_admin`, o bootstrap del primer `super_admin` cuando aun no existe ninguno.
- `DELETE`: solo `super_admin`.

### `companies`

- `SELECT`: `super_admin`, usuarios `manager`/`user` para companias activas o cualquier autenticado antes de que exista el primer `super_admin`.
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
- `manager` para companias activas.

Escritura:

- Solo `super_admin`.

### Incidentes

Tablas:

- `location_incidents`
- `location_incident_notes`
- `location_incident_attachments`

Lectura:

- `super_admin`.
- `manager` para companias activas.

Escritura:

- Incidentes: solo `super_admin`.
- Notas: `super_admin` y `manager`.
- Adjuntos: `super_admin`; `manager` solo con comentario.

## Garantias

- Existen tres roles operativos: `super_admin`, `manager` y `user`.
- Usuarios normales pueden consultar informacion, pero no mutar datos.
- Manager puede comentar incidentes, pero no modificar datos operativos ni cerrar incidentes.
- Solo `super_admin` ve y puede abrir `/dashboard/users`.
- Cambiar `company_id` no permite escalar privilegios porque las politicas de escritura requieren `super_admin`.
- `service_role` queda reservado para operaciones server-side administrativas despues de verificar que el usuario actual sea `super_admin`.

## Pruebas manuales recomendadas

Crear al menos:

- Un usuario `super_admin`.
- Un usuario `manager`.
- Un usuario `user`.

Validar:

- `super_admin` puede leer companias activas.
- `super_admin` puede crear, editar y borrar taquillas, campanias, archivos y usuarios.
- `user` puede leer dashboard, taquillas, campanias y archivos visibles.
- `manager` puede leer dashboard, taquillas, campanias, archivos e incidentes.
- `manager` puede comentar incidentes y adjuntar imagenes.
- `manager` no puede crear, editar, cerrar, cancelar ni eliminar incidentes.
- `user` no ve ni abre `/dashboard/incidents`.
- `user` no ve botones de crear, editar ni eliminar.
- `user` no ve el menu `Usuarios`.
- `user` no puede abrir `/dashboard/users` aunque escriba la URL directa.

## Pendientes

- Ejecutar pruebas con sesiones reales.
- Generar tipos TypeScript desde Supabase despues de aplicar migraciones.
