# Digital Signage Controller App

Aplicación Next.js activa del panel de señalización digital.

## Stack

- Next.js con App Router.
- TypeScript.
- Tailwind CSS.
- ESLint.
- npm.
- Supabase Auth, Postgres, Storage y RLS.

## Comandos

Instalar dependencias:

```sh
npm install
```

Desarrollo:

```sh
npm run dev
```

Build:

```sh
npm run build
```

Lint:

```sh
npm run lint
```

Typecheck:

```sh
npm run typecheck
```

Produccion local:

```sh
npm run build
npm run start
```

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SECRET_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SECRET_KEY` y `SUPABASE_SERVICE_ROLE_KEY` deben usarse solo en codigo server-side.

## Rutas privadas

- `/dashboard`
- `/dashboard/campaigns`
- `/dashboard/locations`
- `/dashboard/screens`
- `/dashboard/assignments`
- `/dashboard/files`

