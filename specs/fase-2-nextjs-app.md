# Fase 2: Aplicacion Next.js

## Estado

Fase completada.

## Resultado

Se creo la nueva aplicacion Next.js en `App/`.

Configuracion base:

- Next.js `16.2.9`.
- React `19.2.4`.
- TypeScript.
- App Router.
- `src/` directory.
- Tailwind CSS.
- ESLint.
- npm como unico gestor de paquetes para la app nueva.
- Alias `@/*` hacia `src/*`.

## Estructura creada

```text
App/
  src/
    app/
    components/
    features/
    lib/
    server/
    styles/
```

## Variables de entorno

Se agrego `App/.env.example` con:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Notas:

- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` son publicas para el cliente.
- `SUPABASE_SERVICE_ROLE_KEY` debe usarse solo server-side.
- `App/.gitignore` permite versionar `.env.example`, pero mantiene ignorados los `.env` reales.

## Scripts

Scripts disponibles en `App/package.json`:

```sh
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```

## Pantalla inicial

Se reemplazo la plantilla inicial de Next.js por una pantalla base del proyecto:

- Nombre del sistema.
- Contexto de migracion Next.js + Supabase.
- Tarjetas de arquitectura inicial: App Router, Supabase y npm.

## Verificacion

Comandos ejecutados:

```sh
npm run lint
npm run typecheck
npm run build
npm run dev
curl -I http://localhost:3000
```

Resultado:

- `npm run lint`: paso.
- `npm run typecheck`: paso.
- `npm run build`: paso.
- `npm run dev`: levanto en `http://localhost:3000`.
- `curl -I http://localhost:3000`: devolvio `HTTP/1.1 200 OK`.
- `curl http://localhost:3000`: confirmo el texto `Digital Signage Controller` y `Migracion Next.js + Supabase`.

Nota:

- El primer intento de `npm run build` fallo dentro del sandbox porque Turbopack necesito crear un proceso interno y hacer bind a un puerto. Se repitio con permisos elevados y compilo correctamente.
- La herramienta Browser no estuvo disponible como callable en esta sesion; se uso verificacion HTTP local como respaldo.

## Observaciones

- `create-next-app` reporto 2 vulnerabilidades moderadas al instalar dependencias. No se aplico `npm audit fix --force` porque puede introducir cambios mayores; se revisara en una fase de seguridad/dependencias.
- `Interface/` y `Server/` siguen existiendo como referencia legada.
- La siguiente fase es configurar Supabase cloud y los clientes de Supabase en Next.js.
