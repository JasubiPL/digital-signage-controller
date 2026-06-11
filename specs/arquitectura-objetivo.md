# Arquitectura objetivo

## Contexto

El sistema actual es un monorepo con dos aplicaciones:

- `Interface/`: React, TypeScript, Vite, Tailwind y React Router.
- `Server/`: Node.js, Express, MySQL, Multer y filesystem local.

El proyecto ya no esta en produccion. La migracion no necesita mantener compatibilidad en caliente con MySQL ni con el servidor Express actual. La nueva version debe usar Next.js y Supabase cloud como backend principal.

## Objetivo de arquitectura

Construir una aplicacion Next.js que reemplace gradualmente a `Interface/` y `Server/`:

- UI y rutas privadas en Next.js App Router.
- Autenticacion con Supabase Auth.
- Autorizacion con Row Level Security en Supabase Postgres.
- Datos operativos en Supabase Postgres.
- Archivos en Supabase Storage.
- Sin dependencia de MySQL local.
- Sin dependencia de carpetas locales para archivos privados.
- Sin endpoints Express para los flujos migrados.

## Estructura de proyecto objetivo

La nueva aplicacion Next.js se creara en `App/`.

Estructura inicial:

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

Decision:

- `App/` sera la fuente de verdad nueva.
- `Interface/` y `Server/` se conservan como referencia durante la migracion.
- La limpieza o eliminacion de `Interface/` y `Server/` pertenece a Fase 12.
- El package manager objetivo para `App/` sera npm.

## Inventario actual del frontend

### Rutas principales

Actualmente `Interface/src/router/AppRouter.tsx` define:

- `/login`
- `/`
- `/admin/*`
- `/manager/*`
- `/designers/*`

Las rutas privadas se protegen con `PrivateRoutes`, que solo revisa el estado `logged` desde el contexto de autenticacion.

### Rutas por rol

Admin:

- `/admin/dashboard`
- `/admin/plantillas`
- `/admin/planos`
- `/admin/cotizaciones`
- `/admin/software`
- `/admin/taquillas/ETN`
- `/admin/taquillas/GHO`
- `/admin/taquillas/Costaline`
- `/admin/campanias/ETN`
- `/admin/campanias/GHO`
- `/admin/campanias/Costaline`

Manager:

- `/manager/dashboard`
- `/manager/plantillas`
- `/manager/planos`
- `/manager/cotizaciones`
- `/manager/documentacion`
- `/manager/taquillas/ETN`
- `/manager/taquillas/GHO`
- `/manager/taquillas/Costaline`
- `/manager/campanias/ETN`
- `/manager/campanias/GHO`
- `/manager/campanias/Costaline`

Designers:

- `/designers/plantillas`
- `/designers/planos`
- `/designers/taquillas/ETN`
- `/designers/taquillas/GHO`
- `/designers/taquillas/Costaline`
- `/designers/campanias/ETN`
- `/designers/campanias/GHO`
- `/designers/campanias/Costaline`

### Helpers actuales

Los helpers del frontend llaman directamente a `http://localhost:7000`:

- `getAllUsers.tsx`
- `getFiles.tsx`
- `uploadForm.tsx`
- `getInfoDB.tsx`
- `insertRowsDB.tsx`
- `editRowsDB.tsx`
- `deleteRowsDB.tsx`
- `deleteFiles.tsx`
- `boxOfficeCampaigns.tsx`

En la arquitectura objetivo estos helpers deben desaparecer o convertirse en funciones de dominio que usen:

- Supabase client para lecturas permitidas por RLS.
- Server Actions o Route Handlers para mutaciones que requieran validacion server-side.

## Inventario actual del backend

### Endpoints Express actuales

Usuarios:

- `GET /api/users/get-all`
- `POST /api/users/add-usuario`
- `POST /api/users/delete-usuario`
- `PUT /api/users/update-usuario`
- `POST /api/users/auth`

Taquillas:

- `GET /api/get-taquillas?company=...`
- `POST /api/add-taquilla?company=...`
- `PUT /api/edit-taquilla?company=...`
- `POST /api/delete-taquilla?company=...`

Campanias:

- `GET /api/get-campanias?company=...`
- `POST /api/add-campania?company=...`
- `PUT /api/edit-campania?company=...`
- `POST /api/delete-campania?company=...`

Relacion campania-taquilla:

- `POST /api/add-campanias-en-taquilla?company=...`
- `POST /api/query-campanias-en-taquilla?company=...`
- `POST /api/query-taquillas-en-campania?company=...`
- `PUT /api/edit-campanias-en-taquilla?company=...`
- `POST /api/delete-campanias-en-taquilla?company=...`

Archivos:

- `POST /api/save-blueprints?company=...`
- `POST /api/save-templates?company=...`
- `POST /api/save-price?company=...`
- `GET /api/search-blueprints?company=...`
- `GET /api/search-templates?company=...`
- `GET /api/search-price?company=...`
- `DELETE /api/delete-file?fileName=...`

### Problemas a corregir durante la migracion

- Login basado solo en email y `localStorage`.
- Rutas privadas protegidas solo por UI.
- Nombres de tabla generados con `company`.
- Carpetas de archivos generadas con `company`.
- Borrado de archivos con `fileName` como parte de la ruta.
- CORS abierto.
- URLs hardcodeadas a `localhost:7000`.
- MySQL conectado al importar el modulo de DB.
- Script SQL incompleto para usuarios.

## Inventario actual del modelo de datos

El script `Server/src/db/start_db.sql` define tablas separadas por compania:

- `taquillas_ETN`
- `taquillas_GHO`
- `taquillas_COSTA`
- `campanias_ETN`
- `campanias_GHO`
- `campanias_COSTA`
- `taquillas_campanias_ETN`
- `taquillas_campanias_GHO`
- `taquillas_campanias_COSTA`

El codigo tambien espera una tabla `usuarios`, pero el script SQL actual no la crea.

## Modelo objetivo

La arquitectura objetivo debe reemplazar tablas duplicadas por un modelo multiempresa normalizado.

Tablas base:

- `companies`
- `profiles`
- `user_companies`
- `locations`
- `campaigns`
- `campaign_locations`
- `media_files`
- `screens`

### `companies`

Representa una empresa o marca operativa.

Campos sugeridos:

- `id`
- `slug`
- `name`
- `status`
- `created_at`
- `updated_at`

Companias iniciales:

- `etn`
- `gho`
- `costaline`
- `iamsa`, solo si se confirma que debe existir como compania operativa.

### `profiles`

Extiende usuarios de Supabase Auth.

Campos sugeridos:

- `id`, igual a `auth.users.id`
- `full_name`
- `email`
- `avatar_url`
- `global_role`
- `created_at`
- `updated_at`

### `user_companies`

Define acceso por usuario y compania.

Campos sugeridos:

- `user_id`
- `company_id`
- `role`
- `created_at`

Roles sugeridos:

- `admin`
- `manager`
- `designer`
- `viewer`

### `locations`

Reemplaza las tablas `taquillas_*`.

Campos sugeridos:

- `id`
- `company_id`
- `name`
- `device`
- `projection`
- `status`
- `created_at`
- `updated_at`

### `campaigns`

Reemplaza las tablas `campanias_*`.

Campos sugeridos:

- `id`
- `company_id`
- `name`
- `starts_at`
- `ends_at`
- `status`
- `created_at`
- `updated_at`

### `campaign_locations`

Reemplaza las tablas `taquillas_campanias_*`.

Campos sugeridos:

- `campaign_id`
- `location_id`
- `status`
- `created_at`
- `updated_at`

Constraint recomendado:

- `unique(campaign_id, location_id)`

### `media_files`

Metadata de archivos almacenados en Supabase Storage.

Campos sugeridos:

- `id`
- `company_id`
- `uploaded_by`
- `bucket`
- `storage_path`
- `category`
- `original_name`
- `mime_type`
- `size_bytes`
- `status`
- `created_at`
- `updated_at`

Categorias iniciales:

- `blueprint`
- `template`
- `price`
- `campaign_media`, si se confirma contenido multimedia para reproduccion.
- `software`, si se conserva la seccion actual.

### `screens`

Representa pantallas o players fisicos.

Campos sugeridos:

- `id`
- `company_id`
- `location_id`
- `name`
- `device_identifier`
- `status`
- `last_seen_at`
- `created_at`
- `updated_at`

Esta tabla queda como objetivo, aunque puede implementarse despues del MVP si la administracion de pantallas no existe todavia como flujo real.

## Roles y permisos objetivo

El sistema viejo usa `area` para enviar usuarios a rutas como `admin`, `manager` y `designers`. La arquitectura objetivo separa esa idea en roles de permisos.

Mapeo inicial:

- `admin`: administrador.
- `manager`: operador.
- `designers`: disenador de contenido.
- `viewer`: visor de solo lectura.
- `player`: dispositivo o pantalla.

Los nombres finales de rol en base de datos deben ser estables y en minusculas.

### Admin

Puede:

- Administrar usuarios de sus companias.
- Crear, editar y borrar campanias.
- Crear, editar y borrar ubicaciones/taquillas.
- Subir y borrar archivos.
- Asignar campanias a ubicaciones.
- Ver todo dentro de sus companias.

### Operador

Puede:

- Ver dashboard.
- Ver plantillas, planos, cotizaciones y documentacion.
- Ver taquillas y campanias.
- Crear o editar operaciones del dia a dia solo si el requerimiento lo confirma.
- No debe administrar usuarios ni configuracion critica.

### Disenador de contenido

Puede:

- Ver plantillas.
- Ver planos.
- Ver campanias.
- Ver taquillas relacionadas.
- Subir archivos solo si se confirma como requerimiento nuevo.

### Visor

Puede:

- Leer contenido permitido.
- No puede modificar datos.

### Player/dispositivo

Representa una pantalla o dispositivo fisico.

Puede:

- Leer solo el contenido asignado a su compania, ubicacion o pantalla.
- Reportar estado basico como `last_seen_at`, si se implementa heartbeat.
- No puede acceder al panel administrativo.

Nota:

- `player` no necesariamente debe ser un usuario normal de Supabase Auth. Puede implementarse despues con tokens dedicados, claves por dispositivo o una tabla `screens` con credenciales controladas.

## Rutas objetivo en Next.js

Rutas publicas:

- `/login`

Rutas privadas:

- `/dashboard`
- `/files`
- `/files/templates`
- `/files/blueprints`
- `/files/prices`
- `/companies/[companySlug]/locations`
- `/companies/[companySlug]/campaigns`
- `/companies/[companySlug]/campaigns/[campaignId]`
- `/companies/[companySlug]/locations/[locationId]`
- `/users`
- `/settings`

Decision:

- Evitar rutas duplicadas por rol como `/admin/*`, `/manager/*` y `/designers/*`.
- Usar una sola estructura privada y mostrar acciones segun permisos.
- Mantener redirecciones temporales desde rutas antiguas solo si ayuda durante la migracion.

## Estrategia de backend en Next.js

Usar tres niveles:

1. Server Components para lecturas simples protegidas por sesion y RLS.
2. Server Actions para mutaciones de formularios.
3. Route Handlers para uploads, signed URLs o integraciones que requieran endpoint HTTP.

No se debe recrear un backend Express completo dentro de Next.js.

## Supabase Auth

La autenticacion objetivo sera Supabase Auth.

Decisiones:

- El login actual por email sin password queda descartado.
- La sesion debe vivir en cookies administradas por Supabase SSR.
- `localStorage` no debe ser fuente de verdad para autenticacion.
- `profiles` debe crearse para cada usuario autenticado.
- El rol debe resolverse desde `profiles` y `user_companies`.

## Supabase RLS

RLS debe estar activo en todas las tablas expuestas del schema publico.

Reglas base:

- Un usuario solo puede leer datos de companias en `user_companies`.
- Un usuario solo puede escribir si su rol lo permite.
- Nadie debe poder cambiar `company_id` para escalar privilegios.
- `service_role` solo debe usarse server-side y en casos estrictamente necesarios.

## Supabase Storage

Reemplaza a Multer y `Server/src/files`.

Buckets sugeridos:

- `company-files`
- `campaign-media`, si se separa contenido de reproduccion.

Path sugerido:

```text
{company_id}/{category}/{file_id}/{safe_filename}
```

Reglas:

- El path no debe construirse desde valores libres del usuario.
- El nombre original se guarda como metadata.
- El acceso debe resolverse por RLS y signed URLs si el bucket es privado.

## Decision sobre modo offline

Para esta fase no se implementa offline.

Decision inicial:

- El panel administrativo sera cloud-first.
- Las pantallas/dispositivos pueden requerir cache local en una fase posterior.
- Si se confirma reproduccion critica sin internet, se debe crear una especificacion separada para modo player/offline.

Documento futuro recomendado:

- `specs/player-offline.md`

## Estrategia de despliegue

Opcion recomendada inicial:

- Next.js en Vercel.
- Supabase cloud para Auth, Postgres y Storage.

Alternativas validas:

- Next.js en servidor propio con Node.js.
- Docker si se requiere desplegar en infraestructura controlada.

Decision inicial:

- No depender de un servidor Windows local para el panel administrativo.
- Mantener compatibilidad con usuarios en red local solo como requisito de acceso web, no como requisito de infraestructura.

## Vertical slice MVP

El primer corte implementable debe cubrir:

- Login con Supabase Auth.
- Perfil del usuario autenticado.
- Companias asignadas al usuario.
- Lista de campanias por compania.
- Crear campania.
- Lista de archivos por compania.
- Upload de archivo a Supabase Storage.
- RLS minimo para separar companias.

Este corte valida la arquitectura principal sin migrar todo el sistema de golpe.

## Fuera de alcance de Fase 1

No se implementa todavia:

- Creacion de la app Next.js.
- Migraciones SQL.
- RLS real.
- Upload a Supabase Storage.
- Migracion de componentes.
- Eliminacion de `Interface/` o `Server/`.
- PR o despliegue.

## Documentos derivados

Esta arquitectura deja pendientes estos documentos:

- `specs/modelo-datos.md`
- `specs/supabase-configuracion.md`
- `specs/rls-politicas.md`
- `specs/datos-iniciales.md`
- `specs/deployment.md`
- `specs/player-offline.md`, si se confirma necesidad offline.
