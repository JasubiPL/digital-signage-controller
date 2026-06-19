# Digital Signage Controller

Panel web para administrar contenido de senalizacion digital. El proyecto usa
Next.js como aplicacion principal y Supabase como backend.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Row Level Security
- npm

## Estructura

```text
digital-signage-controller/
|- App/             # Aplicacion Next.js
|- supabase/        # Migraciones, seed y ejemplos SQL
|- specs/           # Documentacion tecnica vigente
|- CONTRIBUTING.md  # Guia para colaboradores
|- LICENSE
|- package.json     # Scripts de orquestacion y Supabase CLI
`- Readme.md
```

La raiz funciona como orquestador del proyecto. `App/` contiene el runtime web,
`supabase/` contiene infraestructura de base de datos y `specs/` documenta las
decisiones tecnicas vigentes del sistema.

## Requisitos

- Node.js
- npm
- Proyecto Supabase cloud
- Variables de entorno en `App/.env.local`

## Configuracion Local

1. Instala dependencias:

```sh
npm install
npm run install:app
```

2. Crea `App/.env.local` usando `App/.env.example` como base:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SECRET_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Variables recomendadas:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `SUPABASE_SECRET_KEY`

Compatibilidad:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` funciona como alias de publishable key.
- `SUPABASE_SERVICE_ROLE_KEY` funciona como alias de secret key.

No subas `.env.local` a Git.

## Supabase

La dependencia `supabase` del `package.json` raiz fija la version del Supabase
CLI usada por colaboradores. Las dependencias `@supabase/*` de `App/package.json`
son las librerias que usa la aplicacion Next.js en runtime.

Forma recomendada con Supabase CLI:

```sh
npx supabase link --project-ref <project-ref>
npx supabase db push
npx supabase db seed
```

Si prefieres usar Supabase SQL Editor, ejecuta los archivos en este orden:

1. `supabase/migrations/202606120001_initial_schema.sql`
2. `supabase/migrations/202606120002_rls_policies.sql`
3. `supabase/migrations/202606120003_storage.sql`
4. `supabase/migrations/202606120004_brand_routing.sql`
5. `supabase/migrations/202606120005_location_operational_status.sql`
6. `supabase/migrations/202606120006_two_global_roles.sql`
7. `supabase/migrations/202606130001_campaign_location_operational_status.sql`
8. `supabase/migrations/202606140001_manager_incidents.sql`
9. `supabase/migrations/202606140002_incident_note_replies.sql`
10. `supabase/migrations/202606150001_location_pending_migration_status.sql`
11. `supabase/migrations/202606180001_incident_multiple_locations.sql`
12. `supabase/migrations/202606180002_configurable_catalogs.sql`
13. `supabase/seed.sql`

Despues:

1. Crea usuarios en Supabase Auth o desde `/dashboard/users`.
2. Confirma sus emails.
3. En una instalacion nueva, el primer usuario puede reclamar el rol
   `super_admin` desde el flujo de onboarding.
4. En instalaciones existentes, usa el panel de usuarios o una copia editada de
   `supabase/user-roles.example.sql` para ajustar perfiles.

El seed crea companias, campanias, ubicaciones, pantallas y asignaciones de
prueba. Los usuarios no se seedearon porque dependen de `auth.users`. Las
migraciones tambien configuran Storage, RLS, incidentes, notas, adjuntos,
catalogos editables y el bootstrap del primer `super_admin`.

## Desarrollo

```sh
npm run dev
```

Abre:

```text
http://localhost:3000
```

## Validacion

```sh
npm run lint
npm run typecheck
npm run build
```

## Rutas

Publicas:

- `/`
- `/login`
- `/auth/callback`

Privadas:

- `/dashboard`
- `/dashboard/campaigns`
- `/dashboard/campaigns/[companySlug]`
- `/dashboard/locations`
- `/dashboard/locations/[companySlug]`
- `/dashboard/screens`
- `/dashboard/assignments`
- `/dashboard/incidents`
- `/dashboard/incidents/[incidentId]`
- `/dashboard/settings`
- `/dashboard/users`

APIs:

- `/api/health/supabase`
- `/api/companies`
- `/api/campaigns`
- `/api/campaigns/[id]`
- `/api/locations`
- `/api/locations/[id]`
- `/api/screens`
- `/api/screens/[id]`
- `/api/campaign-locations`
- `/api/campaign-locations/[id]`
- `/api/campaign-screens`
- `/api/campaign-screens/[id]`
- `/api/incidents`
- `/api/incident-notes`
- `/api/incident-notes/[id]`
- `/api/incident-attachments`
- `/api/incident-attachments/[id]`
- `/api/media`
- `/api/media/[id]`

## Roles

- `super_admin`: acceso global.
- `manager`: gestiona incidentes de companias activas.
- `user`: lectura de datos operativos activos.

Los permisos se aplican desde RLS en Supabase, no solo desde la UI. Los
catalogos de incidentes, prioridades y roles de compania se administran desde
`/dashboard/settings`.

## Archivos

Los archivos de campania viven en Supabase Storage:

- Bucket: `campaign-media`
- Tipo: privado
- Tamano maximo: 50 MB
- Path seguro: `company_id/campaign_id/file_id.ext`

La app genera signed URLs temporales para visualizar archivos.

## Documentacion

Documentos utiles:

- `specs/supabase-configuracion.md`
- `specs/modelo-datos.md`
- `specs/autenticacion.md`
- `specs/crear-admin-supabase.md`
- `specs/rls-politicas.md`
- `specs/storage-archivos.md`
- `specs/datos-iniciales.md`
- `specs/deployment.md`

Para contribuir, revisa tambien `CONTRIBUTING.md`.

## Troubleshooting

Verifica conexion publica:

```text
http://localhost:3000/api/health/supabase?probe=cloud
```

Verifica secret key server-side:

```text
http://localhost:3000/api/health/supabase?probe=admin
```

Si Next muestra una advertencia sobre lockfiles multiples, verifica que estas
ejecutando los comandos desde la raiz con los scripts de orquestacion o desde
`App/` solo cuando quieras trabajar directamente sobre la app. En este repo hay
dos lockfiles intencionales:

```text
package-lock.json       # Supabase CLI y scripts de raiz
App/package-lock.json
```
