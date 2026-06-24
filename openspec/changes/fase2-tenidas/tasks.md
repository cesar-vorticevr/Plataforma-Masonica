## 1. Preparación

- [x] 1.1 Rama desde `main`; Supabase local; un secretario + hermanos validados en una logia, y otra logia con su secretario (para aislamiento).

## 2. Migración (endurecer RLS)

- [x] 2.1 Reescribir `tenidas_write`: `es_global() or (es_admin() and logia_id = mi_logia())` (using y check).
- [x] 2.2 Reescribir `asis_read`: dueño, o `es_global`, o `es_admin` con tenida de su logia (subconsulta a `tenidas`).
- [x] 2.3 Reescribir `asis_write`: `es_global() or (es_admin() and tenida de mi logia)` (using y check).
- [x] 2.4 `supabase db reset`; verificar políticas.

## 3. Datos y pantalla

- [x] 3.1 `lib/data/tenidas.ts`: `listTenidas(logiaId)`, `addTenida(logiaId, titulo, fechaISO)`, `listMiembros(logiaId)` (validados), `listAsistencias()`, `setAsistencia(tenidaId, usuarioId, presente)` (upsert).
- [x] 3.2 `app/(app)/tenidas/page.tsx` async: calendario + crear tenida; pase de lista por tenida; asistencia acumulada por hermano + promedio de logia. Quitar imports del store mock.

## 4. Validación

- [x] 4.1 Crear una tenida y verla en el calendario.
- [x] 4.2 Marcar asistencia de un hermano persiste; el acumulado/promedio se actualiza.
- [x] 4.3 **Aislamiento (RLS):** un secretario NO crea/modifica tenidas ni asistencias de otra logia, ni lee asistencias de otra logia.
- [x] 4.4 `npm run typecheck`, `npm run lint`, `npm run build` en verde.
