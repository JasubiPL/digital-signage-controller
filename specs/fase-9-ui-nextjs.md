# Fase 9: Migracion de interfaz

## Estado

Implementacion base completada en Next.js para los flujos principales del MVP.
Se hizo una segunda iteracion visual para acercar la UI al repo anterior antes
de cualquier rediseno mayor.

La UI nueva ya no depende de React Router, Vite, Axios ni endpoints hardcodeados
a `localhost:7000`. Usa App Router, Server Components, Server Actions, Supabase
Auth, RLS y Supabase Storage.

## Rutas implementadas

Layout privado:

- `App/src/app/dashboard/layout.tsx`

Dashboard:

- `GET /dashboard`

Paginas operativas:

- `GET /dashboard/campaigns`
- `GET /dashboard/locations`
- `GET /dashboard/screens`
- `GET /dashboard/assignments`
- `GET /dashboard/files`

## Componentes y helpers

- `App/src/app/dashboard/components.tsx`
- `App/src/app/dashboard/data.ts`
- `App/src/app/dashboard/actions.ts`

La UI usa componentes compartidos para:

- Encabezados.
- Paneles.
- Estados vacios.
- Mensajes de error/exito.
- Campos de formulario.
- Botones y badges de estado.

## Paridad visual con UI anterior

Se ajusto la interfaz para recuperar rasgos del sistema React/Vite:

- Sidebar fijo en desktop con ancho similar al `15%` anterior.
- Header blanco con saludo de usuario y avatar circular.
- Fondo gris claro para el area principal.
- Paneles blancos planos, sin tarjetas decorativas redondeadas.
- Titulos rojos y botones rojos.
- Navegacion lateral con hover gris y acento rojo.
- Tablas amplias, centradas y con divisores simples.
- Badges de estatus con colores similares a los estilos viejos.
- Dashboard con metricas tipo `BoxOfficeMetrix`: titulo rojo, numero grande y
  detalle lateral.

## Flujos disponibles

Dashboard:

- Metricas de campanias, ubicaciones, pantallas y archivos activos.
- Listado de companias disponibles segun permisos.
- Bootstrap de primer admin se conserva.

Campanias:

- Crear campania.
- Listar campanias por companias accesibles.
- Eliminar campania.

Ubicaciones/taquillas:

- Crear ubicacion.
- Listar ubicaciones por companias accesibles.
- Eliminar ubicacion.

Pantallas/dispositivos:

- Crear pantalla.
- Asociar pantalla opcionalmente a ubicacion.
- Listar pantallas.
- Eliminar pantalla.

Asignaciones:

- Asignar campania a ubicacion.
- Asignar campania a pantalla.
- Listar asignaciones.
- Eliminar asignaciones.

Archivos:

- Subir archivo a Supabase Storage.
- Guardar metadata en `media_files`.
- Listar archivos activos.
- Generar signed URLs para vista temporal.
- Marcar archivos como eliminados y remover objeto de Storage.

## Decisiones

- Se priorizo una UI operativa y sobria antes que redisenar visualmente.
- La UI debe mantenerse cercana al sistema anterior hasta validar paridad
  funcional con usuarios reales.
- Se usaron Server Actions para mutaciones basicas del dashboard.
- Las consultas de lectura se hacen server-side con Supabase y RLS.
- Los formularios mantienen controles familiares y no requieren estado cliente.
- La administracion formal de usuarios queda pendiente porque Supabase Auth ya
  reemplazo el login viejo por JSON local.

## Verificacion

Comandos ejecutados desde `App/`:

```sh
npm run lint
npm run typecheck
npm run build
```

Resultado:

- Lint paso.
- TypeScript paso.
- Build paso y genero rutas para `/dashboard`, `/dashboard/campaigns`,
  `/dashboard/locations`, `/dashboard/screens`, `/dashboard/assignments` y
  `/dashboard/files`.

Observacion:

- La validacion visual con Browser no pudo completarse en esta sesion porque el
  plugin fallo por restricciones del sandbox de Windows.
- Queda pendiente probar mutaciones desde navegador con una sesion real de admin.

## Pendientes

- Migrar UI de administracion formal de usuarios.
- Agregar estados `loading.tsx` por seccion si la experiencia lo requiere.
- Probar en navegador con usuario `admin` real.
- Ajustar permisos si se decide que `designer` pueda subir archivos.
