## 1. Preparación

- [x] 1.1 Rama desde `main`; Supabase local; un secretario y el master/gran secretario; otra logia (para aislamiento).

## 2. Migración (RLS de publicación)

- [x] 2.1 Reescribir `eventos_write`: `using (es_global() or (es_admin() and logia_id = mi_logia()))`, `with check (es_global() or (mi_rol() = 'secretario' and alcance = 'logia' and logia_id = mi_logia()))`.
- [x] 2.2 `supabase db reset`; verificar política.

## 3. Datos y pantallas

- [x] 3.1 `lib/data/eventos.ts`: `listEventos()` (RLS: globales + de la logia, orden por fecha) y `addEvento({...})`.
- [x] 3.2 `app/(app)/eventos/page.tsx` async: listar y publicar (alcance según rol); sin nombre de autor (RLS). Quitar imports del store mock del listado/publicación.
- [x] 3.3 `app/(app)/dashboard/page.tsx`: cablear la tarjeta de "próximos eventos" con `listEventos()`.

## 4. Validación

- [x] 4.1 Secretario publica un evento de su logia (alcance logia) y lo ve.
- [x] 4.2 **Seguridad:** secretario NO puede publicar global ni en otra logia (RLS rechaza).
- [x] 4.3 Gran Secretario/Master publica global; un hermano de cualquier logia lo ve; no ve eventos exclusivos de otra logia.
- [x] 4.4 `npm run typecheck`, `npm run lint`, `npm run build` en verde.
