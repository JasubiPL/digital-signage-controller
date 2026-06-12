# Supabase

Esta carpeta contiene migraciones y seed data para la migracion a Supabase cloud.

## Archivos

- `migrations/202606120001_initial_schema.sql`: schema inicial normalizado.
- `migrations/202606120002_rls_policies.sql`: funciones helper y politicas RLS.
- `migrations/202606120003_storage.sql`: bucket privado `campaign-media` y politicas de Storage.
- `seed.sql`: companias y datos minimos de desarrollo.

## Aplicacion manual

Mientras no este configurado Supabase CLI con acceso al proyecto, aplicar desde el SQL Editor de Supabase:

1. Ejecutar el contenido de `migrations/202606120001_initial_schema.sql`.
2. Ejecutar el contenido de `seed.sql`.
3. Ejecutar el contenido de `migrations/202606120002_rls_policies.sql`.
4. Ejecutar el contenido de `migrations/202606120003_storage.sql`.

## Aplicacion con Supabase CLI

Cuando se configure Supabase CLI:

```sh
supabase link --project-ref hlpgjwoeiykcditbwtvq
supabase db push
supabase db seed
```

## Nota

RLS queda implementado en la segunda migracion. Storage queda implementado en la tercera migracion. Despues de aplicarlas, probar con usuarios reales de distintos roles como se describe en `specs/rls-politicas.md` y `specs/storage-archivos.md`.
