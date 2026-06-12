# Modelo de datos

## Estado

Modelo implementado como migracion SQL versionada y schema verificado en Supabase cloud. Pendiente aplicar o verificar seed en cloud.

Archivos:

- `supabase/migrations/202606120001_initial_schema.sql`
- `supabase/seed.sql`
- `supabase/README.md`

## Objetivo

Reemplazar el modelo MySQL anterior basado en tablas por empresa por un modelo PostgreSQL multiempresa normalizado.

## Mapeo desde el sistema anterior

Tablas MySQL anteriores:

- `taquillas_ETN`
- `taquillas_GHO`
- `taquillas_COSTA`
- `campanias_ETN`
- `campanias_GHO`
- `campanias_COSTA`
- `taquillas_campanias_ETN`
- `taquillas_campanias_GHO`
- `taquillas_campanias_COSTA`
- `usuarios`, esperada por codigo pero ausente en `start_db.sql`

Modelo nuevo:

- `companies`: reemplaza el sufijo dinamico de empresa.
- `locations`: reemplaza `taquillas_*`.
- `campaigns`: reemplaza `campanias_*`.
- `campaign_locations`: reemplaza `taquillas_campanias_*`.
- `profiles`: reemplaza `usuarios` y se relaciona con `auth.users`.
- `user_companies`: define permisos por empresa.
- `screens`: representa pantallas o players.
- `campaign_screens`: permite asignar campanias directamente a pantallas.
- `media_files`: metadata para archivos en Supabase Storage.

## Entidades

### `companies`

Representa empresas o marcas operativas.

Campos principales:

- `id`: UUID primary key.
- `slug`: identificador estable para rutas y consultas.
- `legacy_code`: codigo del sistema anterior, como `ETN`, `GHO`, `COSTA`.
- `name`: nombre visible.
- `status`: `active`, `inactive`, `archived`.
- `created_at`, `updated_at`.

Seed inicial:

- `etn`
- `gho`
- `costaline`
- `iamsa`

### `profiles`

Extiende `auth.users` de Supabase.

Campos principales:

- `id`: UUID igual a `auth.users.id`.
- `full_name`
- `email`
- `avatar_url`
- `global_role`: `user` o `super_admin`.
- `created_at`, `updated_at`.

Nota:

- No se seedearon perfiles porque dependen de usuarios reales en Supabase Auth.
- `super_admin` representa al admin global del sistema anterior y no requiere filas en `user_companies`.

### `user_companies`

Relaciona usuarios con empresas y roles cuando el permiso esta limitado a companias concretas.

Campos principales:

- `user_id`
- `company_id`
- `role`: `admin`, `operator`, `designer`, `viewer`.
- `created_at`

Constraint clave:

- Un usuario solo puede tener un rol por empresa: `unique(user_id, company_id)`.

### `locations`

Reemplaza las tablas de taquillas.

Campos principales:

- `company_id`
- `name`
- `device`
- `projection`
- `status`: `active`, `inactive`, `maintenance`, `archived`.
- `created_by`
- `created_at`, `updated_at`.

Constraint clave:

- Una empresa no puede tener dos ubicaciones con el mismo nombre.

### `campaigns`

Reemplaza las tablas de campanias.

Campos principales:

- `company_id`
- `name`
- `starts_on`
- `ends_on`
- `status`: `draft`, `active`, `inactive`, `archived`.
- `created_by`
- `created_at`, `updated_at`.

Constraints clave:

- `ends_on` no puede ser menor que `starts_on`.
- Nombre unico por empresa, ignorando mayusculas/minusculas.

### `campaign_locations`

Relaciona campanias con ubicaciones.

Campos principales:

- `company_id`
- `campaign_id`
- `location_id`
- `status`: `active`, `inactive`.
- `created_by`
- `created_at`, `updated_at`.

Constraints clave:

- Una campania solo puede asignarse una vez a la misma ubicacion.
- `campaign_id` y `location_id` deben pertenecer a la misma empresa.

### `screens`

Representa pantallas o players fisicos.

Campos principales:

- `company_id`
- `location_id`
- `name`
- `device_identifier`
- `status`: `active`, `inactive`, `maintenance`, `archived`.
- `last_seen_at`
- `metadata`
- `created_at`, `updated_at`.

Constraints clave:

- `device_identifier` es unico por empresa cuando existe.
- Si se asigna `location_id`, debe pertenecer a la misma empresa.

### `campaign_screens`

Permite asignar campanias directamente a pantallas.

Campos principales:

- `company_id`
- `campaign_id`
- `screen_id`
- `status`: `active`, `inactive`.
- `created_by`
- `created_at`, `updated_at`.

Constraints clave:

- Una campania solo puede asignarse una vez a la misma pantalla.
- `campaign_id` y `screen_id` deben pertenecer a la misma empresa.

### `media_files`

Guarda metadata de archivos almacenados en Supabase Storage.

Campos principales:

- `company_id`
- `campaign_id`
- `uploaded_by`
- `bucket`
- `storage_path`
- `category`
- `original_name`
- `mime_type`
- `size_bytes`
- `status`
- `created_at`, `updated_at`

Categorias:

- `blueprint`
- `template`
- `price`
- `campaign_media`
- `software`

Estados:

- `active`
- `archived`
- `deleted`

Nota:

- La migracion de Storage agrega `campaign_id` a `media_files`.
- `storage_path` usa el formato `company_id/campaign_id/file_id.ext`.
- `original_name` es solo metadata; no se usa para construir rutas.

## Timestamps

Todas las tablas operativas tienen:

- `created_at`
- `updated_at`

La migracion crea la funcion:

```sql
public.set_updated_at()
```

y triggers `before update` para mantener `updated_at`.

## Indices

La migracion agrega indices para:

- `company_id`
- `campaign_id`
- `location_id`
- `screen_id`
- `created_at`
- estados de entidades principales
- categorias de archivos

Tambien agrega unicidad funcional para:

```sql
company_id, lower(campaigns.name)
```

## Seed minimo

`supabase/seed.sql` crea:

- Empresas iniciales.
- Una ubicacion de prueba por empresa principal.
- Una campania draft de prueba por empresa principal.

No crea usuarios porque `profiles.id` depende de `auth.users.id`.

## Aplicacion en Supabase

Opcion manual:

1. Abrir Supabase SQL Editor.
2. Ejecutar `supabase/migrations/202606120001_initial_schema.sql`.
3. Ejecutar `supabase/seed.sql`.

Opcion con Supabase CLI:

```sh
supabase link --project-ref hlpgjwoeiykcditbwtvq
supabase db push
supabase db seed
```

## Verificacion cloud

Se verifico por REST que `public.companies` existe y responde en el proyecto Supabase:

```text
GET /rest/v1/companies?select=slug
HTTP 200
```

La respuesta observada fue `[]` con conteo `0`, por lo que el schema esta aplicado pero el seed no aparece cargado desde la publishable key.

Accion pendiente:

- Ejecutar o verificar `supabase/seed.sql` desde SQL Editor o Supabase CLI con acceso administrativo.

## Fuera de alcance

No se implementa en esta fase:

- Row Level Security.
- Politicas RLS.
- Storage buckets.
- Tipos TypeScript generados desde Supabase.
- Migracion de datos reales desde MySQL.
- Creacion de usuarios de Supabase Auth.

Estos puntos pertenecen a fases posteriores.
