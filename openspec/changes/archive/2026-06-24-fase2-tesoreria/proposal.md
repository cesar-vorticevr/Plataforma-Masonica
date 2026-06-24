## Why

La **Tesorería** (cápitas) es el primer módulo de la **Fase 2 (Administración)**. Hoy la pantalla usa
el `store.ts` mock. El tesorero necesita registrar pagos por hermano y mes, configurar el monto de la
cápita y ver el cumplimiento. Cablearlo a Supabase requiere dos ajustes de esquema/RLS que faltan.

Fase del roadmap: **Fase 2, corte 1.** Toca **datos administrativos** y **permisos** (rol tesorero).
Decisión abierta §11: reglas de cápita (monto/periodicidad, adeudos históricos) — se respeta el modelo
actual (mensual, desde la fecha de inicio del hermano).

## What Changes

- **Migración (dos huecos):**
  - **`perfiles.fecha_inicio date`** (define desde qué mes paga cápitas cada hermano; hoy solo existe en el mock).
  - **RLS `perfiles_self`:** permitir que el **tesorero** lea los perfiles de **su** logia (hoy solo
    `es_admin`); sin esto no puede armar la matriz.
  - **Función `set_inicio_capita(usuario, fecha)`** `security definer`: permite a tesorero/secretario/master
    de **su** logia fijar la fecha de inicio de un hermano (sin ampliar la escritura general de `perfiles`).
- **Cablear Tesorería a Supabase:** matriz de pagos (hermano × mes), marcar pagado/no pagado
  (`pagos`), configurar el monto de la cápita por logia (`config_capitas`), fijar fecha de inicio, e
  indicadores (recaudado, % de cumplimiento).
- **Extraer la lógica de cápitas** (rango de meses aplicables, cumplimiento) a un módulo puro
  `lib/capitas.ts` (hoy en `store.ts`), reutilizable con datos de Supabase.
- Helper `lib/data/tesoreria.ts` (perfiles de la logia, cápita, pagos, fecha de inicio).

## Capabilities

### New Capabilities
- `tesoreria`: gestión de cápitas por logia — matriz de pagos por hermano/mes, monto de la cápita, fecha de inicio por hermano e indicadores de cumplimiento, restringida al tesorero/secretario de la propia logia.

### Modified Capabilities
<!-- Se ajusta la RLS de lectura de perfiles para incluir al tesorero de su logia (no cambia el comportamiento de identidad). -->

## Impact

- **Base de datos:** migración — `perfiles.fecha_inicio`; ajuste de `perfiles_self`; función `set_inicio_capita`. (`config_capitas`/`pagos` y su RLS ya existen e incluyen al tesorero.)
- **Código:** `app/(app)/tesoreria/page.tsx` (async), **nuevos** `lib/data/tesoreria.ts` y `lib/capitas.ts`.
- **`store.ts`:** sus funciones de tesorería **permanecen por ahora** (el dashboard, aún en mock, usa `cumplimientoCapitas`); se retiran cuando se cablee el dashboard.
- **Seguridad:** tesorero/secretario operan solo sobre **su** logia (RLS `pagos`/`config_capitas`/`perfiles`); el Gran Secretario NO ve cápitas de otras logias (RLS existente).

## Non-goals

- **Cobranza en línea / pasarela de pagos** (fuera de alcance del proyecto por ahora).
- Adeudos históricos de años previos al inicio del hermano (el modelo cuenta desde la fecha de inicio).
- Reintegrar las estadísticas de cápitas a la pantalla de Estadísticas (se hará junto con el resto de stats administrativas).
- Cablear el dashboard (otro módulo).
