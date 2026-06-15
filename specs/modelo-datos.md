# Modelo de datos

## Resumen

El sistema usa Supabase Postgres con tablas multiempresa normalizadas. Todas las
entidades operativas se relacionan con `companies` mediante `company_id`.

Archivos principales:

- `supabase/migrations/202606120001_initial_schema.sql`
- `supabase/migrations/202606120002_rls_policies.sql`
- `supabase/migrations/202606120003_storage.sql`
- `supabase/migrations/202606140001_manager_incidents.sql`
- `supabase/seed.sql`

## Entidades

### `companies`

Empresas o marcas operativas.

La navegacion interna por marca se resuelve desde esta tabla. Solo las
companias con `status = 'active'` deben aparecer como marcas navegables en el
sidebar. El campo `slug` es parte del contrato de routing y se usa en rutas
como:

```text
/dashboard/locations/[companySlug]
/dashboard/campaigns/[companySlug]
```

Ejemplos de slugs activos esperados:

- `etn`
- `gho`
- `costaline`

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

Roles globales:

- `super_admin`: super usuario con administracion completa.
- `manager`: consulta datos activos y puede comentar incidentes.
- `user`: consultor, solo lectura general sin acceso a incidentes.

La migracion `202606120006_two_global_roles.sql` elimina el modelo de roles por
compania. Las marcas visibles se resuelven desde `companies` activas para ambos
roles de consulta. La migracion `202606140001_manager_incidents.sql` agrega
`manager` y mantiene a `super_admin` como unico rol con escritura general.

### `locations`

Ubicaciones, taquillas o puntos de reproduccion.

Campos principales:

- `company_id`
- `name`
- `device`
- `projection`
- `status`
- `created_by`

Estados operativos:

- `ok`: se muestra como `OK`.
- `remodeling`: se muestra como `Remodelacion`.
- `incident`: se muestra como `Pantalla con incidente`.
- `archived`: oculto/retirado operativo.

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

### `location_incidents`

Incidentes operativos por taquilla.

Campos principales:

- `company_id`
- `location_id`
- `title`
- `description`
- `category`
- `priority`
- `status`
- `assignee_name`
- `reported_by`
- `resolved_by`
- `opened_at`
- `resolved_at`
- `resolution_summary`

Estados:

- `open`
- `in_progress`
- `waiting`
- `resolved`
- `canceled`

### `location_incident_notes`

Historial y comentarios de seguimiento para incidentes.

Campos principales:

- `incident_id`
- `company_id`
- `location_id`
- `author_id`
- `body`
- `event_type`

### `location_incident_attachments`

Imagenes privadas de evidencia asociadas a un incidente o comentario.

Campos principales:

- `incident_id`
- `note_id`
- `company_id`
- `location_id`
- `uploaded_by`
- `bucket`
- `storage_path`
- `original_name`
- `mime_type`
- `size_bytes`
- `caption`
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
