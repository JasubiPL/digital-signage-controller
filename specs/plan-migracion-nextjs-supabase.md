# Plan de migracion a Next.js y Supabase

## Contexto

Este proyecto es una plataforma vieja de senalizacion digital que se quiere retomar y mejorar. Ya no esta en produccion, por lo que no se requiere una migracion en caliente ni mantener compatibilidad temporal con el sistema anterior en produccion.

El estado actual del repositorio es:

- `Interface/`: React + TypeScript + Vite.
- `Server/`: Node + Express + MySQL + Multer.
- No hay MySQL instalado localmente ni se planea depender de una base local.
- La nueva base de datos sera Supabase en la nube.
- La migracion debe corregir problemas conocidos de autenticacion, autorizacion, configuracion, manejo de archivos y modelo de datos.

## Objetivo

Migrar el sistema a una aplicacion moderna en Next.js con Supabase como backend principal:

- Next.js con App Router.
- Supabase Auth para autenticacion real.
- Supabase Postgres como base de datos.
- Supabase Storage para archivos multimedia.
- Row Level Security para autorizacion desde base de datos.
- Eliminacion gradual de `Server/` y MySQL.

## Principios de implementacion

- No migrar defectos de seguridad del sistema anterior.
- No usar tablas dinamicas por empresa.
- No usar `localStorage` como fuente de autenticacion.
- No guardar archivos en rutas construidas desde input del usuario.
- Mantener la interfaz funcional antes de hacer redisenos grandes.
- Trabajar por vertical slices: una funcion completa de punta a punta antes de migrar todo.
- Todo documento de planeacion, arquitectura o decisiones debe vivir dentro de `specs/`.

## Fase 0: Preparacion del repositorio

Objetivo: preparar el proyecto para una migracion ordenada.

Checklist:

- [x] Crear rama de trabajo `migracion-nextjs`.
- [x] Crear carpeta `specs/` en el root.
- [x] Guardar este plan en `specs/`.
- [x] Definir convencion para nuevos documentos tecnicos dentro de `specs/`.
- [x] Revisar scripts existentes de `Interface/` y `Server/`.
- [x] Elegir npm como package manager unico para el nuevo proyecto.
- [x] Decidir si se conserva el monorepo o si Next.js reemplaza `Interface/` y `Server/` desde una carpeta nueva.

Criterio de salida:

- Existe una rama de migracion.
- Existe una carpeta `specs/` con el plan inicial.
- Hay una decision documentada sobre la estructura inicial de la nueva app.

## Fase 1: Arquitectura objetivo

Objetivo: definir como quedara el sistema antes de implementar.

Checklist:

- [x] Inventariar pantallas actuales de `Interface/`.
- [x] Inventariar endpoints actuales de `Server/`.
- [x] Inventariar tablas esperadas del sistema anterior desde codigo y scripts SQL.
- [x] Definir roles del sistema:
  - Admin.
  - Operador.
  - Disenador de contenido.
  - Visor.
  - Player/dispositivo.
- [x] Definir companias validas y reglas multiempresa.
- [x] Definir entidades principales:
  - Empresas.
  - Usuarios/perfiles.
  - Campanas.
  - Archivos multimedia.
  - Taquillas o ubicaciones.
  - Pantallas/dispositivos.
  - Asignaciones de contenido.
- [x] Definir si las pantallas Windows requieren funcionamiento offline.
- [x] Definir estrategia de despliegue:
  - Vercel.
  - Servidor propio.
  - Docker.
  - Instalacion local/LAN.
- [x] Crear `specs/arquitectura-objetivo.md`.

Criterio de salida:

- Existe un documento de arquitectura con rutas, entidades, roles y decisiones base.

## Fase 2: Crear la aplicacion Next.js

Objetivo: levantar la base tecnica nueva sin depender del backend viejo.

Checklist:

- [ ] Crear app Next.js con TypeScript en `App/`.
- [ ] Usar App Router.
- [ ] Configurar ESLint y TypeScript estricto.
- [ ] Configurar aliases de imports.
- [ ] Definir estructura sugerida:
  - `src/app`
  - `src/components`
  - `src/features`
  - `src/lib`
  - `src/server`
  - `src/styles`
- [ ] Configurar variables de entorno:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Agregar `.env.example` sin secretos reales.
- [ ] Agregar scripts:
  - `dev`
  - `build`
  - `lint`
  - `typecheck`
- [ ] Verificar build inicial.

Criterio de salida:

- La app Next.js arranca y compila sin requerir MySQL ni Express.

## Fase 3: Configuracion de Supabase cloud

Objetivo: dejar listo el backend cloud.

Checklist:

- [ ] Crear proyecto en Supabase cloud.
- [ ] Configurar URL y anon key en `.env.local`.
- [ ] Guardar service role key solo en entorno server-side.
- [ ] Instalar dependencias de Supabase para Next.js.
- [ ] Crear clientes Supabase:
  - Cliente browser.
  - Cliente server con cookies.
  - Cliente admin server-only, si hace falta.
- [ ] Validar conexion desde una ruta de prueba server-side.
- [ ] Documentar configuracion en `specs/supabase-configuracion.md`.

Criterio de salida:

- Next.js puede conectarse a Supabase cloud desde servidor y cliente sin exponer secretos sensibles.

## Fase 4: Modelo de datos en Postgres

Objetivo: reemplazar el modelo MySQL por un schema PostgreSQL normalizado.

Checklist:

- [ ] Convertir tablas por empresa a tablas compartidas con `company_id`.
- [ ] Crear tabla `companies`.
- [ ] Crear tabla `profiles` relacionada con `auth.users`.
- [ ] Crear tabla `user_companies` para permisos multiempresa.
- [ ] Crear tabla `campaigns`.
- [ ] Crear tabla `media_files`.
- [ ] Crear tabla `locations` o `ticket_booths`.
- [ ] Crear tabla `screens` o `players`.
- [ ] Crear tabla de asignaciones entre campanas, pantallas y/o ubicaciones.
- [ ] Usar UUIDs como primary keys.
- [ ] Agregar `created_at` y `updated_at`.
- [ ] Agregar constraints para estados y tipos permitidos.
- [ ] Agregar indices para:
  - `company_id`.
  - `campaign_id`.
  - `created_at`.
  - `screen_id` o `location_id`.
- [ ] Crear migraciones SQL versionadas.
- [ ] Crear seed minimo de desarrollo.
- [ ] Documentar modelo en `specs/modelo-datos.md`.

Criterio de salida:

- El schema existe en Supabase cloud y puede reconstruirse desde migraciones versionadas.

## Fase 5: Autenticacion real

Objetivo: eliminar login solo por email y reemplazarlo por Supabase Auth.

Checklist:

- [ ] Activar proveedor email/password o magic link en Supabase.
- [ ] Crear pantalla `/login`.
- [ ] Crear flujo de logout real.
- [ ] Crear perfil automaticamente al crear usuario.
- [ ] Implementar proteccion de rutas privadas desde servidor.
- [ ] Quitar dependencia de `localStorage` para saber si el usuario esta autenticado.
- [ ] Crear layout privado para dashboard.
- [ ] Crear bootstrap del primer admin.
- [ ] Validar estados:
  - Usuario no autenticado.
  - Usuario autenticado sin perfil.
  - Usuario autenticado sin compania.
  - Usuario autenticado con permisos validos.

Criterio de salida:

- El acceso al sistema depende de una sesion real de Supabase, no de estado de UI.

## Fase 6: Autorizacion con RLS

Objetivo: proteger los datos desde la base de datos.

Checklist:

- [ ] Activar RLS en todas las tablas publicas del sistema.
- [ ] Crear politicas SELECT por compania.
- [ ] Crear politicas INSERT por rol.
- [ ] Crear politicas UPDATE por rol.
- [ ] Crear politicas DELETE por rol.
- [ ] Evitar que usuarios de una compania lean datos de otra.
- [ ] Evitar que operadores cambien `company_id`.
- [ ] Crear funciones SQL helper si simplifican politicas repetidas.
- [ ] Agregar indices para columnas usadas en politicas.
- [ ] Probar politicas con usuarios de distintos roles.
- [ ] Documentar politicas en `specs/rls-politicas.md`.

Criterio de salida:

- La seguridad no depende de ocultar botones en la UI; Supabase bloquea accesos indebidos.

## Fase 7: Manejo de archivos con Supabase Storage

Objetivo: reemplazar Multer y el filesystem local.

Checklist:

- [ ] Crear bucket `campaign-media`.
- [ ] Decidir si el bucket sera privado o publico.
- [ ] Definir limite maximo de archivo.
- [ ] Definir tipos MIME permitidos.
- [ ] Crear paths seguros:
  - `company_id/campaign_id/file_id.ext`
- [ ] Guardar metadata en `media_files`.
- [ ] Implementar upload desde Next.js.
- [ ] Implementar delete con validacion de permisos.
- [ ] Implementar signed URLs si el bucket es privado.
- [ ] Bloquear nombres de archivo usados como rutas.
- [ ] Probar archivos invalidos, grandes o con nombres maliciosos.

Criterio de salida:

- Los archivos viven en Supabase Storage y no existe path traversal por input de usuario.

## Fase 8: Migracion de API Express a Next.js

Objetivo: reemplazar endpoints de `Server/` con Route Handlers, Server Actions o consultas server-side.

Checklist:

- [ ] Migrar modulo de usuarios.
- [ ] Migrar modulo de campanas.
- [ ] Migrar modulo de archivos.
- [ ] Migrar modulo de taquillas/ubicaciones.
- [ ] Migrar modulo de pantallas/dispositivos.
- [ ] Centralizar validacion de payloads.
- [ ] Reemplazar SQL manual por Supabase client o funciones SQL controladas.
- [ ] Eliminar interpolacion de nombres de tabla.
- [ ] Crear formato consistente de errores.
- [ ] Agregar logs server-side para operaciones criticas.
- [ ] Identificar endpoints que ya no son necesarios por usar Supabase directo.

Criterio de salida:

- Los flujos principales funcionan sin arrancar Express ni tener MySQL.

## Fase 9: Migracion de interfaz

Objetivo: portar la UI actual de React/Vite a Next.js.

Checklist:

- [ ] Migrar layout principal.
- [ ] Migrar componentes compartidos.
- [ ] Migrar login.
- [ ] Migrar dashboard.
- [ ] Migrar usuarios.
- [ ] Migrar archivos.
- [ ] Migrar campanas.
- [ ] Migrar taquillas/ubicaciones.
- [ ] Migrar pantallas/dispositivos.
- [ ] Reemplazar llamadas hardcodeadas a `localhost:7000`.
- [ ] Separar componentes server/client correctamente.
- [ ] Agregar estados de loading.
- [ ] Agregar estados de error.
- [ ] Validar responsive basico.
- [ ] Mantener paridad funcional antes de redisenar.

Criterio de salida:

- La UI nueva permite completar los mismos flujos principales que el sistema viejo.

## Fase 10: Datos iniciales y migracion manual

Objetivo: poblar Supabase sin depender de MySQL local.

Checklist:

- [ ] Definir si existen dumps, capturas o datos viejos recuperables.
- [ ] Si no existen datos recuperables, crear seed limpio.
- [ ] Crear empresas iniciales.
- [ ] Crear usuarios iniciales en Supabase Auth.
- [ ] Crear perfiles y roles.
- [ ] Crear campanas de prueba.
- [ ] Subir archivos de prueba a Storage.
- [ ] Crear ubicaciones/pantallas de prueba.
- [ ] Documentar proceso en `specs/datos-iniciales.md`.

Criterio de salida:

- El sistema puede probarse en Supabase cloud con datos representativos.

## Fase 11: Testing y calidad

Objetivo: asegurar que la nueva base sea confiable antes de expandir.

Checklist:

- [ ] Agregar tests para validadores.
- [ ] Agregar tests para funciones server-side criticas.
- [ ] Agregar pruebas manuales de RLS.
- [ ] Agregar pruebas E2E para:
  - Login.
  - Crear campana.
  - Subir archivo.
  - Asignar contenido.
  - Eliminar archivo o campana.
- [ ] Ejecutar build.
- [ ] Ejecutar lint.
- [ ] Ejecutar typecheck.
- [ ] Revisar que no haya secrets en cliente.
- [ ] Revisar dependencias vulnerables.

Criterio de salida:

- La app compila, pasa validaciones y cubre los flujos de mayor riesgo.

## Fase 12: Limpieza del sistema anterior

Objetivo: retirar codigo viejo cuando ya no sea necesario.

Checklist:

- [ ] Confirmar que Next.js cubre los flujos requeridos.
- [ ] Marcar `Server/` como deprecated o eliminarlo.
- [ ] Marcar `Interface/` como deprecated o eliminarlo.
- [ ] Eliminar configuracion MySQL obsoleta.
- [ ] Eliminar dependencias vulnerables que ya no se usan.
- [ ] Actualizar README.
- [ ] Documentar comandos de desarrollo.
- [ ] Documentar proceso de despliegue.

Criterio de salida:

- El repo refleja la arquitectura nueva y no arrastra dependencias del sistema anterior.

## MVP recomendado

Para reducir riesgo, el primer corte implementable deberia ser:

- Login con Supabase Auth.
- Empresas y perfiles.
- RLS basico por compania.
- CRUD minimo de campanas.
- Upload de un archivo a Supabase Storage.
- Visualizacion de campanas desde una pantalla protegida.

Este MVP prueba lo mas importante: autenticacion, autorizacion, base de datos, archivos y UI en Next.js.

## Documentos esperados en `specs/`

- [x] `plan-migracion-nextjs-supabase.md`
- [x] `fase-0-preparacion.md`
- [x] `convenciones-specs.md`
- [x] `arquitectura-objetivo.md`
- [ ] `modelo-datos.md`
- [ ] `supabase-configuracion.md`
- [ ] `rls-politicas.md`
- [ ] `datos-iniciales.md`
- [x] `decision-package-manager.md`
- [x] `decision-estructura-proyecto.md`
- [ ] `deployment.md`
