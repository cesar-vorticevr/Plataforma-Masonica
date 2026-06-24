## 1. Preparación

- [ ] 1.1 Rama desde `main`; levantar Supabase local (`npx supabase start`).
- [ ] 1.2 Con la skill `supabase`, verificar patrones vigentes en Next 16: `auth.admin.createUser`/`signUp` con `options.data` y `@supabase/ssr` middleware (`updateSession`). No asumir de memoria. (Google OAuth fuera de alcance.)

## 2. Migración: config, hashes y endurecimiento de RLS

- [ ] 2.1 Tabla `config` (palabra general hasheada) y hasheo de `logias.palabra_clave` (pgcrypto). Reflejar en `lib/types.ts`.
- [ ] 2.2 Función `security definer` de verificación de acceso (general + clave de logia) que NO exponga hashes.
- [ ] 2.3 Ajustar `handle_new_user` / flujo para asignar `logia_id` de forma confiable (server-side, no cliente).
- [ ] 2.4 Trigger `BEFORE UPDATE` en `perfiles` que rechaza cambios de `rol`/`estado`/`grado`/`logia_id` salvo admin competente.
- [ ] 2.5 `supabase db reset` + casos: registro ok/rechazado, intento de auto-escalada rechazado, aislamiento entre logias. Revisar rendimiento RLS (índices) con `supabase-postgres-best-practices`.

## 3. Auth real (servidor)

- [ ] 3.1 Route handler / Server Action de **registro**: verifica palabras clave (servidor) y crea usuario + `logia_id` con service-role (`SUPABASE_SERVICE_ROLE_KEY`, solo servidor, no `NEXT_PUBLIC_`).
- [ ] 3.2 `middleware.ts` con `@supabase/ssr` para refrescar la sesión en cada request.
- [ ] 3.3 Cablear `lib/auth.tsx` a Supabase Auth (`signInWithPassword`, `signOut`, `getUser`) conservando la interfaz que consume la UI. (Sin `signInWithOAuth` en este corte.)

## 4. Server Components y protección de rutas

- [ ] 4.1 `app/(app)/layout.tsx` como Server Component: lee `getUser()` del cliente de servidor; sin sesión → redirect a `/login`.
- [ ] 4.2 `AppShell` recibe el `user` resuelto en servidor (se mantiene client para interactividad).
- [ ] 4.3 Ajustar `app/login` y `app/register` para enviar al handler/Server Action; **desactivar el botón de Google** (visible, no funcional); quitar el selector demo cuando el modo sea `supabase`.

## 5. Validación por el secretario

- [ ] 5.1 Pantalla admin: validar, asignar grado, bloquear/desbloquear, dar/quitar tesorero — contra Supabase, limitado por RLS a la logia del secretario.
- [ ] 5.2 Verificar aislamiento: un secretario no puede gestionar otra logia (rechazo por RLS).

## 6. Validación final

- [ ] 6.1 Flujo end-to-end (modo `supabase`): registro→`pendiente`→validación→acceso por grado; `bloqueado` sin acceso; ruta privada sin sesión redirige; sesión persiste entre requests.
- [ ] 6.2 Caso de seguridad: intento de auto-escalada de `rol`/`estado` rechazado por la RLS/trigger.
- [ ] 6.3 `npm run typecheck`, `npm run lint`, `npm run build` en verde. Modo `mock` sigue disponible.
