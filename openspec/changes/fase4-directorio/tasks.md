## 1. Preparación

- [x] 1.1 Rama desde `main`; Supabase local; tres miembros validados en logias distintas (dos con perfil opt-in, uno sin opt-in) y verificación del caso "solo el dueño edita".

## 2. Migración (denormalización)

- [x] 2.1 `alter table perfiles_profesionales add column if not exists nombre text` y `... logia_id uuid references logias(id)`.
- [x] 2.2 `supabase db reset`; verificar columnas.

## 3. Datos y pantalla

- [x] 3.1 `lib/data/directorio.ts`: `listDirectorio()`, `miPerfil(userId)`, `guardarPerfil(perfil, nombre, logiaId)` (upsert con denormalizados), `listLogias()`.
- [x] 3.2 Ajustar `PerfilProfesional` en `lib/types.ts`: añadir `nombre?` y `logia_id?`.
- [x] 3.3 `app/(app)/directorio/page.tsx` async: listar (RLS), buscar (cliente), editar perfil propio con opt-in; mostrar nombre/logia denormalizados. Quitar imports de directorio del store (conservar `enviarMensaje` para "Contactar" mock).
- [x] 3.4 Retirar `listPerfilesDirectorio`/`getPerfil`/`guardarPerfil` de `lib/data/store.ts`.

## 4. Validación

- [x] 4.1 Un miembro crea/edita su perfil con opt-in: aparece en el directorio para otros.
- [x] 4.2 Un miembro de otra logia ve los perfiles opt-in (interlogial), con nombre y logia.
- [x] 4.3 Opt-out: al desactivar `mostrar_en_directorio`, el perfil deja de verse para otros (sigue visible para el dueño).
- [x] 4.4 **Seguridad:** un perfil sin opt-in NO es visible para otros (RLS `prof_read`).
- [x] 4.5 **Seguridad:** un miembro NO puede editar el perfil de otro (RLS `prof_write`).
- [x] 4.6 Búsqueda por profesión/palabra clave filtra correctamente.
- [x] 4.7 `npm run typecheck`, `npm run lint`, `npm run build` en verde.
