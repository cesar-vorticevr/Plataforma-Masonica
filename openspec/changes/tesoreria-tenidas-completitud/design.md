## Context

`config_capitas(logia_id, monto, periodicidad)` — un solo monto por logia, sin histórico ni periodo.
`pagos(usuario_id, ...)` marca meses pagados. `TesoreriaClient` calcula recaudado con la cápita actual
(`recaudado = totalPagos * capita`) y muestra %; no muestra adeudos totales/por hermano. Tenidas solo
muestra % acumulado. `/cumplimientos` (`cumplimientos/page.tsx`) pasa todas las filas que la RLS
devuelve a `cumplimiento()`, por lo que un rol admin (RLS de logia) obtiene datos inflados.

## Goals / Non-Goals

**Goals:** corregir cálculos, añadir indicadores/tableros y periodicidad con histórico, y vistas
agregadas. **Non-Goals:** cobranza en línea; exportación Excel/PDF; cambios de aislamiento (ya hechos).

## Decisions

### 1. Corregir `/cumplimientos`
Filtrar explícitamente por `auth.uid()` en la vista personal (no confiar en que la RLS acote), o
detectar rol admin y mostrar una vista distinta. Regla: la vista personal cuenta solo lo propio.

### 2. Periodicidad/histórico de cápita
Evolucionar `config_capitas` a tarifas con vigencia: añadir `vigente_desde date` (y `periodo`/
`periodicidad`), permitiendo varias filas por logia. El recaudado y el adeudo se calculan tomando la
tarifa vigente por periodo. Migración con backfill de la tarifa actual como vigencia inicial.

### 3. Indicadores de tesorería
`lib/data/tesoreria.ts` + `TesoreriaClient`: adeudo total por logia (Σ periodos impagos × tarifa
vigente) y monto adeudado por hermano.

### 4. Tableros de asistencia por periodo/tendencia
`lib/data/tenidas.ts` + `TenidasClient`: agregación por mes/año y serie temporal de participación
(por hermano y por logia). Ver skill `dataviz` para las gráficas.

### 5. Vistas agregadas (roles globales)
Consumir `estadisticas_capitas()` (definida en `alcance-gran-secretario`) y una análoga
`estadisticas_asistencia()` (`security definer`, agregada por logia) para los tableros del Gran
Secretario/Master. Cablear en `estadisticas/`.

*Alternativa considerada:* calcular montos históricos sin cambiar el esquema (guardar el monto en cada
`pago`). Se descarta: la tarifa con vigencia es más limpia y evita denormalizar en cada pago; ambas son
válidas, se elige la de vigencia por claridad de auditoría.

## Risks / Trade-offs

- [Migración de `config_capitas` con datos existentes] → backfill de la tarifa actual con
  `vigente_desde` = fecha de creación/inicio; probar que el recaudado histórico no cambia de golpe.
- [Complejidad de cálculo por periodo] → encapsular en funciones de datos con pruebas.

## Migration Plan

1. Migración: evolución de `config_capitas` (vigencia) + `estadisticas_asistencia()`.
2. App: correcciones de cálculo + indicadores + tableros + vistas agregadas.
3. Local → prod (tras `alcance-gran-secretario`). Rollback: revertir esquema (conservando datos) y app.

**Seguridad:** sin cambios (aislamiento ya endurecido). **DESIGN.md/dataviz:** las gráficas cumplen
tokens y la guía de visualización. **Skills:** `supabase-postgres-best-practices` para el cálculo/índices.

## Open Questions

- ¿La periodicidad puede variar por grado (§11-#11), o solo por logia? (Propuesto: por logia; grado
  fuera de alcance salvo indicación.)
