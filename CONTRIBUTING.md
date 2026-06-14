# Contribuir

Gracias por querer mejorar Digital Signage Controller. Este proyecto esta
pensado para que otros desarrolladores puedan usarlo, estudiarlo y adaptarlo.

## Estructura del repositorio

- `App/`: aplicacion Next.js.
- `supabase/`: migraciones, seed data y ejemplos SQL.
- `specs/`: documentacion tecnica vigente del sistema.
- `package.json`: comandos de orquestacion para desarrollo y Supabase CLI.

## Preparar el entorno

Instala herramientas de raiz y dependencias de la app:

```sh
npm install
npm run install:app
```

Copia variables de entorno:

```sh
cp App/.env.example App/.env.local
```

Completa `App/.env.local` con tus credenciales de Supabase. No subas valores
reales de `.env.local` al repositorio.

## Desarrollo

Desde la raiz del repo:

```sh
npm run dev
```

Comandos utiles:

```sh
npm run lint
npm run typecheck
npm run build
```

## Supabase

La carpeta `supabase/` contiene los archivos que describen la base de datos.
Para enlazar tu propio proyecto:

```sh
npm run supabase:link -- <tu-project-ref>
```

Despues puedes aplicar cambios:

```sh
npm run supabase:push
npm run supabase:seed
```

Si no usas Supabase CLI, aplica los SQL desde el SQL Editor siguiendo
`supabase/README.md`.

## Pull requests

Antes de abrir un PR:

```sh
npm run lint
npm run typecheck
npm run build
```

Incluye una descripcion breve del cambio, screenshots si toca UI, y notas sobre
migraciones si cambia `supabase/`.

## Estilo

- Mantener cambios pequenos y enfocados.
- No subir secretos, credenciales ni dumps privados.
- Documentar decisiones nuevas en `specs/` cuando cambien reglas de negocio,
  modelo de datos, permisos o deployment.
