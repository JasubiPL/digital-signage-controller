# Decision: estructura del proyecto

## Estado

Aceptada para la migracion.

## Decision

Crear la nueva aplicacion Next.js en `App/`.

Mantener temporalmente:

- `Interface/` como referencia de UI y flujos existentes.
- `Server/` como referencia de endpoints, reglas de negocio y estructura de datos vieja.

## Contexto

El repositorio actual tiene esta estructura:

```text
digital-signage-controller/
  Interface/
  Server/
  run-services.bat
  specs/
```

La migracion no necesita mantener produccion activa ni compatibilidad en caliente. Aun asi, conservar el codigo viejo durante la migracion ayuda a comparar pantallas, helpers y endpoints.

## Opciones consideradas

### Reemplazar `Interface/` directamente

Ventajas:

- Menos carpetas.
- Ruta simple para la UI.

Desventajas:

- Mezcla codigo viejo de Vite con Next.js.
- Dificulta comparar el comportamiento existente.
- Aumenta riesgo de borrar contexto util.

### Crear `App/`

Ventajas:

- Aisla la implementacion nueva.
- Permite retirar `Interface/` y `Server/` al final.
- Evita mezclar Vite, React Router y Next.js App Router.
- Facilita trabajar por vertical slices.

Desventajas:

- Durante la migracion conviviran tres carpetas de aplicacion.
- El README tendra que aclarar cual es el flujo vigente.

### Usar `apps/web`

Ventajas:

- Estructura comun en monorepos modernos.
- Escala bien si aparecen mas apps.

Desventajas:

- Introduce una reorganizacion mayor antes de crear valor.
- Requiere decidir workspaces desde el principio.

## Estructura objetivo inicial

```text
digital-signage-controller/
  App/
    src/
      app/
      components/
      features/
      lib/
      server/
      styles/
  Interface/
  Server/
  specs/
```

## Regla de migracion

- `App/` es la fuente de verdad nueva.
- `Interface/` y `Server/` son referencia hasta Fase 12.
- No crear nuevas funcionalidades en `Interface/` ni `Server/`, salvo fixes necesarios para entender o migrar.
- Cuando `App/` cubra los flujos necesarios, retirar o archivar las carpetas legadas.

## Reconsideracion

Esta decision puede cambiar antes de crear la app si se decide adoptar workspaces desde el inicio.

