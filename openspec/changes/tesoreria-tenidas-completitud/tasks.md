## 1. Correcciones de cálculo

- [ ] 1.1 `/cumplimientos`: calcular sobre datos del propio `auth.uid()` (filtrar explícitamente) o mostrar vista distinta si el que abre es admin; evitar el doble conteo (asistencia ≤ 100%).
- [ ] 1.2 Recaudado por monto vigente del periodo (no el actual).

## 2. Esquema: periodicidad/histórico de cápita

- [ ] 2.1 Migración: evolucionar `config_capitas` a tarifas con `vigente_desde` (y periodicidad), permitiendo varias filas por logia; backfill de la tarifa actual como vigencia inicial (usar skill supabase-postgres-best-practices).
- [ ] 2.2 Aplicar en local sin borrar datos; verificar que el recaudado histórico no cambia con el backfill.

## 3. Indicadores y tableros

- [ ] 3.1 Tesorería: adeudo total por logia y monto adeudado por hermano (`lib/data/tesoreria.ts` + `TesoreriaClient`).
- [ ] 3.2 Tenidas: asistencia por mes/año y tendencia temporal (`lib/data/tenidas.ts` + `TenidasClient`), gráficas según skill `dataviz`.
- [ ] 3.3 Vistas agregadas: `estadisticas_asistencia()` (security definer) y cableado de tableros agregados de cápitas/asistencia para Gran Secretario/Master en `estadisticas/` (usa `estadisticas_capitas()` de la propuesta de alcance).

## 4. Verificación

- [ ] 4.1 Tesorero abre `/cumplimientos` → ve solo lo propio (sin inflar).
- [ ] 4.2 Con cambio de tarifa a mitad de año, el recaudado usa el monto vigente por periodo.
- [ ] 4.3 Adeudos por logia y por hermano correctos; tableros de asistencia por mes/año y tendencia.
- [ ] 4.4 Gran Secretario ve agregados por logia sin filas individuales.

## 5. Calidad

- [ ] 5.1 `npm run typecheck` y `npm run lint` en verde.
