## Why

Las políticas RLS de **escritura** de tesorería y tenidas no acotan por logia, rompiendo el
aislamiento multi-logia (§2.2, §8.1). Verificado en la BD viva:

- `pagos.pagos_write` (ALL) → `mi_rol() in (tesorero,secretario,master)` **sin** validar la logia del
  `usuario_id` del pago.
- `config_capitas.capita_write` (ALL) → igual, sin validar `logia_id`.
- `tenidas.tenidas_write` (ALL) → `es_admin()` a secas.
- `asistencias.asis_write` (ALL) → `es_admin()` a secas.

Consecuencia: un tesorero/secretario de la logia A puede insertar/actualizar pagos, configuración de
cápita, tenidas o asistencias de la **logia B** mediante una llamada directa a la API (la UI envía
su propia logia, pero la RLS no lo obliga). Las políticas de **lectura** correspondientes ya sí
acotan por logia; el hueco está solo en escritura.

Es una **regresión**: `20260624215734_tenidas_rls.sql` sí acotaba `tenidas_write`/`asis_write` por
logia, pero `20260703212617_endurecer_rls_y_funciones.sql` (posterior por nombre) las recreó como
`es_admin()` puro. Pertenece a la **Fase 2 (Administración)** y **toca autorización/aislamiento**.

## What Changes

- **BD (migración nueva)** — recrear las 4 políticas de escritura con aislamiento por logia,
  coherente con la matriz §4.2 (Tesorero=Logia, Secretario=Logia, Master=Sí; tenidas/asistencias:
  Secretario=Logia, Master=Sí, sin escritura para tesorero ni Gran Secretario):
  - `pagos_write`: master escribe cualquiera; tesorero/secretario solo si el `usuario_id` del pago
    pertenece a `mi_logia()` (espejo de `pagos_read`).
  - `capita_write`: master cualquiera; tesorero/secretario solo `logia_id = mi_logia()`.
  - `tenidas_write`: master cualquiera; secretario solo `logia_id = mi_logia()` (excluye tesorero y
    Gran Secretario).
  - `asis_write`: master cualquiera; secretario solo si la tenida pertenece a `mi_logia()`.
  - Aplicar el predicado tanto en `USING` como en `WITH CHECK`.

## Capabilities

### New Capabilities
- `aislamiento-logia-escrituras`: reglas de aislamiento por logia en la escritura de pagos,
  configuración de cápitas, tenidas y asistencias.

## Impact

- **Código:** una migración nueva en `supabase/migrations/`. Sin cambios de app (la UI ya envía la
  logia propia). Sin cambios en `lib/types.ts`.
- **Seguridad:** cierra fugas de escritura entre logias. No afecta lectura (ya acotada).
- **Interacción:** deja `tenidas_write`/`asis_write` sin escritura para Gran Secretario (Agreg),
  alineado con la propuesta `alcance-gran-secretario` (que ajustará el lado de lectura).

## Non-goals

- No cambia las políticas de lectura (ya correctas).
- No aborda el alcance de lectura del Gran Secretario (propuesta aparte).
- No añade la vista agregada de tesorería (propuesta de tableros).
