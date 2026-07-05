## 1. Base de datos: trigger anti auto-escalada

- [x] 1.1 Crear migración nueva con la función `perfiles_no_autoescalada()` (security definer) y el trigger `BEFORE UPDATE` en `perfiles`, que bloquea cambios de `rol`/`logia_id`/`estado`/`grado` cuando `auth.uid() = old.id` y `not es_global()`. → `20260704192307_perfil_no_autoescalada.sql`.
- [x] 1.2 Aplicar la migración en local (`npx supabase migration up --local`) sin borrar datos.

## 2. Verificación de seguridad (Supabase)

- [x] 2.1 Como el dueño: update de su fila con `rol='master'` → rechazado; con `estado='bloqueado'` → rechazado. (`No puedes modificar tu rol, logia, estado o grado`.)
- [x] 2.2 Como el dueño: update de un campo no sensible (`foto`) → permitido.
- [x] 2.3 No romper: `service_role`/`postgres` (sin `auth.uid()`) fija `logia_id` → permitido; un admin edita a OTRO hermano → permitido.
- [x] 2.4 Un admin global editándose a sí mismo → permitido.

## 3. Calidad

- [x] 3.1 `npm run typecheck` y `npm run lint` en verde (sin cambios de app).
