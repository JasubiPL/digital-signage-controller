# Digital Signage Controller App

Aplicacion Next.js para la migracion del panel de senalizacion digital.

## Stack

- Next.js con App Router.
- TypeScript.
- Tailwind CSS.
- ESLint.
- npm.

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

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` debe usarse solo en codigo server-side.

