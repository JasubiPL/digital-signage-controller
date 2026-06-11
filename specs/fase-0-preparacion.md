# Fase 0: Preparacion del repositorio

## Estado

Fase completada.

## Alcance

Esta fase prepara el repositorio para iniciar la migracion a Next.js y Supabase cloud sin depender de MySQL local ni del servidor Express anterior.

## Resultado

- Rama de trabajo: `migracion-nextjs`.
- Carpeta de especificaciones: `specs/`.
- Plan principal: `specs/plan-migracion-nextjs-supabase.md`.
- Convenciones de documentacion: `specs/convenciones-specs.md`.
- Decision de package manager: `specs/decision-package-manager.md`.
- Decision de estructura de proyecto: `specs/decision-estructura-proyecto.md`.

## Revision de scripts existentes

### `Interface/`

Scripts actuales:

- `dev`: inicia Vite.
- `build`: ejecuta `tsc && vite build`.
- `lint`: ejecuta ESLint.
- `preview`: sirve el build de Vite.
- `start`: alias de `vite preview`.

Observaciones:

- Hay `yarn.lock` y `package-lock.json` en la misma carpeta.
- El build verificado previamente funciono con `corepack yarn build`.
- `npm ci` en `Interface/` no es confiable porque el lock de npm no esta sincronizado.
- `Interface/` se considera legado durante la migracion, por lo que su mezcla de locks no debe definir el flujo nuevo.

### `Server/`

Scripts actuales:

- `dev`: inicia Express con `node --watch src/index.js`.
- `test`: placeholder que falla.

Observaciones:

- Tiene `package-lock.json` y flujo npm.
- `npm ci` funciono previamente.
- El servidor no arranca limpio sin MySQL configurado porque la conexion a DB se resuelve al importar el modulo.
- `Server/` se considera codigo legado a retirar cuando Next.js y Supabase cubran los flujos necesarios.

## Decisiones cerradas

- Mantener `Interface/` y `Server/` como referencia durante la migracion.
- Crear la nueva aplicacion Next.js en una carpeta nueva `App/`.
- Usar solo npm para la nueva aplicacion.
- Generar `package-lock.json` para `App/`.
- No generar `yarn.lock` en `App/`.
- Usar Supabase cloud desde el inicio.
- No instalar ni requerir MySQL local.
- Guardar toda documentacion tecnica nueva dentro de `specs/`.

## Criterio de salida

- Existe rama de migracion.
- Existe carpeta `specs/`.
- Existe plan de migracion.
- Existen decisiones documentadas para package manager y estructura.
- La Fase 1 puede apoyarse en estas decisiones.
