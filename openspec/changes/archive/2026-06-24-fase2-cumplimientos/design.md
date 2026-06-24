## Context

El hermano debe ver lo suyo. La RLS ya lo permite: `pagos_read`/`asis_read` incluyen `usuario_id = auth.uid()`;
`tenidas_read` y `capita_read` permiten leer las de su logia. La lógica de cápitas (`lib/capitas.ts`) y los
helpers de datos (`tesoreria.ts`, `tenidas.ts`) ya existen. Solo falta cablear la pantalla y exponer
`fecha_inicio` en el usuario de sesión (el cálculo de cápitas lo necesita).

## Goals / Non-Goals

**Goals:** Cumplimientos lee de Supabase los pagos/asistencias del propio hermano (solo lectura), reusando
helpers y lógica existentes.
**Non-Goals:** edición; stats administrativas; dashboard.

## Decisions

- **Reusar helpers existentes:** `getCapita`/`listPagos` (tesorería) y `listTenidas`/`listAsistencias` (tenidas);
  para un hermano, la RLS devuelve solo sus propios pagos/asistencias.
- **`fecha_inicio` en `lib/auth.tsx`:** añadir el campo al `PerfilRow`/mapeo de perfil (el select ya es `*`),
  para que `user.fecha_inicio` esté disponible y el cálculo de meses exigibles sea correcto.
- **Cálculo en cliente** con `lib/capitas.ts`: `rangoCapitas(fecha_inicio, fecha_registro, anio)` + `cumplimiento`
  + `mesAplica`; asistencia = `presentes propios / total tenidas`.
- **Carga async** sin `setState` síncrono en efecto (regla de lint).
- **Retirar del `store.ts`** las funciones que solo usaba Cumplimientos y queden sin referencia.

## Risks / Trade-offs

- **`listPagos`/`listAsistencias` dependen de la RLS para acotar al dueño:** verificar en vivo que un hermano solo ve lo suyo.
- **`fecha_inicio` null:** el cálculo usa `fecha_registro` como respaldo (igual que el mock).

## Migration Plan

1. Rama; Supabase local; un hermano validado con pagos/asistencias.
2. `lib/auth.tsx`: mapear `fecha_inicio`.
3. Cablear `cumplimientos/page.tsx` (async, reusa helpers + `lib/capitas.ts`); quitar imports del store.
4. Validar: el hermano ve sus cápitas/asistencia; no ve ajenas; typecheck/lint/build verdes.
5. Rollback: revertir rama.

## Open Questions

- Ninguna relevante (corte de solo lectura sobre datos propios).
