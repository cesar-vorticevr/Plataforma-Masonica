## Context

`config_capitas(logia_id PK, monto, periodicidad)` — un monto por logia; `setCapita` hace
`upsert onConflict logia_id`. El recaudado en `TesoreriaClient` usa la cápita actual para todos los
meses. Tenidas muestra solo % acumulado. Hay datos en producción, así que evolucionar el esquema exige
backfill sin alterar cifras históricas.

## Goals / Non-Goals

**Goals:** tarifas de cápita con vigencia; recaudado por periodo; asistencia por mes/año + tendencia.
**Non-Goals:** cobranza en línea; exportación; periodicidad por grado.

## Decisions

### 1. Tarifas con vigencia
Opción A (elegida): nueva tabla `capita_tarifas(id, logia_id, monto, vigente_desde date, periodicidad)`
con índice `(logia_id, vigente_desde)`. `getCapita(logia, fecha)` = tarifa con mayor `vigente_desde <=
fecha`. Migración: crear tabla, backfill una fila por logia desde `config_capitas` con
`vigente_desde` = fecha de inicio/creación; mantener `config_capitas` como vista o migrar sus usos.

Opción B (descartada): guardar el monto en cada `pago`. Más simple para recaudado histórico pero
denormaliza y no modela la tarifa; se descarta por claridad de auditoría.

### 2. Recaudado por periodo
Calcular recaudado sumando, por cada mes pagado, la tarifa vigente de ese mes. Encapsular en función
de datos con pruebas; verificar que el recaudado histórico no cambia tras el backfill.

### 3. Asistencia por mes/año + tendencia
`estadisticas_asistencia_periodo()` o consultas agregadas por mes/año; serie temporal en
`TenidasClient` con gráficas según skill `dataviz` (tokens de DESIGN.md).

## Risks / Trade-offs

- [Backfill en prod] → probar en local con copia; verificar cifras antes y después; rollback claro.
- [Migrar usos de `config_capitas`] → mantener compatibilidad (vista) durante la transición.

## Migration Plan

1. Migración: `capita_tarifas` + backfill + ajustes de `getCapita`/`setCapita`.
2. App: recaudado por periodo + tableros de asistencia por periodo/tendencia.
3. Local → verificar cifras → prod. Rollback: revertir a `config_capitas` (datos conservados).

**Seguridad:** sin cambios de RLS relevantes (tesorería ya aislada por logia). **dataviz/DESIGN.md:**
gráficas conformes.

## Open Questions

- ¿`config_capitas` se convierte en vista de compatibilidad o se migran todos los usos de golpe?
