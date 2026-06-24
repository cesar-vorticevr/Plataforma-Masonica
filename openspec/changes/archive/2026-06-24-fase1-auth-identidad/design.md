## Context

Hoy `lib/auth.tsx` es mock (sesión contra localStorage). El esquema de producción ya existe en
`supabase/migrations/` con RLS por logia/grado. Punto clave descubierto al releer el esquema: **la
autorización NO usa claims del JWT, sino la tabla `perfiles`** vía funciones `security definer`
(`mi_rol()`, `mi_logia()`, `mi_grado()` hacen `select ... from perfiles where id = auth.uid()`). Es un
patrón robusto y es el que debemos respetar.

Dos huecos del esquema actual que este corte debe cerrar:
1. **Auto-escalada:** la política `perfiles_update_self` permite a un usuario actualizar su propia fila
   sin restringir columnas → un hermano podría hacerse `rol='master'`/`estado='validado'`. Crítico.
2. **`logia_id` y palabras clave en el registro:** el trigger `handle_new_user` solo setea `nombre`/`email`;
   no asigna `logia_id`. Y no hay almacén para la **palabra clave general** (el mock la tenía en `config`);
   las palabras de logia están en texto plano (`'BOAZ'`).

Operación (AGENTS §8.3): verificar contra docs/changelog de Supabase con la skill `supabase` los patrones
vigentes de `signUp`/`admin.createUser` y `@supabase/ssr` middleware en Next 16 — **no asumir de memoria**.

## Goals / Non-Goals

**Goals:**
- Auth real con email/contraseña (login con Google fuera de alcance: botón desactivado), registro con
  doble palabra clave + logia validados en servidor, estado `pendiente`, validación/grado por el secretario,
  sesión SSR con middleware.
- Cerrar la auto-escalada de `perfiles` y asignar `logia_id` de forma confiable en el registro.
- Conservar la interfaz que consume la UI desde `lib/auth.tsx`.

**Non-Goals:**
- Login con Google / OAuth (botón desactivado; corte posterior).
- Generales/Salud (y consentimiento) — cortes siguientes.
- Catálogo oficial de logias/secretarios (se usa el seed).
- 2FA, notificaciones por correo, pasarela de pagos.

## Decisions

- **Autorización basada en tabla `perfiles` (no en `user_metadata`).** Mantener las funciones
  `security definer`. `user_metadata` solo transporta `nombre` (display) en el alta; nunca authz.
- **Registro vía route handler/Server Action con service-role (solo servidor).** El handler: (1) verifica
  la palabra general (hash) y la de la logia (hash) en el servidor; (2) crea el usuario con
  `auth.admin.createUser` y fija `logia_id` de forma confiable en `perfiles` (no confiar en el cliente para
  `logia_id`). La `SUPABASE_SERVICE_ROLE_KEY` vive solo en el servidor (NUNCA `NEXT_PUBLIC_`).
  Alternativa (signUp del cliente + `logia_id` en metadata): descartada por ser manipulable sin pasar el gate.
- **Hash de palabras clave.** Nueva tabla `config` (o `ajustes`) con la palabra general hasheada; hashear
  `logias.palabra_clave`. Verificación con función Postgres `security definer` (p. ej. `verificar_acceso(general, logia_id, clave_logia)`), sin exponer hashes.
- **Cerrar auto-escalada de `perfiles`.** Trigger `BEFORE UPDATE` que rechaza cambios de `rol`/`estado`/
  `grado`/`logia_id` salvo que el actor sea admin competente (`es_admin()`/`es_global()` y misma logia).
  Alternativa: GRANT UPDATE por columna. Se elige trigger por ser explícito y verificable.
- **Sesión SSR con `@supabase/ssr`.** `middleware.ts` refresca cookies en cada request (patrón `updateSession`).
  La protección de rutas se hace en el **Server Component** del layout `(app)/` leyendo `getUser()` del
  cliente de servidor; sin sesión → redirect a `/login`.
- **Login con Google fuera de alcance.** No se cablea OAuth ni callback en este corte; el botón se deja
  **desactivado** en la pantalla de login (diferido). Se evita así el `signInWithOAuth` y el route handler de callback.
- **Server Components donde aplique.** El layout `(app)/` pasa a server (chequeo de sesión); los formularios
  de login/register pueden seguir siendo client y enviar a un Server Action. `AppShell` se mantiene client
  (interactividad) recibiendo el `user` resuelto en servidor.

## Risks / Trade-offs

- **Exposición de service-role** → solo en el servidor (route handler/middleware), variable no `NEXT_PUBLIC_`; revisar que no se filtre al bundle.
- **RLS hardening incompleto** → además del trigger, auditar TODAS las políticas de `perfiles` (select/update) con la skill `supabase`; probar el intento de escalada como caso de prueba.
- **Rendimiento de RLS a escala** → las funciones por fila (`mi_rol()`, etc.) deben revisarse con `supabase-postgres-best-practices` (índices en `perfiles.id`/`logia_id`).
- **Hydration al pasar a Server Components** → validar que el shell no produzca mismatch; el patrón de sesión SSR lo evita.
- **Sincronía de tipos** → reflejar la nueva tabla `config` y cualquier cambio en `lib/types.ts` (§8).

## Migration Plan

1. Rama desde `main`. Verificar patrones vigentes con la skill `supabase`.
2. **Migración nueva:** tabla `config` (palabra general hash), hashear `logias.palabra_clave`, función de
   verificación de acceso, trigger anti-escalada en `perfiles`, ajuste de `handle_new_user`/asignación de `logia_id`.
   Validar con `supabase db reset` + casos de prueba (registro ok/rechazado, escalada bloqueada).
3. **Auth real:** cablear `lib/auth.tsx`, `middleware.ts`, route handler de registro, layout `(app)/`
   server-side, pantalla admin de validación contra Supabase. Desactivar el botón de Google.
4. **Validación:** registro→pendiente→validación por secretario→acceso por grado; aislamiento entre logias;
   ruta privada sin sesión redirige; intento de auto-escalada rechazado. `typecheck`/`lint`/`build` en verde.
5. Rollback: revertir la rama; la migración nueva es aditiva/reversible (no destruye datos).

## Open Questions

- ¿`config` como tabla nueva o reutilizar un patrón existente para la palabra general? ¿Quién la fija/rota?
- ¿Hashear con `pgcrypto` (`crypt`/`bcrypt`) en Postgres o en el servidor Next? (Preferible `pgcrypto` para no mover hashes.)
- Manejo de `SUPABASE_SERVICE_ROLE_KEY` en local y producción (Vercel env).
- ¿La validación del secretario notifica al hermano? (correo → fuera de alcance ahora.)
