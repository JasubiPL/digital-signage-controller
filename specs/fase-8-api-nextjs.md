# Fase 8: Migracion de API Express a Next.js

## Estado

Implementacion backend base completada para los modulos principales que antes
dependian de Express, MySQL y tablas dinamicas por empresa.

## Endpoints implementados

Todos los endpoints requieren sesion real de Supabase Auth y responden JSON.

Companias:

- `GET /api/companies`

Campanias:

- `GET /api/campaigns`
- `POST /api/campaigns`
- `GET /api/campaigns/:id`
- `PATCH /api/campaigns/:id`
- `DELETE /api/campaigns/:id`

Ubicaciones/taquillas:

- `GET /api/locations`
- `POST /api/locations`
- `GET /api/locations/:id`
- `PATCH /api/locations/:id`
- `DELETE /api/locations/:id`

Pantallas/dispositivos:

- `GET /api/screens`
- `POST /api/screens`
- `GET /api/screens/:id`
- `PATCH /api/screens/:id`
- `DELETE /api/screens/:id`

Asignaciones campania-ubicacion:

- `GET /api/campaign-locations`
- `POST /api/campaign-locations`
- `PATCH /api/campaign-locations/:id`
- `DELETE /api/campaign-locations/:id`

Asignaciones campania-pantalla:

- `GET /api/campaign-screens`
- `POST /api/campaign-screens`
- `PATCH /api/campaign-screens/:id`
- `DELETE /api/campaign-screens/:id`

Archivos:

- `POST /api/media`
- `GET /api/media/:id`
- `DELETE /api/media/:id`

## Helpers agregados

- `App/src/server/api/errors.ts`
- `App/src/server/api/requests.ts`
- `App/src/server/api/validation.ts`
- `App/src/server/api/supabase.ts`

Estos helpers centralizan:

- Errores JSON consistentes.
- Sesion requerida para APIs.
- Lectura segura de JSON.
- Validacion de UUIDs, slugs, fechas, enums y strings.
- Resolucion de compania por `companyId` o `companySlug`.
- Validacion de rol `admin` usando `has_company_role`.

## Reemplazos del Express viejo

- `getCampaign.js` queda cubierto por `GET /api/campaigns` y `GET /api/locations`.
- `insertRowsDB.js` queda cubierto por `POST /api/campaigns`, `POST /api/locations`, `POST /api/campaign-locations` y `POST /api/campaign-screens`.
- `updateRowsDB.js` queda cubierto por `PATCH` en recursos y asignaciones.
- `deleteRowsDB.js` queda cubierto por `DELETE` en recursos y asignaciones.
- `boxOfficeCampaigns.js` queda cubierto por filtros `campaignId`, `locationId`, `screenId`, `companyId` y `companySlug`.
- `saveFiles.js`, `getFiles.js` y `deleteFiles.js` quedan reemplazados por `api/media` y Supabase Storage.
- `usersManagement.js` no se migra como autenticacion propia: Supabase Auth reemplaza el login por JSON/email local. La administracion formal de usuarios queda para una UI/flujo admin posterior.

## Pendientes

- Conectar estos endpoints desde la nueva UI de Next.js.
- Probar mutaciones con un usuario `admin` real desde navegador.
- Definir si `operator` o `designer` tendran permisos de escritura en flujos concretos.
- Agregar logs persistentes si se requiere auditoria operativa.
