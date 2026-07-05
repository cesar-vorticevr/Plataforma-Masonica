## 1. Esquema: tarifas de cápita con vigencia

- [ ] 1.1 Migración: tabla `capita_tarifas(id, logia_id, monto, vigente_desde, periodicidad)` con índice `(logia_id, vigente_desde)`; RLS acotada por logia (espejo de config_capitas).
- [ ] 1.2 Backfill: una tarifa por logia desde `config_capitas` con `vigente_desde` inicial; plan de compatibilidad para `config_capitas` (vista o migración de usos).
- [ ] 1.3 Ajustar `getCapita(logia, fecha)` (tarifa vigente) y `setCapita` (alta de tarifa).
- [ ] 1.4 Aplicar en local; verificar que el recaudado histórico NO cambia con el backfill.

## 2. Recaudado por periodo

- [ ] 2.1 Calcular recaudado sumando la tarifa vigente de cada mes pagado; corregir `TesoreriaClient`.

## 3. Asistencia por mes/año y tendencia

- [ ] 3.1 Agregación de asistencia por mes/año (por hermano y por logia) y serie temporal.
- [ ] 3.2 Tableros/gráficas en `TenidasClient` según skill `dataviz` (tokens de DESIGN.md).

## 4. Verificación

- [ ] 4.1 Con cambio de tarifa a mitad de año, el recaudado usa el monto vigente por periodo.
- [ ] 4.2 Backfill: cifras históricas intactas.
- [ ] 4.3 Tableros de asistencia por mes/año y tendencia correctos.

## 5. Calidad

- [ ] 5.1 `npm run typecheck` y `npm run lint` en verde.
