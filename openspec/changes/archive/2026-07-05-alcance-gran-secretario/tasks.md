## 1. BD: helper y políticas

- [x] 1.1 Migración: helper `es_master()` (grants solo a `authenticated`). → `20260705003740_alcance_gran_secretario.sql`
- [x] 1.2 Recrear `generales_rw` para quitar la lectura individual del Gran Secretario (dueño + `es_master()` + secretario de su logia); conserva el gate de estado.
- [x] 1.3 Recrear `trabajos_read` para incluir `mi_rol() in ('master','gran_secretario')`; conserva cámara/logia/estado para el resto.
- [x] 1.4 Función `estadisticas_capitas()` (security definer, agregado por logia) accesible a master y gran_secretario; grants adecuados.
- [x] 1.5 Aplicar en local sin borrar datos.

## 2. App

- [x] 2.1 `lib/roles.ts`: `verCapitasStats` incluye `gran_secretario` (vista agregada).
- [x] 2.2 Vista agregada de cápitas por logia en `/estadisticas` para roles globales (consume `estadisticas_capitas()` vía `lib/data/tesoreria.ts`).

## 3. Verificación (Supabase)

- [x] 3.1 Gran Secretario: no lee generales individuales; Secretario (su logia) y Master sí. (verificado)
- [x] 3.2 Gran Secretario y Master: ven trabajos de todas las logias; hermano sigue limitado por cámara/logia. (verificado)
- [x] 3.3 Gran Secretario: obtiene cápitas agregadas (3 logias) por RPC; no lee `pagos` individuales. Hermano: `estadisticas_capitas` rechazada. (verificado)
- [x] 3.4 Regresión: alcance de Secretario y Master sin cambios; app `/estadisticas` 200 con sección de cápitas.

## 4. Calidad

- [x] 4.1 `npm run typecheck` y `npm run lint` en verde.
