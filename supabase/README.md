# Supabase

Esta carpeta contiene migraciones, seed data y ejemplos SQL para Supabase cloud.

## Archivos

- `migrations/202606120001_initial_schema.sql`: schema inicial normalizado.
- `migrations/202606120002_rls_policies.sql`: funciones helper y politicas RLS.
- `migrations/202606120003_storage.sql`: bucket privado `campaign-media` y politicas de Storage.
- `migrations/202606120004_brand_routing.sql`: alinea marcas activas con rutas por marca.
- `migrations/202606120005_location_operational_status.sql`: alinea estatus operativos de taquillas.
- `migrations/202606120006_two_global_roles.sql`: simplifica permisos a `super_admin` y `user`.
- `migrations/202606140001_manager_incidents.sql`: agrega rol `manager`, incidentes de taquillas y bucket privado `incident-images`.
- `migrations/202606150001_location_pending_migration_status.sql`: agrega el estatus `Pendiente de migrar` para taquillas.
- `seed.sql`: companias, ubicaciones, campanias, pantallas y asignaciones de desarrollo.
- `user-roles.example.sql`: ejemplo para relacionar usuarios reales de Supabase Auth con perfiles y roles.

## Aplicacion manual

Mientras no este configurado Supabase CLI con acceso al proyecto, aplicar desde el SQL Editor de Supabase:

1. Ejecutar el contenido de `migrations/202606120001_initial_schema.sql`.
2. Ejecutar el contenido de `seed.sql`.
3. Ejecutar el contenido de `migrations/202606120002_rls_policies.sql`.
4. Ejecutar el contenido de `migrations/202606120003_storage.sql`.
5. Ejecutar el contenido de `migrations/202606120004_brand_routing.sql`.
6. Ejecutar el contenido de `migrations/202606120005_location_operational_status.sql`.
7. Ejecutar el contenido de `migrations/202606120006_two_global_roles.sql`.
8. Ejecutar el contenido de `migrations/202606140001_manager_incidents.sql`.
9. Ejecutar el contenido de `migrations/202606150001_location_pending_migration_status.sql`.
10. Crear usuarios en Supabase Auth y ejecutar una copia editada de `user-roles.example.sql`.

## Aplicacion con Supabase CLI

Cuando se configure Supabase CLI, enlaza tu propio proyecto Supabase:

```sh
npm run supabase:link -- <tu-project-ref>
npm run supabase:push
npm run supabase:seed
```

No publiques credenciales ni project refs privados si tu instancia no debe ser
publica. Cada desarrollador puede enlazar su propio proyecto cloud o local.

## Nota

RLS queda implementado en la segunda migracion, simplificado en la sexta y ampliado para `manager` e incidentes en la migracion de incidentes. Storage queda implementado en la tercera migracion para campanias y en la migracion de incidentes para evidencia privada. La cuarta migracion deja activas solo las marcas operativas que alimentan el routing por marca. La quinta ajusta los estatus de taquillas al listado operativo y la migracion de estatus pendiente agrega `Pendiente de migrar`. Despues de aplicarlas, probar con usuarios reales de los tres roles como se describe en `specs/rls-politicas.md` y `specs/storage-archivos.md`.

La gestion de usuarios desde `/dashboard/users` no requiere una tabla nueva:
usa `auth.users` y `public.profiles`. Para crear usuarios desde la app se debe
configurar `SUPABASE_SECRET_KEY` o `SUPABASE_SERVICE_ROLE_KEY` en Next.js.
