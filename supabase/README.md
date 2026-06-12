# Supabase

Esta carpeta contiene migraciones y seed data para la migracion a Supabase cloud.

## Archivos

- `migrations/202606120001_initial_schema.sql`: schema inicial normalizado.
- `seed.sql`: companias y datos minimos de desarrollo.

## Aplicacion manual

Mientras no este configurado Supabase CLI con acceso al proyecto, aplicar desde el SQL Editor de Supabase:

1. Ejecutar el contenido de `migrations/202606120001_initial_schema.sql`.
2. Ejecutar el contenido de `seed.sql`.

## Aplicacion con Supabase CLI

Cuando se configure Supabase CLI:

```sh
supabase link --project-ref hlpgjwoeiykcditbwtvq
supabase db push
supabase db seed
```

## Nota

RLS se implementara en la fase de autorizacion. Esta fase crea el modelo relacional, constraints, indices y triggers de timestamps.

