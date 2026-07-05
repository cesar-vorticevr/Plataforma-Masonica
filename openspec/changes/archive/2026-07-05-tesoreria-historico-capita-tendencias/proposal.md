## Why

Piezas diferidas de `tesoreria-tenidas-completitud` (#6):

- **Recaudado por monto vigente (bug):** hoy el recaudado usa la cápita **actual** para meses
  históricos; si el monto cambió, distorsiona. **Hallazgo:** `pagos.monto` ya guarda el importe de
  cada pago, así que se corrige **sumando `pagos.monto`** — sin cambio de esquema ni migración.
- **Periodicidad de cápita:** `config_capitas` ya tiene la columna `periodicidad` (hoy fija
  "mensual"); falta exponerla.
- **Tableros de asistencia por mes/año y tendencias (§5.11):** hoy solo hay % acumulado; falta el
  desglose por periodo y la serie temporal.

Pertenece a la **Fase 2**. Tras revisar el código, el enfoque elegido es **sin migración de datos**
(la tabla de tarifas con vigencia se descartó por innecesaria dado `pagos.monto`).

## What Changes

- **Recaudado por importe de pago:** `listPagos` incluye `monto`; `TesoreriaClient` suma `pagos.monto`
  de los pagos marcados en vez de `nº pagos × cápita actual`.
- **Periodicidad visible** en el tablero de tesorería.
- **Tenidas:** tableros de asistencia por mes/año y tendencia temporal (`TenidasClient`), gráficas
  según skill `dataviz`.

## Capabilities

### New Capabilities
- `capita-historico-periodicidad`: recaudado por el importe registrado en cada pago y periodicidad visible.
- `asistencia-tendencias`: tableros de asistencia por mes/año y tendencia temporal.

## Impact

- **Código:** `lib/data/tesoreria.ts`, `TesoreriaClient`, `TenidasClient` (+ posible `lib/data/tenidas.ts`).
- **Sin migración de esquema ni de datos** (las funciones/tablas necesarias ya existen).

## Non-goals

- No crea tabla de tarifas con vigencia (innecesaria: `pagos.monto` cubre el recaudado; el adeudo
  histórico exacto de meses viejos impagos queda como posible refinamiento futuro).
- No cobranza en línea (§2.3). No exportación Excel/PDF (§11-#18). Periodicidad por grado fuera de alcance.
