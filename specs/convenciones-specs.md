# Convenciones para documentos en `specs/`

## Proposito

La carpeta `specs/` es la fuente de verdad para planes, decisiones tecnicas y documentos de arquitectura de la migracion.

## Nombres de archivos

Usar nombres en kebab-case, descriptivos y estables.

Ejemplos:

- `plan-migracion-nextjs-supabase.md`
- `arquitectura-objetivo.md`
- `decision-package-manager.md`
- `modelo-datos.md`
- `rls-politicas.md`

## Tipos de documentos

### Planes

Describen fases, checklist y criterios de salida.

Formato recomendado:

- Contexto.
- Objetivo.
- Checklist.
- Criterio de salida.
- Riesgos o notas.

### Decisiones

Documentan una decision tecnica y su razonamiento.

Formato recomendado:

- Estado.
- Decision.
- Contexto.
- Opciones consideradas.
- Consecuencias.
- Reversion o reconsideracion.

### Especificaciones

Describen arquitectura, datos, permisos, despliegue o flujos.

Formato recomendado:

- Contexto.
- Objetivo.
- Alcance.
- Diseno propuesto.
- Fuera de alcance.
- Pendientes.

## Checklists

Usar checkboxes Markdown:

- `[ ]` para pendiente.
- `[x]` para terminado.

Cuando una fase se completa, actualizar tambien el plan principal.

## Idioma y estilo

- Escribir en espanol.
- Mantener terminos tecnicos en ingles cuando sean nombres propios: Next.js, Supabase, Storage, Route Handler.
- Preferir ASCII en archivos nuevos para evitar problemas de encoding.
- Ser explicito con decisiones y evitar frases ambiguas como "ver despues" sin crear un pendiente.

## Relacion con codigo

Los documentos deben referenciar rutas reales del repo cuando sea util, por ejemplo:

- `Interface/src/router/AppRouter.tsx`
- `Server/src/routes/usersManagement.js`
- `Server/src/db/start_db.sql`

Los documentos no reemplazan tests ni migraciones. Sirven para guiar implementacion y revision.

