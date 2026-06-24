## Why

**Cumplimientos** es la cara personal del hermano: ve **su** situación de cápitas (pagado/pendiente,
adeudo) y **su** asistencia a tenidas. Cierra la Fase 2. Hoy la pantalla usa el `store.ts` mock. Es el
corte más simple: el hermano lee **solo lo suyo** y la RLS existente ya lo permite, así que **no hay
migración ni cambios de RLS**.

Fase del roadmap: **Fase 2, corte 3 (cierre).** Solo lectura de datos propios.

## What Changes

- **Cablear Cumplimientos a Supabase (solo lectura):** el hermano ve sus pagos de cápitas del año
  (pagado/pendiente por mes, % de cumplimiento, adeudo estimado) y su asistencia por tenida + % acumulado.
- **Reutilizar** los helpers ya creados: `getCapita`/`listPagos` (tesorería), `listTenidas`/`listAsistencias`
  (tenidas) y la lógica pura `lib/capitas.ts`. La RLS devuelve al hermano únicamente sus propios pagos y
  asistencias.
- **Incluir `fecha_inicio` en el usuario de sesión** (`lib/auth.tsx`): hoy el mapeo de perfil no lo trae y
  el cálculo de cápitas lo necesita.
- **Retirar** del `store.ts` mock las funciones que solo usaba Cumplimientos y ya no se referencian.

## Capabilities

### New Capabilities
- `cumplimientos`: vista personal del hermano de sus cápitas (pagos/adeudo) y su asistencia a tenidas, en modo solo lectura sobre sus propios datos.

### Modified Capabilities
<!-- Ninguna; la RLS y el esquema ya soportan la lectura propia. -->

## Impact

- **Base de datos:** sin cambios (RLS `pagos`/`asistencias` ya permiten al dueño leer lo suyo; `tenidas`/`config_capitas` legibles por la logia).
- **Código:** `app/(app)/cumplimientos/page.tsx` (async, reusa helpers), `lib/auth.tsx` (mapear `fecha_inicio`).
- **Seguridad:** el hermano solo ve sus propios pagos/asistencias (RLS por `auth.uid()`).

## Non-goals

- Edición (es solo lectura; la gestión vive en Tesorería/Tenidas).
- Reintegrar stats administrativas; cablear dashboard (otro módulo).
