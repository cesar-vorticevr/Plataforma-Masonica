## Why

Piezas diferidas de `tesoreria-tenidas-completitud` (#6) por ser invasivas o de dataviz:

- **Recaudado por monto vigente (bug):** hoy el recaudado usa la cápita **actual** para meses
  históricos; si el monto cambió, distorsiona. Corregirlo requiere conocer el monto **vigente por
  periodo**.
- **Histórico/periodicidad de cápita:** `config_capitas` tiene hoy **PK = `logia_id`** (un solo
  monto). Para el histórico se necesita **tarifas con vigencia** (varias filas por logia), lo que
  cambia la PK, la semántica de `getCapita`/`setCapita` y exige **migrar datos en producción**
  (backfill de la tarifa actual como vigencia inicial).
- **Tableros de asistencia por mes/año y tendencias (§5.11):** hoy solo hay % acumulado; falta el
  desglose por periodo y la serie temporal.

Pertenece a la **Fase 2**. Es un cambio con **migración de datos productivos**, por eso se separó del
lote de correcciones seguras.

## What Changes

- **Esquema (migración con backfill):** evolucionar `config_capitas` a tarifas con `vigente_desde`
  (y periodicidad), permitiendo varias filas por logia; backfill de la tarifa actual como vigencia
  inicial. Ajustar `getCapita`/`setCapita` (tarifa vigente / alta de tarifa) y el cálculo de recaudado.
- **Recaudado por periodo:** calcular con la tarifa vigente de cada periodo (corrige el bug).
- **Tenidas:** tableros de asistencia por mes/año y tendencia temporal (`lib/data/tenidas.ts` +
  `TenidasClient`), gráficas según skill `dataviz`.

## Capabilities

### New Capabilities
- `capita-historico-periodicidad`: tarifas de cápita con vigencia y cálculo de recaudado por periodo.
- `asistencia-tendencias`: tableros de asistencia por mes/año y tendencia temporal.

## Impact

- **Código:** migración con backfill (riesgo de datos en prod), `lib/data/tesoreria.ts`/`tenidas.ts`,
  `TesoreriaClient`/`TenidasClient`.
- **Datos (prod):** requiere backfill cuidadoso y verificación de que el recaudado histórico no cambia
  con la migración.

## Non-goals

- No cobranza en línea (§2.3). No exportación Excel/PDF (§11-#18).
- La periodicidad por grado (§11-#11) queda fuera salvo indicación (por defecto por logia).
