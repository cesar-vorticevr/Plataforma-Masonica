## 1. Corrección: /cumplimientos

- [x] 1.1 `/cumplimientos`: calcula sobre los pagos y asistencias del propio `user.id` (filtrado explícito `misPagos`/`misAsistencias`), evitando el doble conteo cuando un rol admin abre la vista.

## 2. Tesorería: indicadores de adeudo

- [x] 2.1 Tesorería: adeudo total por logia (Stat) y monto adeudado por hermano (columna "Adeudo") en `TesoreriaClient`, usando el rango de cápitas por miembro y la cápita vigente.

## 3. Vista agregada de asistencia (roles globales)

- [x] 3.1 Función `estadisticas_asistencia()` (security definer, agregada por logia) accesible a master/gran_secretario. → `20260705124537_estadisticas_asistencia.sql`
- [x] 3.2 Asistencia agregada por logia en `/estadisticas` para roles globales (junto a cápitas), vía `lib/data/tenidas.ts`.

## 4. Verificación

- [x] 4.1 `/cumplimientos` calcula solo lo propio (filtrado por `user.id`); ruta 200 sin regresión.
- [x] 4.2 Tesorería muestra adeudo por logia (Stat) y por hermano (columna); ruta 200.
- [x] 4.3 Gran Secretario ve asistencia agregada por logia (3 filas); hermano no puede llamar `estadisticas_asistencia` (rechazado). (verificado psql)

## 5. Calidad

- [x] 5.1 `npm run typecheck` y `npm run lint` en verde.

<!-- DIFERIDO a tesoreria-historico-capita-tendencias (#6b):
     - Histórico/periodicidad de cápita (cambio de PK config_capitas + backfill en prod).
     - Recaudado por monto vigente del periodo.
     - Asistencia por mes/año y tendencias (dataviz). -->
