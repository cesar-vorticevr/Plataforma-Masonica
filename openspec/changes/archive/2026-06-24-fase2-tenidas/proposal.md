## Why

**Tenidas y asistencia** es el segundo módulo de la Fase 2. El secretario administra un calendario de
tenidas y registra la asistencia de los hermanos. Hoy la pantalla usa el `store.ts` mock. Al cablearlo
a Supabase se descubrió que la RLS de `tenidas`/`asistencias` deja a **cualquier** administrador
escribir/leer fuera de su logia (no acota a `mi_logia()`), así que el corte incluye endurecerla.

Fase del roadmap: **Fase 2, corte 2.** Toca **datos administrativos** y **permisos** (aislamiento por logia).

## What Changes

- **Migración (endurecer RLS — aislamiento por logia):**
  - `tenidas_write`: de `es_admin()`/`check(true)` a `es_global() or (es_admin() and logia_id = mi_logia())` (using y check).
  - `asis_read`: el caso de administrador se acota a las tenidas de **su** logia (antes `es_admin()` sin filtro).
  - `asis_write`: igual, acotado a tenidas de su logia (using y check).
- **Cablear Tenidas a Supabase:** calendario de tenidas de la logia (`tenidas`), crear tenida, pasar
  lista por tenida (`asistencias`, marcar presente), y asistencia acumulada por hermano e indicadores.
- **Helper `lib/data/tenidas.ts`** (tenidas, miembros validados de la logia, asistencias) y lógica de
  porcentaje de asistencia (presentes / total de tenidas).

## Capabilities

### New Capabilities
- `tenidas`: calendario de tenidas y registro de asistencia por logia — creación de tenidas, pase de lista por tenida y asistencia acumulada por hermano, restringido al secretario/master de la propia logia.

### Modified Capabilities
<!-- Endurecimiento de RLS de tenidas/asistencias (aislamiento por logia); no cambia comportamiento de otras capacidades. -->

## Impact

- **Base de datos:** migración que reescribe `tenidas_write`, `asis_read`, `asis_write` para acotar al
  administrador a su logia. (`tenidas_read` ya está acotado; `tenidas`/`asistencias` y sus grants existen.)
- **Código:** `app/(app)/tenidas/page.tsx` (async), **nuevo** `lib/data/tenidas.ts`.
- **`store.ts`:** sus funciones de tenidas/asistencia **permanecen** (el dashboard usa `asistenciasUsuario`); se retiran al cablear el dashboard.
- **Seguridad:** cierra una fuga de aislamiento — un secretario ya no podrá leer/escribir tenidas ni asistencias de otra logia.

## Non-goals

- Estadísticas de asistencia en la pantalla de Estadísticas (se reintegran con el resto de stats administrativas).
- Vista de Cumplimientos del hermano (corte aparte; reusa asistencia + cápitas).
- Notificaciones/recordatorios de tenidas.
