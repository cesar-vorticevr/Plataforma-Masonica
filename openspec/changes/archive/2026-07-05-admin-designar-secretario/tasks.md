## 1. Base de datos: RPCs y RLS

- [x] 1.1 Confirmar contra el esquema el nombre real del enum de `estado`/`rol`. → `rol_t`, `estado_t`, `grado_t`.
- [x] 1.2 Crear migración nueva con `designar_secretario(p_usuario uuid)` `security definer`, guard `es_global()`, que valida `validado` + con logia, degrada al secretario anterior de esa logia (`rol='hermano'`) y promueve al usuario a `secretario`, atómico. → `20260704185555_designar_secretario.sql`.
- [x] 1.3 En la misma migración, `quitar_secretario(p_usuario uuid)` `security definer`, guard `es_global()`, que devuelve a `hermano`.
- [x] 1.4 Endurecer `perfiles_admin`: `drop policy` + `create policy ... using(...) with check(es_global() or (es_admin() and logia_id = mi_logia() and rol in ('hermano','tesorero')))`.
- [x] 1.5 Grants: `revoke all` de public/anon/authenticated y `grant execute` a `authenticated` en ambas RPC.
- [x] 1.6 Aplicar la migración en local (`npx supabase migration up --local`) sin borrar datos.

## 2. Capa de datos

- [x] 2.1 Añadir `adminDesignarSecretario(sb, usuarioId)` y `adminQuitarSecretario(sb, usuarioId)` en `lib/data/identidad.ts` (invocan las RPC).

## 3. UI: designación en el modal de gestión

- [x] 3.1 En `GestionUsuario` (`AdminClient.tsx`), botón "Designar secretario" / "Quitar secretario" (según `u.rol`), visible solo si `global`, con el patrón `accion(fn)`; "Designar" deshabilitado si el hermano no está validado.

## 4. Verificación de seguridad y datos (Supabase)

- [x] 4.1 Como `master`: designar secretario a un hermano validado → queda `secretario`; el secretario anterior de esa logia queda `hermano`. Verificado (psql tx rollback) + ruta real cliente→RPC (designar/quitar con reversión).
- [x] 4.2 Como `hermano`: `designar_secretario` rechazada (`No autorizado para designar secretarios`).
- [x] 4.3 Validaciones: designar a un usuario `pendiente` es rechazado (`Solo se puede designar secretario a un hermano validado`).
- [x] 4.4 Endurecimiento RLS: como `secretario`, update directo con `rol='secretario'` rechazado por `with_check` (`new row violates row-level security policy`); bloquear y dar tesorero siguen permitidos.
- [x] 4.5 `quitar_secretario`: `secretario` vuelve a `hermano`.

## 5. Calidad y diseño

- [x] 5.1 Cumplimiento de `DESIGN.md`: reutiliza `Button`/`Modal`, sin tokens nuevos. (El botón vive en el modal de gestión, mismo patrón que Validar/Tesorero.)
- [x] 5.2 `npm run typecheck` y `npm run lint` en verde.
