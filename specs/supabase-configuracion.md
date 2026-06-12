# Configuracion de Supabase cloud

## Estado

Implementacion publica lista y validada contra Supabase cloud. Pendiente cargar `SUPABASE_SECRET_KEY` o `SUPABASE_SERVICE_ROLE_KEY` si se necesita usar operaciones admin server-side.

## Dependencias instaladas

En `App/`:

```sh
npm install @supabase/supabase-js @supabase/ssr
```

Versiones instaladas:

- `@supabase/supabase-js`: `2.108.1`
- `@supabase/ssr`: `0.12.0`

## Variables de entorno

`App/.env.example` contiene:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SECRET_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Uso recomendado para proyectos nuevos de Supabase:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

Compatibilidad:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` se acepta como alias de publishable key.
- `SUPABASE_SERVICE_ROLE_KEY` se acepta como alias de secret key.

Reglas:

- Las variables `NEXT_PUBLIC_*` pueden usarse en cliente.
- `SUPABASE_SECRET_KEY` y `SUPABASE_SERVICE_ROLE_KEY` solo deben existir en server-side.
- No versionar `.env.local`.

Estado actual:

- `NEXT_PUBLIC_SUPABASE_URL`: configurada en `App/.env.local`.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: configurada en `App/.env.local`.
- `SUPABASE_SECRET_KEY` / `SUPABASE_SERVICE_ROLE_KEY`: pendiente.

## Archivos implementados

Clientes Supabase:

- `App/src/lib/supabase/browser.ts`
- `App/src/lib/supabase/server.ts`
- `App/src/server/supabase/admin.ts`

Configuracion de entorno:

- `App/src/lib/supabase/env.ts`
- `App/src/server/supabase/env.ts`

Ruta de validacion:

- `App/src/app/api/health/supabase/route.ts`

## Ruta de health

Endpoint de configuracion:

```text
GET /api/health/supabase
```

Endpoint de probe cloud explicito:

```text
GET /api/health/supabase?probe=cloud
```

Por defecto responde sin intentar conectar:

```json
{
  "service": "supabase",
  "configured": false,
  "connection": "not_requested"
}
```

Si se llama con `?probe=cloud` y la configuracion publica esta completa, intenta una llamada server-side al endpoint publico de Auth:

```text
GET {SUPABASE_URL}/auth/v1/settings
```

Si se llama con `?probe=admin` y la secret key esta configurada, intenta una llamada server-side con el cliente admin:

```ts
supabase.auth.admin.listUsers({ page: 1, perPage: 1 })
```

Esto valida conexion cloud sin exponer usuarios ni secretos en la respuesta.

## Pasos pendientes fuera del repo

1. Copiar la secret key cuando se requieran operaciones admin server-side.
2. Agregarla a `App/.env.local` como `SUPABASE_SECRET_KEY`.
3. Ejecutar:

```sh
npm run dev
curl http://localhost:3000/api/health/supabase?probe=admin
```

Resultado esperado de `?probe=admin` con secret key real:

```json
{
  "service": "supabase",
  "configured": true,
  "connection": "ok"
}
```

## Verificacion local realizada

Comandos ejecutados:

```sh
npm run lint
npm run typecheck
npm run build
npm run dev
curl http://localhost:3000/api/health/supabase
curl http://localhost:3000/api/health/supabase?probe=cloud
curl http://localhost:3000/api/health/supabase?probe=admin
```

Resultado:

- `npm run lint`: paso.
- `npm run typecheck`: paso.
- `npm run build`: paso.
- `GET /api/health/supabase`: respondio `200`.
- `GET /api/health/supabase?probe=cloud`: respondio `200`.

Respuesta anterior sin `.env.local`:

```json
{
  "service": "supabase",
  "configured": false,
  "connection": "not_requested",
  "browser": {
    "hasUrl": false,
    "hasPublishableKey": false
  },
  "server": {
    "hasSecretKey": false
  }
}
```

Respuesta anterior de `?probe=cloud` sin `.env.local`:

```json
{
  "service": "supabase",
  "configured": false,
  "connection": "skipped",
  "browser": {
    "hasUrl": false,
    "hasPublishableKey": false
  },
  "server": {
    "hasSecretKey": false
  }
}
```

Respuesta actual con URL y publishable key:

```json
{
  "service": "supabase",
  "configured": true,
  "connection": "ok",
  "status": 200,
  "browser": {
    "hasUrl": true,
    "hasPublishableKey": true
  },
  "server": {
    "hasSecretKey": false
  }
}
```

Respuesta actual de `?probe=admin` sin secret key:

```json
{
  "service": "supabase",
  "configured": true,
  "connection": "skipped",
  "browser": {
    "hasUrl": true,
    "hasPublishableKey": true
  },
  "server": {
    "hasSecretKey": false
  }
}
```

## Referencias

- Supabase recomienda `@supabase/ssr` para clientes SSR en Next.js.
- `@supabase/ssr` `0.12.0` recomienda `getAll` y `setAll` para manejo de cookies.
- Middleware para refresco de sesion se implementara en la fase de autenticacion real.
