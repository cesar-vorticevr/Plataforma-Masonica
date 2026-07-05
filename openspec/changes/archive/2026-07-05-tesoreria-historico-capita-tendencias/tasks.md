## 1. Recaudado por monto del pago (sin migración)

- [x] 1.1 `lib/data/tesoreria.ts`: `listPagos` incluye `monto`; `PagoRow` gana `monto`.
- [x] 1.2 `TesoreriaClient`: recaudado = Σ `pagos.monto` (pagado), en vez de `nº pagos × cápita actual`.
- [x] 1.3 Exponer `config_capitas.periodicidad` en la vista de tesorería (`getCapitaConfig` + UI).

## 2. Asistencia por mes/año y tendencia

- [x] 2.1 `TenidasClient`: tendencia de asistencia por mes (año en curso) a partir de `tenidas.fecha` + `asistencias`, con gráfica de barras conforme a `DESIGN.md`.

## 3. Verificación

- [x] 3.1 Con pagos de montos distintos (100 + 150), el recaudado muestra $250.00 (suma `pagos.monto`, no la cápita actual). Verificado E2E como tesorero.
- [x] 3.2 La periodicidad se muestra en tesorería. (verificado)
- [x] 3.3 Tendencia de asistencia por mes presente; `/tesoreria` y `/tenidas` = 200.

## 4. Calidad

- [x] 4.1 `npm run typecheck` y `npm run lint` en verde.

<!-- NOTA: sin migración de esquema. La tabla de tarifas con vigencia se descartó (pagos.monto ya
     cubre el recaudado histórico); el adeudo histórico exacto de meses viejos impagos queda como
     posible refinamiento futuro. -->
