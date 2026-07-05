## Why

Los módulos de Tesorería/cápitas (§5.10), Tenidas/asistencia (§5.11) y Cumplimientos (§5.12) están
parcialmente implementados frente a la especificación, con indicadores faltantes y dos bugs de datos:

- **Bug** `/cumplimientos` para roles admin: la RLS devuelve pagos/asistencias de **toda la logia** y
  el código los cuenta como propios → % y adeudos inflados (asistencia puede superar 100%).
- **Bug** recaudado: usa la cápita **actual** para meses históricos; si el monto cambió, distorsiona.
- **Faltan indicadores §5.10**: adeudo **total por logia** y monto adeudado por hermano en el tablero.
- **Falta** periodicidad configurable de la cápita (hoy fija a "mensual"; `config_capitas` sin
  histórico de monto por periodo).
- **Faltan tableros §5.11**: asistencia por **mes/año** y **tendencias** (hoy solo % acumulado).
- **Faltan** los tableros **agregados** de cápitas/asistencia para Gran Secretario/Master (se apoya en
  `estadisticas_capitas()` de la propuesta `alcance-gran-secretario`).

Pertenece a la **Fase 2 (Administración)**. Toca app y algo de esquema; no cambia el modelo de
seguridad (la propuesta `fix-aislamiento-logia-escrituras` ya endureció las escrituras).

## What Changes

- **Correcciones:**
  - `/cumplimientos`: calcular siempre sobre los datos **del propio usuario** (o mostrar una vista
    distinta si el que abre es admin), evitando el doble conteo.
  - Recaudado por **monto vigente en el periodo**, no el actual.
- **Esquema (migración):** `config_capitas` gana historial/periodicidad (p.ej. `periodo`/
  `vigente_desde`, o tabla de tarifas por periodo) para calcular montos históricos correctos.
- **Tesorería:** indicadores de adeudo total por logia y monto adeudado por hermano.
- **Tenidas:** tableros de asistencia por mes/año y tendencia temporal.
- **Vistas agregadas:** tableros de cápitas y asistencia agregadas para Gran Secretario/Master
  (consumen funciones `security definer` agregadas).

## Capabilities

### New Capabilities
- `tesoreria-tenidas-completitud`: indicadores, periodicidad de cápita, tableros por periodo/tendencia y
  vistas agregadas, más la corrección del cálculo de Cumplimientos.

## Impact

- **Código:** migración (periodicidad/histórico de cápita), `lib/data/tesoreria.ts`/`tenidas.ts`,
  vistas de tesoreria/tenidas/cumplimientos/estadisticas.
- **Dependencia:** usa `estadisticas_capitas()` de `alcance-gran-secretario`; conviene después de ella
  y de `fix-aislamiento-logia-escrituras`.

## Non-goals

- No implementa cobranza en línea (fuera de alcance, §2.3).
- No cambia las políticas de escritura/aislamiento (ya endurecidas).
- No incluye exportación a Excel/PDF (Decisión abierta §11-#18; posible mejora).
