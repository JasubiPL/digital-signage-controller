# Autenticacion

## Estado

Implementacion base completada en Next.js con Supabase Auth. Pendiente confirmar en Supabase Dashboard que los proveedores deseados estan activos.

## Archivos implementados

Rutas:

- `App/src/app/login/page.tsx`
- `App/src/app/login/actions.ts`
- `App/src/app/auth/callback/route.ts`
- `App/src/app/logout/route.ts`
- `App/src/app/dashboard/layout.tsx`
- `App/src/app/dashboard/page.tsx`
- `App/src/proxy.ts`

Helpers:

- `App/src/lib/auth/redirect.ts`
- `App/src/server/auth/session.ts`
- `App/src/server/auth/bootstrap.ts`

## Flujos soportados

### Login con password

Formulario en `/login`.

Accion:

```ts
supabase.auth.signInWithPassword()
```

### Registro con password

Formulario en `/login`.

Accion:

```ts
supabase.auth.signUp()
```

### Magic link

Formulario en `/login`.

Accion:

```ts
supabase.auth.signInWithOtp()
```

Callback:

```text
GET /auth/callback
```

La ruta intercambia `code` por sesion con:

```ts
supabase.auth.exchangeCodeForSession(code)
```

### Logout

Ruta:

```text
POST /logout
```

Accion:

```ts
supabase.auth.signOut()
```

## Proteccion server-side

Next.js 16 usa `proxy.ts` para checks tempranos.

Rutas protegidas:

- `/dashboard`

Comportamiento:

- Usuario sin sesion en `/dashboard` se redirige a `/login?next=/dashboard`.
- Usuario autenticado en `/login` se redirige a `/dashboard`.
- El proxy usa `@supabase/ssr` para refrescar cookies de sesion.

## Perfil automatico

Al entrar al dashboard, la app ejecuta `ensureProfile()`.

Si el usuario existe en Supabase Auth pero no en `public.profiles`, se crea o actualiza:

- `id`
- `email`
- `full_name`
- `avatar_url`
- `global_role`

## Bootstrap del primer admin

El dashboard permite crear el primer admin solo cuando:

- El usuario esta autenticado.
- El perfil existe o puede crearse.
- Existe al menos una compania.
- No existe ningun registro en `user_companies`.

Accion:

```ts
bootstrapFirstAdmin()
```

Resultado:

- Inserta al usuario actual en `user_companies` con rol `admin`.
- Usa la primera compania activa por `slug`.
- Despues del primer registro, el bootstrap deja de estar disponible.

## Estados validados en UI

El dashboard contempla:

- Usuario no autenticado: redireccion a login.
- Usuario autenticado sin perfil: intenta crearlo y muestra error si falla.
- Usuario autenticado sin compania: muestra estado de permisos pendientes.
- Usuario autenticado con permisos: muestra companias y roles.
- Schema sin companias: muestra pendiente de seed.

## Pendientes externos

En Supabase Dashboard se debe confirmar:

- Email/password habilitado si se usara login con password.
- Email signup habilitado si se permitira crear cuentas desde `/login`.
- Magic link/OTP habilitado si se usara acceso sin password.
- Redirect URL permitido para `/auth/callback`.

URLs recomendadas en desarrollo:

```text
http://localhost:3000/auth/callback
```

## Verificacion local

Comandos ejecutados desde `App/`:

```bash
npm run lint
npm run typecheck
npm run build
```

Resultados:

- Lint paso sin errores.
- TypeScript paso sin errores.
- Build de Next.js paso e incluyo rutas dinamicas para `/login`, `/logout`, `/dashboard`, `/auth/callback` y `proxy.ts`.
- `GET /login` respondio `200`.
- `HEAD /dashboard` sin sesion respondio `307` hacia `/login?next=%2Fdashboard`.
- Se valido que `next` se normaliza con `sanitizeNextPath()` para evitar redirects externos.
- En navegador integrado, `/login` mostro titulo, email, password y botones `Entrar`, `Magic link`, `Crear cuenta`.
- En navegador integrado, `/dashboard` sin sesion termino en `/login?next=%2Fdashboard`.

Observacion:

- Durante la prueba visual aparecio una advertencia de hidratacion por atributos agregados al `<html>` por el entorno/extensiones del navegador. No bloqueo la pantalla ni el flujo validado.

## Pendientes tecnicos posteriores

- Generar tipos TypeScript desde Supabase.
- Implementar RLS y politicas de autorizacion.
- Crear UI formal de administracion de usuarios.
- Reemplazar bootstrap por flujo administrativo una vez existan admins.
