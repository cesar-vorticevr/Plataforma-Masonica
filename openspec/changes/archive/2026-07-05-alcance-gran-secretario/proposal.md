## Why

La RLS usa `es_global()` (= `gran_secretario` OR `master`) en lugares donde la matriz §4.2 da al
**Gran Secretario** un alcance **agregado (Agreg)**, no individual, y a la vez lo **sub-restringe** en
otros. Verificado:

- **Generales**: `generales_rw` usa `es_global()` → el Gran Secretario **lee generales individuales de
  todas las logias**, pero §4.2 ("Ver Generales de otros") le asigna **Agreg**.
- **Trabajos**: `trabajos_read` exige `logia_id = mi_logia()`; el Gran Secretario/Master (con
  `logia_id`/`grado` nulos) **no ven ningún trabajo**, pero §4.2 ("Ver Trabajos") les da **Sí**.
- **Tesorería**: el Gran Secretario **no** tiene vista agregada de cápitas (excluido en `roles.ts:40`
  y en la RLS), pero §4.2 le da **Agreg**.
- **Tenidas/Asistencias (escritura)**: hoy `es_admin()` permitía al Gran Secretario escribir; la
  propuesta `fix-aislamiento-logia-escrituras` ya lo deja sin escritura (Agreg) — aquí se completa el
  lado de **lectura/vista agregada**.

En resumen, hay que **diferenciar Gran Secretario (Agreg) de Master (Sí)** de forma consistente.
Pertenece a Fase 1/2 y **toca autorización**.

## What Changes

- **BD (migración nueva):**
  - Helper `es_master()` (`mi_rol() = 'master'`) para distinguir del `es_global()`.
  - `generales_rw`: quitar el acceso **individual** del Gran Secretario; queda `usuario_id=auth.uid()
    OR es_master() OR (es_admin() AND misma logia)`. (El agregado de generales, si se requiere, se
    sirve por función; no hay lectura individual para Gran Secretario.)
  - `trabajos_read`: permitir a roles globales ver trabajos de todas las logias:
    `... OR mi_rol() in ('master','gran_secretario')` (respetando el gate de estado de la propuesta 2).
  - Función agregada de tesorería `estadisticas_capitas()` (`security definer`, k-agregado por logia)
    accesible a `master` y `gran_secretario`, para su vista **Agreg**.
- **App:** cablear `can.verCapitasStats` para incluir al Gran Secretario en la **vista agregada** (no
  individual) de cápitas; ajustar Cumplimientos para que el Gran Secretario vea agregado coherente.

## Capabilities

### New Capabilities
- `alcance-gran-secretario`: alcance correcto del rol Gran Secretario (agregado, no individual) en
  Generales, Tesorería y Cumplimientos, y visibilidad de Trabajos para roles globales.

## Impact

- **Código:** migración nueva; `lib/roles.ts`; vistas de estadísticas/cumplimientos.
- **Seguridad/Privacidad:** reduce el acceso del Gran Secretario a datos individuales (generales) al
  nivel agregado que exige la matriz.
- **Dependencias:** va **después** de `fix-aislamiento-logia-escrituras` (que ya quitó su escritura de
  tenidas/tesorería) y se compone con `rls-enforcement-estado`. La función agregada de tesorería puede
  compartirse con la propuesta de tableros (`tesoreria-tenidas-completitud`).

## Non-goals

- No cambia el alcance del Secretario ni del Master.
- No construye los tableros visuales completos de cápitas/asistencia (propuesta de tableros); aquí solo
  la función agregada y el permiso.
- No toca la barrera de salud (ya correcta).
