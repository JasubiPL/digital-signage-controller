# Manejo de archivos con Supabase Storage

## Estado

Storage esta implementado en codigo y migraciones.

Archivos principales:

- `supabase/migrations/202606120003_storage.sql`
- `App/src/server/media/storage.ts`
- `App/src/app/api/media/route.ts`
- `App/src/app/api/media/[id]/route.ts`

La configuracion ya fue aplicada en Supabase cloud y se valido Storage con una prueba
server-side reversible. Queda pendiente probar el flujo completo desde UI con un
usuario autenticado y casos de rechazo.

## Decision de bucket

Bucket:

```text
campaign-media
```

Tipo:

```text
privado
```

Motivo:

- Los archivos pueden pertenecer a companias distintas.
- El acceso debe resolverse por RLS y signed URLs.
- No se exponen URLs publicas permanentes.

## Limites

Tamano maximo:

```text
50 MB
```

Tipos MIME permitidos:

- `image/jpeg`
- `image/png`
- `image/webp`
- `image/gif`
- `video/mp4`
- `video/webm`
- `application/pdf`

## Paths seguros

Formato:

```text
company_id/campaign_id/file_id.ext
```

Ejemplo:

```text
4e0d.../7d2a.../9d9c....mp4
```

Reglas:

- `company_id` debe ser UUID valido.
- `campaign_id` debe ser UUID valido.
- `file_id` lo genera el servidor con UUID.
- La extension se deriva del MIME permitido.
- El nombre original del usuario nunca se usa como ruta.
- El nombre original solo se guarda como metadata en `media_files.original_name`.

Esto bloquea path traversal porque inputs como `../`, rutas absolutas o nombres con separadores no participan en `storage_path`.

## Metadata

La tabla `media_files` guarda:

- `company_id`
- `campaign_id`
- `uploaded_by`
- `bucket`
- `storage_path`
- `category = 'campaign_media'`
- `original_name`
- `mime_type`
- `size_bytes`
- `status`

La configuracion de Storage agrega `campaign_id` a `media_files` para poder filtrar archivos por campania sin depender de parsear paths.

## Endpoints

### Upload

```text
POST /api/media
```

Formato:

```text
multipart/form-data
```

Campos:

- `file`
- `companyId` o `company_id`
- `campaignId` o `campaign_id`

Validaciones:

- Usuario autenticado.
- `companyId` y `campaignId` son UUID.
- La campania pertenece a la compania.
- El usuario es `super_admin` o `admin` de la compania.
- MIME permitido.
- Tamano menor o igual a 50 MB.

Resultado:

- Sube el archivo a Supabase Storage.
- Inserta metadata en `media_files`.
- Si falla el insert de metadata, borra el objeto subido para evitar basura.

### Signed URL

```text
GET /api/media/:id
```

Validaciones:

- Usuario autenticado.
- El usuario puede leer el archivo por RLS.
- El archivo esta activo.
- El bucket es `campaign-media`.

Resultado:

- Devuelve una URL firmada con expiracion de 5 minutos.

### Delete

```text
DELETE /api/media/:id
```

Validaciones:

- Usuario autenticado.
- El usuario es `super_admin` o `admin` de la compania del archivo.
- El archivo no esta marcado como `deleted`.

Resultado:

- Borra el objeto de Supabase Storage.
- Marca `media_files.status = 'deleted'`.

## Politicas Storage

La configuracion crea politicas sobre `storage.objects` para el bucket `campaign-media`:

- `SELECT`: `super_admin`, `admin`, `operator`, `designer`, `viewer` de la compania del path.
- `INSERT`: `super_admin` o `admin`.
- `UPDATE`: `super_admin` o `admin`.
- `DELETE`: `super_admin` o `admin`.

La compania se obtiene con:

```sql
public.storage_company_id(name)
```

La funcion lee el primer segmento del path y lo convierte a UUID de forma segura. Si el path no tiene UUID valido, retorna `null` y las politicas no autorizan acceso.

## Pruebas manuales recomendadas

Probar con usuario `admin`:

- Subir imagen valida.
- Subir video valido menor a 50 MB.
- Pedir signed URL de archivo activo.
- Borrar archivo propio o de su compania.

Probar rechazos:

- Archivo sin sesion.
- Usuario `viewer` intentando subir.
- Usuario `operator` intentando borrar.
- MIME no permitido, por ejemplo `.exe`.
- Archivo mayor a 50 MB.
- Nombre malicioso como `../../x.png`.
- `companyId` o `campaignId` no UUID.
- `campaignId` de otra compania.

## Pendientes

- Probar upload desde UI con sesion real.
- Probar archivos reales.
- Probar archivos invalidos, grandes o con nombres maliciosos.
- Definir en Fase 7/8 si `designer` puede subir contenido de campania.
- Crear UI para administrar archivos desde el dashboard.

## Verificacion cloud realizada

Se valido contra Supabase cloud:

- `SUPABASE_SECRET_KEY` configurada y endpoint `?probe=admin` en estado `ok`.
- Bucket privado `campaign-media` existente.
- Limite de bucket en `50 MB`.
- Upload de PNG minimo en path seguro `company_id/campaign_id/file_id.png`.
- Insert temporal en `media_files`.
- Generacion de signed URL.
- Lectura exitosa del archivo firmado.
- Limpieza de la fila temporal y del objeto de Storage.

En Fase 10 se dejo ademas un archivo activo de ejemplo:

- `sample-verano-etn.png`
- Asociado a la campania `Verano ETN 2026`.
- Visible desde `/dashboard/files` para usuarios con acceso.
