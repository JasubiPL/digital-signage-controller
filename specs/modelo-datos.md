# Modelo de datos

## Resumen

El sistema usa Supabase Postgres con tablas multiempresa normalizadas. Todas las
entidades operativas se relacionan con `companies` mediante `company_id`.

Archivos principales:

- `supabase/migrations/202606120001_initial_schema.sql`
- `supabase/migrations/202606120002_rls_policies.sql`
- `supabase/migrations/202606120003_storage.sql`
- `supabase/seed.sql`

## Entidades

### `companies`

Empresas o marcas operativas.

Campos principales:

- `id`
- `slug`
- `legacy_code`
- `name`
- `status`
- `created_at`
- `updated_at`

### `profiles`

Perfil local asociado a `auth.users`.

Campos principales:

- `id`
- `full_name`
- `email`
- `avatar_url`
- `global_role`
- `created_at`
- `updated_at`

`global_role = 'super_admin'` da acceso global.

### `user_companies`

Relaciona usuarios con empresas y roles por compania.

Roles:

- `admin`
- `operator`
- `designer`
- `viewer`

### `locations`

Ubicaciones, taquillas o puntos de reproduccion.

Campos principales:

- `company_id`
- `name`
- `device`
- `projection`
- `status`
- `created_by`

### `campaigns`

Campanias de contenido.

Campos principales:

- `company_id`
- `name`
- `starts_on`
- `ends_on`
- `status`
- `created_by`

Estados:

- `draft`
- `active`
- `inactive`
- `archived`

### `screens`

Pantallas o players fisicos.

Campos principales:

- `company_id`
- `location_id`
- `name`
- `device_identifier`
- `status`
- `last_seen_at`
- `metadata`

### `campaign_locations`

Asignaciones de campanias a ubicaciones.

### `campaign_screens`

Asignaciones de campanias a pantallas.

### `media_files`

Metadata de archivos guardados en Supabase Storage.

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

## Storage

Bucket:

```text
campaign-media
```

Path:

```text
company_id/campaign_id/file_id.ext
```

Los nombres originales no se usan como ruta; solo se guardan como metadata.

## Seed

`supabase/seed.sql` crea datos iniciales para:

- Empresas.
- Ubicaciones.
- Campanias.
- Pantallas.
- Asignaciones campania-ubicacion.
- Asignaciones campania-pantalla.

Los usuarios no se seedearon porque dependen de Supabase Auth.

## Aplicacion

Orden recomendado:

1. Ejecutar migraciones.
2. Ejecutar `supabase/seed.sql`.
3. Crear usuarios en Supabase Auth.
4. Asignar roles con una copia editada de `supabase/user-roles.example.sql`.
