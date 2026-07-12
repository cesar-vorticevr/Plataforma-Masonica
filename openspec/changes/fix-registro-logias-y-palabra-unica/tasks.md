## 1. Migración de base de datos (Supabase)

- [x] 1.1 Crear `supabase/migrations/<ts>_registro_palabra_unica.sql` (usar skills `supabase` y `supabase-postgres-best-practices`).
- [x] 1.2 Añadir función `listar_logias_registro()` `SECURITY DEFINER STABLE` con `set search_path = public`, que devuelve `id, nombre, numero, oriente` de logias `activa` ordenadas por `numero`.
- [x] 1.3 `revoke all` de `listar_logias_registro()` a `public` y `grant execute` a `anon` y `authenticated`.
- [x] 1.4 Redefinir `verificar_acceso(p_logia uuid, p_clave_logia text)` para validar solo la palabra clave de la logia (hash bcrypt, `lower(trim(...))`).
- [x] 1.5 `drop function if exists verificar_acceso(text, uuid, text)`; `revoke all` de la firma nueva a `public/anon/authenticated` y `grant execute` a `service_role`.
- [x] 1.6 `drop table if exists config` (después de redefinir `verificar_acceso`, para no dejar la función referenciando una tabla inexistente).
- [x] 1.7 Documentar en comentarios de la migración el rollback (recrear `config`, la firma de 3 args y sus grants).

## 2. Semilla

- [x] 2.1 Quitar el `insert into config (... palabra_general_hash ...)` de `supabase/seed.sql`.

## 3. Backend de la app (registro server-side)

- [x] 3.1 En `app/api/registro/route.ts`, quitar `palabraGeneral` del body y de la llamada `rpc("verificar_acceso", ...)`; pasar solo `{ p_logia, p_clave_logia }`.
- [x] 3.2 Ajustar el mensaje de error 403 para referirse solo a la palabra clave de la logia.
- [x] 3.3 En `app/register/page.tsx`, reemplazar `.from("logias").select(...)` por `.rpc("listar_logias_registro")`.

## 4. UI del formulario de registro

- [x] 4.1 En `app/register/RegisterForm.tsx`, eliminar el `Input` "Palabra clave de la Orden" y el estado `palabraGeneral`.
- [x] 4.2 Ajustar el subtítulo para mencionar solo la palabra clave de la logia.
- [x] 4.3 En `lib/auth.tsx`, quitar `palabraGeneral` del tipo del argumento y de la llamada de `registrar()`.
- [x] 4.4 Verificar cumplimiento de `DESIGN.md`: solo primitivos existentes (`Input`, `Select`, `Button`), sin tokens/colores/tamaños nuevos (apoyarse en skill `impeccable`).

## 5. Verificación

- [x] 5.1 `npx supabase db reset` local: la migración y el seed corren sin error y sin dejar tabla `config`.
- [x] 5.2 Query de prueba: `select listar_logias_registro()` como `anon` devuelve logias `activa` y ninguna `inactiva`; confirmar que no incluye `palabra_clave`.
- [x] 5.3 Revisión RLS/permisos: `verificar_acceso` NO es ejecutable por `anon`/`authenticated` (solo `service_role`); `listar_logias_registro` sí por `anon`.
- [x] 5.4 Prueba de humo en `/register`: el selector de logias carga sin sesión, y un registro con la palabra clave correcta de la logia crea la cuenta en estado `pendiente`.
- [x] 5.5 `npm run typecheck`, `npm run lint` y `npm run check:encoding` pasan (dentro de `plataforma-masonica/`).
