## 1. Preparación

- [x] 1.1 Rama desde `main`; Supabase local; un hermano validado con algunos pagos y asistencias (vía Tesorería/Tenidas o service role).

## 2. Cableado

- [x] 2.1 `lib/auth.tsx`: incluir `fecha_inicio` en el mapeo de perfil (`PerfilRow` + `perfilAUsuario`).
- [x] 2.2 `app/(app)/cumplimientos/page.tsx` async: reusar `getCapita`/`listPagos` (tesorería) y `listTenidas`/`listAsistencias` (tenidas) + `lib/capitas.ts`; mostrar cápitas (mes a mes, %, adeudo) y asistencia (por tenida + % acumulado). Quitar imports del store mock.

## 3. Validación

- [x] 3.1 El hermano ve sus cápitas del año (pagados/pendientes, %, adeudo) coherentes con lo registrado por el tesorero.
- [x] 3.2 El hermano ve su asistencia por tenida y su % acumulado.
- [x] 3.3 Seguridad: el hermano solo obtiene sus propios pagos/asistencias (RLS).
- [x] 3.4 `npm run typecheck`, `npm run lint`, `npm run build` en verde.
