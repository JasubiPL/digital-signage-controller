# Autenticacion

## Estado

Implementacion base completada en Next.js con Supabase Auth. El login usara usuario/email y contrasena. Pendiente confirmar en Supabase Dashboard que email/password este activo.

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

### Login con usuario/email y contrasena

Formulario en `/login`.

Accion:

```ts
supabase.auth.signInWithPassword()
```

Nota: Supabase Auth usa email para `signInWithPassword()`. El campo de UI se muestra como `Usuario / email` para dejar abierta la convencion funcional, pero tecnicamente se envia como email.

### Creacion de usuarios

No hay registro publico desde `/login`. Las cuentas se crean desde Supabase Dashboard o desde una operacion server-side con `supabase.auth.admin.createUser()`.

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
- `/dashboard/locations/[companySlug]`
- `/dashboard/campaigns/[companySlug]`

Comportamiento:

- Usuario sin sesion en `/dashboard` se redirige a `/login?next=/dashboard`.
- Usuario sin sesion en rutas por marca se redirige a `/login?next=...`.
- Usuario autenticado en `/login` se redirige a `/dashboard`.
- El proxy usa `@supabase/ssr` para refrescar cookies de sesion.

## Perfil automatico

Al entrar al dashboard, la app ejecuta `ensureProfile()`.

Si el usuario existe en Supabase Auth pero no en `public.profiles`, se crea o actualiza:

- `id`
- `email`
- `full_name`
- `avatar_url`

`ensureProfile()` no sobreescribe `global_role` si el perfil ya existe. Esto evita degradar accidentalmente un `super_admin` a `user` durante el login.

## Bootstrap del primer admin

El dashboard permite crear el primer admin solo cuando:

- El usuario esta autenticado.
- El perfil existe o puede crearse.
- Existe al menos una compania.
- No existe ningun perfil con `global_role = 'super_admin'`.

Accion:

```ts
bootstrapFirstAdmin()
```

Resultado:

- Actualiza el perfil del usuario actual a `global_role = 'super_admin'`.
- El admin global ve todas las companias activas.
- Despues del primer `super_admin`, el bootstrap deja de estar disponible.

`user_companies` queda para permisos acotados por compania. No es necesario para el admin global.

## Estados validados en UI

El dashboard contempla:

- Usuario no autenticado: redireccion a login.
- Usuario autenticado sin perfil: intenta crearlo y muestra error si falla.
- Usuario autenticado sin compania: muestra estado de permisos pendientes.
- Usuario autenticado con `global_role = 'super_admin'`: muestra acceso global.
- Usuario autenticado con permisos: muestra companias y roles.
- Schema sin companias: muestra pendiente de seed.

## Pendientes externos

En Supabase Dashboard se debe confirmar:

- Email/password habilitado para login con usuario/email y contrasena.
- Email signup publico deshabilitado si no se permitira autoregistro.
- Los usuarios admin creados manualmente deben tener email confirmado.

`/auth/callback` queda disponible para flujos futuros de confirmacion/invitacion, pero el login principal no depende de magic link ni registro publico.

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
- En navegador integrado, `/login` mostro titulo, usuario/email, contrasena y boton `Entrar`.
- Se valido que `/login` no muestra `Crear cuenta`.
- En navegador integrado, `/dashboard` sin sesion termino en `/login?next=%2Fdashboard`.

Observacion:

- Durante la prueba visual aparecio una advertencia de hidratacion por atributos agregados al `<html>` por el entorno/extensiones del navegador. No bloqueo la pantalla ni el flujo validado.

## Pendientes tecnicos posteriores

- Generar tipos TypeScript desde Supabase.
- Implementar RLS y politicas de autorizacion.
- Crear UI formal de administracion de usuarios.
- Reemplazar bootstrap por flujo administrativo una vez existan admins.
