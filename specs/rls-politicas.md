# Politicas RLS

## Estado

RLS esta implementado como migracion SQL versionada:

- `supabase/migrations/202606120002_rls_policies.sql`

La configuracion RLS ya fue aplicada en Supabase cloud. Queda pendiente ejecutar
pruebas manuales con usuarios reales de distintos roles.

## Modelo de roles

### `super_admin`

Origen:

- `public.profiles.global_role = 'super_admin'`

Alcance:

- Admin global.
- Equivalente al admin global del sistema anterior.
- No requiere filas en `public.user_companies`.
- Puede leer, crear, actualizar y borrar datos de todas las companias.

### `admin`

Origen:

- `public.user_companies.role = 'admin'`

Alcance:

- Admin limitado a las companias donde tiene registro en `user_companies`.
- Puede leer datos de sus companias.
- Puede crear, actualizar y borrar:
  - `locations`
  - `campaigns`
  - `screens`
  - `campaign_locations`
  - `campaign_screens`
  - `media_files`
- Puede administrar registros en `user_companies` para sus companias.

### `operator`

Origen:

- `public.user_companies.role = 'operator'`

Alcance inicial:

- Lectura de datos de sus companias.
- Sin permisos de escritura hasta confirmar flujos operativos concretos.

### `designer`

Origen:

- `public.user_companies.role = 'designer'`

Alcance inicial:

- Lectura de datos de sus companias.
- Sin permisos de upload o escritura hasta confirmar el flujo formal de contenido.

### `viewer`

Origen:

- `public.user_companies.role = 'viewer'`

Alcance:

- Solo lectura de datos de sus companias.

## Funciones helper

La configuracion crea funciones `security definer` para evitar recursividad de RLS al resolver roles:

- `public.current_global_role()`
- `public.is_super_admin()`
- `public.has_any_super_admin()`
- `public.has_company_role(company_id uuid, allowed_roles text[])`

Estas funciones se usan dentro de politicas y tambien permiten que la app sepa si ya existe un primer `super_admin`.

## Politicas por tabla

### `profiles`

- `SELECT`: el propio usuario o `super_admin`.
- `INSERT`: solo el propio usuario con `global_role = 'user'`.
- `UPDATE`: el propio usuario sin escalar rol, `super_admin`, o bootstrap del primer `super_admin` cuando aun no existe ninguno.
- `DELETE`: solo `super_admin`.

Nota: `ensureProfile()` no sobreescribe `global_role`; esto evita degradar admins globales durante login.

### `companies`

- `SELECT`: `super_admin`, usuarios con rol en esa compania o cualquier autenticado antes de que exista el primer `super_admin`.
- `INSERT`, `UPDATE`, `DELETE`: solo `super_admin`.

El acceso temporal antes del primer `super_admin` permite que el bootstrap detecte companias existentes.

### `user_companies`

- `SELECT`: el propio usuario, `super_admin` o `admin` de esa compania.
- `INSERT`, `UPDATE`, `DELETE`: `super_admin` o `admin` de esa compania.

Esto permite que admins por compania administren permisos dentro de su alcance, sin tocar otras companias.

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
- `admin`
- `operator`
- `designer`
- `viewer`

Escritura:

- `super_admin`
- `admin` de la compania correspondiente

Los roles `operator`, `designer` y `viewer` quedan sin escritura por defecto.

## Garantias

- Usuarios sin rol no pueden leer datos de companias cuando ya existe un `super_admin`.
- Usuarios con rol en una compania no pueden leer datos de otra.
- Mutaciones requieren `super_admin` o `admin` de la compania.
- Cambiar `company_id` no permite escalar privilegios porque las politicas de `UPDATE` validan tanto la fila original como el estado nuevo.
- `service_role` queda reservado para operaciones server-side administrativas.

## Pruebas manuales recomendadas

Crear al menos:

- Un usuario `super_admin`.
- Un usuario `admin` en `etn`.
- Un usuario `operator` en `etn`.
- Un usuario `viewer` en `gho`.
- Un usuario autenticado sin registros en `user_companies`.

Validar:

- `super_admin` puede leer companias activas.
- `admin` de `etn` puede leer y escribir datos `etn`.
- `admin` de `etn` no puede leer ni escribir datos `gho`.
- `operator` de `etn` puede leer datos `etn`.
- `operator` de `etn` no puede insertar, actualizar ni borrar datos.
- `viewer` de `gho` solo puede leer datos `gho`.
- Usuario sin compania no puede leer datos de companias cuando ya existe `super_admin`.

## Pendientes

- Ejecutar pruebas con sesiones reales.
- Generar tipos TypeScript desde Supabase despues de aplicar migraciones.
- Revisar si `designer` debe poder subir archivos en Fase 7.
- Revisar si `operator` debe poder editar operaciones diarias cuando se definan esos flujos.
