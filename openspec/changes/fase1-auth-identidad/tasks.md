> Estado: corte AVANZADO. Backend de auth/identidad + UI de auth implementados y **validados en
> vivo** contra el Supabase local. Pendiente: cablear la pantalla de validación del secretario a
> Supabase (tarea 5) y el e2e de UI completo. NO archivar hasta cerrar 5 y 6.

## 1. Preparación

- [x] 1.1 Rama desde `main`; Supabase local levantado (`npx supabase start`).
- [x] 1.2 Verificado contra docs el patrón `@supabase/ssr` + proxy/middleware (Next 16) y `auth.admin.createUser`.

## 2. Migración: config, hashes y endurecimiento de RLS

- [x] 2.1 Tabla `config` (palabra general hasheada) + hash de `logias.palabra_clave` (pgcrypto en esquema `extensions`).
- [x] 2.2 Función `verificar_acceso` (security definer) — verificada por RPC: case-insensitive, rechaza claves malas.
- [x] 2.3 `handle_new_user` corregido (`set search_path=public` + `public.perfiles`); asignación de `logia_id` server-side en el registro. (Bug latente del esquema original.)
- [x] 2.4 Trigger `perfiles_no_escalar` — verificado: bloquea auto-escalada de rol/estado/grado/logia.
- [x] 2.5 `supabase db reset` OK; GRANT a `service_role` añadido (faltaba en la migración inicial). Casos probados.

## 3. Auth real (servidor)

- [x] 3.1 Route handler `app/api/registro/route.ts` — verificado: clave OK→cuenta pendiente+logia; clave mala→403.
- [x] 3.2 `proxy.ts` (antes middleware) con `@supabase/ssr`: refresca sesión y protege rutas privadas.
- [x] 3.3 `lib/auth.tsx` mode-aware: proveedor Supabase real (login/registro/sesión/logout) + mock intacto.

## 4. Server Components y protección de rutas

- [x] 4.1 Protección de rutas en el servidor vía `proxy.ts` (redirige a /login sin sesión). (Refinamiento: protección por proxy en vez de convertir el layout; mismo objetivo de seguridad.)
- [x] 4.2 `AppShell` oculta el selector demo en modo supabase; layout `(app)/` mantiene el guard de cliente para el loading.
- [x] 4.3 `login` con botón de Google desactivado; `register` carga las logias desde Supabase; hint demo solo en modo mock.

## 5. Validación por el secretario  (PENDIENTE)

- [ ] 5.1 Cablear la pantalla admin a Supabase: listar perfiles de la logia, validar+asignar grado, bloquear/desbloquear, tesorero (hoy usa el store mock). La RLS/trigger ya lo soportan (verificado).
- [ ] 5.2 Verificar aislamiento entre logias con un secretario real.

## 6. Validación final

- [x] 6.1 (parcial) Flujo backend validado vía API: registro→pendiente+logia, login (token), sesión. UI e2e del secretario pendiente (depende de 5).
- [x] 6.2 Caso de seguridad: auto-escalada de rol rechazada por el trigger (HTTP 400 P0001); edición de campo propio permitida.
- [x] 6.3 `npm run typecheck`, `npm run lint`, `npm run build` en verde (proxy en lugar de middleware deprecado). Modo `mock` conservado.
