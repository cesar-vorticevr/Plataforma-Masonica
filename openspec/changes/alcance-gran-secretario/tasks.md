## 1. BD: helper y políticas

- [ ] 1.1 Migración: helper `es_master()` (grants solo a `authenticated`).
- [ ] 1.2 Recrear `generales_rw` para quitar la lectura individual del Gran Secretario (queda dueño + `es_master()` + secretario de su logia).
- [ ] 1.3 Recrear `trabajos_read` para incluir `mi_rol() in ('master','gran_secretario')` (roles globales ven todo), conservando cámara/logia para el resto.
- [ ] 1.4 Función `estadisticas_capitas()` (security definer, agregado por logia) accesible a master y gran_secretario; grants adecuados.
- [ ] 1.5 Aplicar en local sin borrar datos.

## 2. App

- [ ] 2.1 `lib/roles.ts`: `verCapitasStats` incluye `gran_secretario` para la vista **agregada** (no individual).
- [ ] 2.2 Vista agregada de cápitas para el Gran Secretario (consume `estadisticas_capitas()`); Cumplimientos del Gran Secretario muestra agregado coherente.

## 3. Verificación (Supabase)

- [ ] 3.1 Gran Secretario: no lee generales individuales; Secretario (su logia) y Master sí.
- [ ] 3.2 Gran Secretario y Master: ven trabajos de todas las logias; hermano sigue limitado por cámara/logia.
- [ ] 3.3 Gran Secretario: obtiene cápitas agregadas por logia; no lee `pagos` individuales.
- [ ] 3.4 Regresión: alcance de Secretario y Master sin cambios en el resto.

## 4. Calidad

- [ ] 4.1 `npm run typecheck` y `npm run lint` en verde.
