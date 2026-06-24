## Why

El objetivo original del Proyecto Salud Integral es que la **Gran Comisión** planee acciones preventivas
a partir de la **prevalencia agregada** de factores de riesgo — **sin** acceder a la salud individual de
ningún hermano. La RLS `salud_owner` (solo-dueño) bloquea toda lectura ajena, así que las estadísticas
deben servirse mediante funciones **`security definer`** que devuelven **solo agregados anonimizados**.
Era el non-goal que dejamos al cablear Salud; este corte lo entrega.

Fase del roadmap: **Fase 1, corte 4 (cierra el MVP de salud).** Toca **datos sensibles** (agregados) y
**permisos**. La pantalla de estadísticas mezcla salud con cápitas/asistencia (módulos aún en mock); este
corte cablea **solo la parte de salud** y difiere las demás a sus módulos.

## What Changes

- **Migración:** función(es) `security definer` para estadísticas de salud agregadas, p. ej.
  `estadisticas_salud(p_logia)`, que devuelven distribución de semáforos y **prevalencia de etiquetas y
  condiciones**, basadas en la **última evaluación por hermano** en el alcance.
- **Anonimización (k-anonimato):** la función **suprime** el desglose cuando el cohorte de evaluados en el
  alcance es menor a un umbral (p. ej. 5), para que un grupo pequeño no identifique a nadie. **Nunca**
  devuelve `usuario_id` ni filas individuales.
- **Control de acceso interno:** la función solo responde a administradores; un secretario obtiene los
  agregados **de su logia**; gran secretario/master, de cualquier logia o de todas. (No se confía solo en
  la UI: la función valida `es_admin()`/`es_global()`/`mi_logia()`.)
- **Cablear la parte de salud** de `app/(app)/estadisticas`: distribución por semáforo, factores de riesgo
  más frecuentes y padecimientos, desde la función. Participación (evaluados) incluida.
- **Diferir** en esta pantalla las secciones de **cápitas y asistencia** y el comparativo que dependen de
  ellas (módulos tesorería/tenidas aún en mock) hasta sus cortes.

## Capabilities

### New Capabilities
- `salud-estadisticas`: estadísticas de salud **agregadas y anonimizadas** para administradores (prevalencia de etiquetas/condiciones y distribución de semáforos), servidas por funciones `security definer` que nunca exponen datos individuales y aplican un mínimo de cohorte.

### Modified Capabilities
<!-- Ninguna; `salud` (detalle individual) no cambia: sigue solo-dueño. -->

## Impact

- **Base de datos:** migración nueva con función(es) `security definer` de agregación (lectura interna de
  `evaluaciones_salud`, salida solo agregada). Permiso de ejecución acotado/gateado a administradores.
- **Código:** `lib/data/salud-estadisticas.ts` (RPC), `app/(app)/estadisticas/page.tsx` (parte de salud).
- **Seguridad/privacidad:** el detalle individual sigue inaccesible (RLS `salud_owner`); los agregados
  nunca incluyen identificadores y se suprimen bajo el umbral de cohorte. Cumplimiento LFPDPPP.

## Non-goals

- Estadísticas de **cápitas/asistencia** y comparativo por logia (dependen de tesorería/tenidas; sus cortes).
- Series temporales / tendencias de salud (posible mejora futura).
- Exportación (Excel/PDF) de reportes.
