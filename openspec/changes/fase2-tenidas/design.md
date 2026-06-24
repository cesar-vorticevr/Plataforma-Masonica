## Context

`tenidas` y `asistencias` existen. `tenidas_read` ya está acotado (`logia_id = mi_logia() or es_global()`),
pero las escrituras y `asis_read` usan `es_admin()` **sin** acotar a la logia → un secretario podría
operar sobre otra logia. El secretario es `es_admin`, así que ya puede leer perfiles de su logia
(`perfiles_self`) — no hay hueco ahí. La lógica de % de asistencia es pura (presentes / total de tenidas).

## Goals / Non-Goals

**Goals:**
- Calendario + pase de lista por logia en Supabase; asistencia acumulada por hermano.
- Endurecer la RLS para acotar al administrador a su logia (cerrar la fuga).

**Non-Goals:**
- Reintegrar stats de asistencia a Estadísticas; Cumplimientos del hermano; cablear dashboard.

## Decisions

- **Endurecer RLS (migración):**
  - `tenidas_write` → `using (es_global() or (es_admin() and logia_id = mi_logia())) with check (...)`.
  - `asis_read` → `using (usuario_id = auth.uid() or es_global() or (es_admin() and exists (select 1 from tenidas t where t.id = asistencias.tenida_id and t.logia_id = mi_logia())))`.
  - `asis_write` → `using/check (es_global() or (es_admin() and exists (...tenida de mi logia...)))`.
  - Se conserva `es_global()` para master/gran secretario; el dueño sigue viendo su propia asistencia.
- **Helper `lib/data/tenidas.ts`:** `listTenidas(logiaId)`, `addTenida(logiaId, titulo, fechaISO)`,
  `listMiembros(logiaId)` (perfiles validados de la logia), `listAsistencias()` (de la logia; RLS la acota)
  y `setAsistencia(tenidaId, usuarioId, presente)` (upsert por unique `tenida_id,usuario_id`).
- **% de asistencia (en la página):** `total = nº de tenidas`; por hermano `presentes = asistencias.presente`
  para ese hermano; `pct = total ? round(presentes/total*100) : 0`. (Fiel al mock.)
- **`store.ts` se conserva** (el dashboard usa `asistenciasUsuario`); la página deja de importarlo.

## Risks / Trade-offs

- **Reescribir políticas existentes:** `drop policy if exists` + `create policy`. Validar que master/gran secretario y el dueño siguen leyendo lo que corresponde.
- **`asis_read` con subconsulta a `tenidas`:** costo por fila; aceptable al volumen. Índice en `asistencias.tenida_id` (FK) ya ayuda.
- **upsert de asistencia:** unique `(tenida_id, usuario_id)`; enviar el valor `presente` deseado (el page conoce el estado actual).

## Migration Plan

1. Rama; Supabase local; un secretario + hermanos validados en una logia, y otra logia con su secretario.
2. Migración: reescribir `tenidas_write`, `asis_read`, `asis_write` (acotadas por logia).
3. `lib/data/tenidas.ts`; cablear `tenidas/page.tsx` (calendario, pase de lista, acumulado).
4. Validar (ver tasks): crear tenida; marcar asistencia; acumulado/promedio; **aislamiento** (secretario no toca otra logia); typecheck/lint/build verdes.
5. Rollback: revertir rama (las políticas se restauran con la versión previa al revertir).

## Open Questions

- ¿El Gran Secretario gestiona tenidas o solo ve agregados? (Matriz: Gran Secret=Agreg; hoy `es_global` puede escribir — se mantiene permisivo para no romper master; refinar si se requiere.)
- ¿Tenidas de años/históricos? (Hoy se listan todas las de la logia; sin filtro por año.)
