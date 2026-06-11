# Decision: package manager

## Estado

Aceptada para la migracion.

## Decision

Usar solo npm para la nueva aplicacion Next.js.

## Contexto

El repositorio actual mezcla gestores:

- `Interface/` tiene `yarn.lock` y `package-lock.json`.
- `Server/` tiene `package-lock.json`.
- El build de `Interface/` fue verificado previamente con `corepack yarn build`.
- `npm ci` en `Interface/` falla porque `package-lock.json` no esta sincronizado.
- `npm ci` en `Server/` funciona, pero `Server/` se considera legado a retirar.

Aunque `Interface/` tiene historial con Yarn, la migracion debe estandarizarse en npm para reducir mezcla de herramientas y dejar un flujo unico para desarrollo, CI y despliegue.

## Opciones consideradas

### Usar solo npm

Ventajas:

- `Server/` ya usa `package-lock.json`.
- Es el flujo mas comun en proyectos Node.
- Next.js funciona sin configuracion especial con npm.
- Facilita que el repo tenga un solo tipo de lock nuevo.

Desventajas:

- `Interface/` tiene un `package-lock.json` desincronizado.
- Puede requerir regenerar locks si se decide mantener temporalmente builds del codigo viejo.

### Descartar Yarn via Corepack

Ventajas:

- Coincide con el flujo que ya compilo la interfaz.
- Corepack evita depender de una instalacion global manual.

Desventajas:

- Requiere cuidar la version de Yarn usada por Corepack.
- Mantiene la mezcla actual de gestores.
- No cumple la decision de usar un solo gestor en la migracion.

## Consecuencias

- La nueva app Next.js debe usar npm.
- La nueva app Next.js debe generar y versionar `package-lock.json`.
- No se deben generar nuevos `yarn.lock` dentro de la nueva app.
- `Server/` puede conservar su `package-lock.json` mientras sea codigo legado.
- `Interface/yarn.lock` queda como artefacto legado hasta Fase 12 o hasta que se retire `Interface/`.
- La limpieza final de locks pertenece a Fase 12.

## Comandos objetivo

En la nueva app:

```sh
npm install
npm run dev
npm run build
npm run lint
```

## Reconsideracion

Esta decision puede cambiar si:

- El equipo decide desplegar con una plataforma que impone otro flujo.
- Se decide convertir el repo a un workspace distinto.
