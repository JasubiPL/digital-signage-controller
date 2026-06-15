# Datos iniciales

## Estado

Fase 10 implementada como seed reproducible, aplicado en Supabase cloud y
proceso manual documentado.

Archivos:

- `supabase/seed.sql`
- `supabase/user-roles.example.sql`

## Decision sobre datos viejos

El repositorio incluye un seed limpio y representativo para probar el sistema en
Supabase cloud sin depender de datos externos.

## Seed incluido

`supabase/seed.sql` crea o actualiza datos idempotentes para:

- Empresas:
  - `etn`
  - `gho`
  - `costaline`
- Ubicaciones/taquillas:
  - 3 para ETN.
  - 3 para GHO.
  - 3 para Costaline.
  - Estatus operativos `ok`, `remodeling`, `pending_migration` e `incident`.
- Campanias:
  - 3 para ETN.
  - 3 para GHO.
  - 3 para Costaline.
- Pantallas/dispositivos:
  - 3 para ETN.
  - 2 para GHO.
  - 2 para Costaline.
- Asignaciones:
  - Campanias a ubicaciones.
  - Campanias a pantallas.

Las marcas activas del seed son las mismas que alimentan el routing interno:

```text
/dashboard/locations/etn
/dashboard/locations/gho
/dashboard/locations/costaline
/dashboard/campaigns/etn
/dashboard/campaigns/gho
/dashboard/campaigns/costaline
```

Si una base existente conserva `iamsa`, la migracion
`supabase/migrations/202606120004_brand_routing.sql` la deja como `archived`
para que no aparezca como marca navegable.

El seed usa `on conflict` para poder ejecutarse mas de una vez sin duplicar los
datos base.

## Usuarios iniciales

Los usuarios no se crean en `seed.sql` porque dependen de Supabase Auth y viven
en `auth.users`.

Proceso recomendado inicial:

1. En Supabase Dashboard, abrir `Authentication` > `Users`.
2. Crear usuarios con email y contrasena.
3. Confirmar el email desde el Dashboard.
4. Copiar `supabase/user-roles.example.sql`.
5. Reemplazar emails y nombres.
6. Ejecutar el SQL en Supabase SQL Editor.

Despues de tener al menos un super usuario, tambien se pueden crear y editar
usuarios desde `/dashboard/users`. Esta pantalla requiere configurar
`SUPABASE_SECRET_KEY` o `SUPABASE_SERVICE_ROLE_KEY` en la app, porque usa el API
admin de Supabase Auth para crear cuentas reales.

Roles sugeridos para pruebas:

- `super_admin`: super usuario con administracion completa.
- `user`: usuario consulta, solo lectura.

## Archivos de prueba

Los archivos reales no se seedearon desde SQL porque Supabase Storage requiere
subir objetos al bucket, no solo insertar metadata.

Se dejo un archivo inicial en Supabase Storage:

- Bucket: `campaign-media`
- Archivo visible: `sample-verano-etn.png`
- Campania: `Verano ETN 2026`
- Metadata: fila activa en `public.media_files`

Proceso recomendado:

1. Iniciar sesion en `/login` con un super usuario.
2. Entrar a `/dashboard/files`.
3. Seleccionar compania y campania.
4. Subir imagen valida menor a 50 MB.
5. Confirmar que aparece en la tabla.
6. Abrir `Ver` para probar signed URL.
7. Eliminar el archivo para confirmar limpieza de Storage y metadata.

Tipos permitidos:

- `image/jpeg`
- `image/png`
- `image/webp`
- `image/gif`
- `video/mp4`
- `video/webm`
- `application/pdf`

## Aplicacion manual

Desde Supabase SQL Editor:

1. Ejecutar migraciones si aun no estan aplicadas:
   - `supabase/migrations/202606120001_initial_schema.sql`
   - `supabase/migrations/202606120002_rls_policies.sql`
   - `supabase/migrations/202606120003_storage.sql`
   - `supabase/migrations/202606120004_brand_routing.sql`
   - `supabase/migrations/202606120005_location_operational_status.sql`
   - `supabase/migrations/202606150001_location_pending_migration_status.sql`
2. Ejecutar `supabase/seed.sql`.
3. Crear usuarios en Supabase Auth.
4. Ejecutar una copia editada de `supabase/user-roles.example.sql`.

## Aplicacion con CLI

Cuando Supabase CLI este configurado:

```sh
npm run supabase:link -- <tu-project-ref>
npm run supabase:push
npm run supabase:seed
```

Los usuarios de Auth y sus roles siguen siendo manuales porque requieren emails
reales y contrasenas reales.

## Verificacion

Seed aplicado en Supabase cloud con service key.

Conteos observados despues de aplicar datos iniciales:

- `companies` activas: 3
- `locations`: 9
- `campaigns`: 12
- `screens`: 7
- `campaign_locations`: 8
- `campaign_screens`: 6
- `media_files` activos: 1

Nota: `campaigns` tiene 12 porque existian campanias de prueba previas y el
seed ampliado agrego 9 campanias representativas nuevas.

Consultas rapidas en SQL Editor:

```sql
select slug, name, status
from public.companies
where status = 'active'
order by slug;
```

```sql
select c.slug, count(*) as locations
from public.locations l
join public.companies c on c.id = l.company_id
group by c.slug
order by c.slug;
```

```sql
select c.slug, count(*) as campaigns
from public.campaigns ca
join public.companies c on c.id = ca.company_id
group by c.slug
order by c.slug;
```

```sql
select c.slug, count(*) as screens
from public.screens s
join public.companies c on c.id = s.company_id
group by c.slug
order by c.slug;
```

Desde la app:

- `/dashboard` debe mostrar metricas con datos.
- `/dashboard/campaigns` debe listar campanias.
- `/dashboard/campaigns/etn` debe listar solo campanias de ETN.
- `/dashboard/campaigns/gho` debe listar solo campanias de GHO.
- `/dashboard/campaigns/costaline` debe listar solo campanias de Costaline.
- `/dashboard/locations` debe listar taquillas.
- `/dashboard/locations/etn` debe listar solo taquillas de ETN.
- `/dashboard/locations/gho` debe listar solo taquillas de GHO.
- `/dashboard/locations/costaline` debe listar solo taquillas de Costaline.
- `/dashboard/screens` debe listar pantallas.
- `/dashboard/assignments` debe listar asignaciones.
- `/dashboard/files` debe permitir subir un archivo con super usuario.
- `/dashboard/users` debe aparecer solo para `super_admin`.
- `/dashboard/users` debe permitir crear usuarios `super_admin` o `user` cuando existe service key.

## Pendientes

- Crear usuarios reales de prueba adicionales y asignar roles.
- Subir archivos reales adicionales desde la UI.
- Si aparecen datos historicos, crear un proceso separado de importacion.
