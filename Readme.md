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
|- App/        # Aplicacion Next.js
|- supabase/   # Migraciones, seed y ejemplos SQL
|- specs/      # Documentacion tecnica vigente
|- Readme.md
`- run-services.bat
```

## Requisitos

- Node.js
- npm
- Proyecto Supabase cloud
- Variables de entorno en `App/.env.local`

## Configuracion Local

1. Instala dependencias:

```sh
cd App
npm install
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

Ejecuta en Supabase SQL Editor, en este orden:

1. `supabase/migrations/202606120001_initial_schema.sql`
2. `supabase/seed.sql`
3. `supabase/migrations/202606120002_rls_policies.sql`
4. `supabase/migrations/202606120003_storage.sql`

Despues:

1. Crea usuarios en Supabase Auth.
2. Confirma sus emails.
3. Usa una copia editada de `supabase/user-roles.example.sql` para asignar
   perfiles y roles.

El seed crea companias, campanias, ubicaciones, pantallas y asignaciones de
prueba. Los usuarios no se seedearon porque dependen de `auth.users`.

## Desarrollo

```sh
cd App
npm run dev
```

Abre:

```text
http://localhost:3000
```

En Windows tambien puedes ejecutar:

```text
run-services.bat
```

## Validacion

```sh
cd App
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
- `/dashboard/locations`
- `/dashboard/screens`
- `/dashboard/assignments`
- `/dashboard/files`

APIs:

- `/api/health/supabase`
- `/api/companies`
- `/api/campaigns`
- `/api/locations`
- `/api/screens`
- `/api/campaign-locations`
- `/api/campaign-screens`
- `/api/media`

## Roles

- `super_admin`: acceso global.
- `admin`: administra una compania.
- `operator`: lectura por compania.
- `designer`: lectura por compania.
- `viewer`: lectura por compania.

Los permisos se aplican desde RLS en Supabase, no solo desde la UI.

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
- `specs/rls-politicas.md`
- `specs/storage-archivos.md`
- `specs/datos-iniciales.md`
- `specs/deployment.md`

## Troubleshooting

Verifica conexion publica:

```text
http://localhost:3000/api/health/supabase?probe=cloud
```

Verifica secret key server-side:

```text
http://localhost:3000/api/health/supabase?probe=admin
```

Si Next muestra una advertencia sobre lockfiles multiples, confirma que solo
exista el lockfile activo en:

```text
App/package-lock.json
```
