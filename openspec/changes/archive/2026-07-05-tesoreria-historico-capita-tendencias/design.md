## Context

Descubrimiento clave al implementar: **`pagos.monto` ya guarda el importe de cada pago** (`setPago`
registra la cápita vigente al marcar). Por tanto el recaudado histórico se corrige **sumando
`pagos.monto`**, sin cambiar el esquema. `TesoreriaClient` hoy calcula `recaudado = nº pagos × cápita
actual` (bug). `config_capitas` conserva la cápita actual y su `periodicidad` (hoy fija "mensual").
Local tiene 0 filas en `config_capitas`/`pagos` (nada que migrar).

## Goals / Non-Goals

**Goals:** recaudado correcto por importe de cada pago; exponer periodicidad; asistencia por mes/año +
tendencia. **Non-Goals:** tabla de tarifas con vigencia (innecesaria dado `pagos.monto`); cobranza en
línea; exportación.

## Decisions

### 1. Recaudado desde `pagos.monto` (sin migración)
- `listPagos` incluye `monto`; `PagoRow` gana `monto`.
- `TesoreriaClient`: `recaudado = Σ pagos.monto (pagado)` en vez de `Σ pagados × cápita actual`.
- El adeudo por hermano/logia sigue usando la cápita **actual** × meses pendientes (aproximación
  aceptable; precisión histórica del adeudo de meses viejos impagos se puede refinar luego con una
  tabla de tarifas si algún día cambian los montos y se requiere).

*Alternativa descartada:* tabla `capita_tarifas` con vigencia + backfill (cambio de PK). Se descarta:
`pagos.monto` ya cubre el recaudado; el beneficio restante (adeudo histórico exacto) no justifica la
migración de datos en prod ahora.

### 2. Periodicidad visible
- Exponer `config_capitas.periodicidad` en la vista de tesorería (lectura; edición futura).

### 3. Asistencia por mes/año + tendencia
- Agregar en `TenidasClient` un desglose por mes (del año en curso) y la tendencia de participación
  (serie temporal), a partir de `tenidas.fecha` y `asistencias`. Gráficas simples conformes a
  `DESIGN.md` (barras/línea con tokens existentes; ver skill `dataviz`).

## Risks / Trade-offs

- [Adeudo histórico aproximado] → usa cápita actual; documentado. Bajo impacto en sistema joven.
- [Sin migración] → menor riesgo; no toca datos productivos.

## Migration Plan

Sin migración de esquema. Cambios de app: `lib/data/tesoreria.ts` (listPagos+monto),
`TesoreriaClient` (recaudado + periodicidad), `TenidasClient` (tableros por mes/tendencia).
Local → prod es solo deploy de código (las migraciones previas ya están). Rollback = revertir commit.

**DESIGN.md/dataviz:** gráficas conformes a tokens. **Seguridad:** sin cambios de RLS.

## Open Questions

Ninguna (la tabla de tarifas queda como posible refinamiento futuro, no requerido).
