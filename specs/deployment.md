# Deployment

## Estado

Documento inicial para despliegue de la aplicacion Next.js + Supabase.

## Entorno activo

La aplicacion activa vive en:

```text
App/
```

## Variables requeridas

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=
SUPABASE_SECRET_KEY=
```

Compatibilidad:

```text
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Desarrollo local

```sh
npm install
npm run install:app
npm run dev
```

## Build de produccion

```sh
npm run build
npm run start
```

## Windows local/LAN

Para exponer en LAN durante desarrollo usa:

```sh
npm run dev -- --hostname 0.0.0.0
```

## Supabase

Antes de usar produccion:

1. Aplicar migraciones de `supabase/migrations`.
2. Ejecutar `supabase/seed.sql` si se requieren datos iniciales.
3. Crear usuarios en Supabase Auth.
4. Asignar roles con una copia editada de `supabase/user-roles.example.sql`.
5. Confirmar que Storage tenga el bucket `campaign-media`.

## Verificaciones previas

```sh
npm run lint
npm run typecheck
npm run build
```

## Pendientes

- Definir destino final de despliegue: Vercel, servidor propio o Windows local.
- Definir politica de backups de Supabase.
- Definir dominio y `NEXT_PUBLIC_SITE_URL` definitivo.
