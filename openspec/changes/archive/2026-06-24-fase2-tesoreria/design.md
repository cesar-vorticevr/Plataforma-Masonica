## Context

`config_capitas` y `pagos` existen con RLS que ya incluye al tesorero (lectura/escritura de su logia;
Gran Secretario NO ve cápitas de otras logias). Faltan: (1) `perfiles.fecha_inicio` (solo está en el
mock); (2) el `tesorero` no puede **leer** los perfiles de su logia (RLS `perfiles_self` solo cubre
`es_admin`), necesario para la matriz; (3) fijar `fecha_inicio` sin abrir la escritura general de perfiles.
La lógica de meses/cumplimiento es pura y vive en `store.ts`.

## Goals / Non-Goals

**Goals:**
- Tesorero/secretario gestionan cápitas de su logia en Supabase (matriz, monto, fecha de inicio, indicadores).
- Cerrar los huecos de esquema/RLS de forma acotada y segura.
- Extraer la lógica de cápitas a un módulo puro reutilizable.

**Non-Goals:**
- Cobranza en línea; adeudos previos al inicio; reintegrar stats de cápitas a Estadísticas; cablear dashboard.

## Decisions

- **`perfiles.fecha_inicio date`** (nullable). Si es null, el cálculo usa `fecha_registro` como inicio (igual que el mock).
- **RLS `perfiles_self`: añadir lectura del tesorero de su logia.** `drop policy` + `create policy` con
  `... or (mi_rol() = 'tesorero' and logia_id = mi_logia())`. (Lectura; la escritura sigue acotada.)
- **`set_inicio_capita(p_usuario uuid, p_fecha date)` `security definer` (`search_path=public`):** valida
  que el llamante sea `es_admin()`/tesorero de la **misma logia** que el hermano, y actualiza **solo**
  `fecha_inicio`. Evita ampliar `perfiles_admin`/`update` para el tesorero (no podría tocar otros campos).
  Patrón análogo a `set_palabra_logia`.
- **Lógica pura `lib/capitas.ts`:** `rangoCapitas(inicioISO, fechaRegistroISO, anio)`, `mesAplica(...)`,
  `cumplimiento(rango, pagos)` — sin dependencia del store; el page las usa con datos de Supabase.
- **Helper `lib/data/tesoreria.ts`:** `listMiembros(logiaId)` (perfiles de la logia), `getCapita/setCapita`
  (`config_capitas` upsert), `listPagos(logiaId, anio)` o por hermano, `togglePago(...)` (`pagos` upsert por
  unique `usuario_id,anio,mes`), `setInicioCapita(usuario, fecha)` (RPC).
- **`store.ts` se conserva** (dashboard usa `cumplimientoCapitas`); el page deja de importarlo.

## Risks / Trade-offs

- **Ampliar lectura de perfiles al tesorero** → acotado a su logia; solo SELECT. Revisar que no exponga de más.
- **`set_inicio_capita` mal gateado** → validar rol+logia dentro; probar cross-logia.
- **`togglePago` (upsert vs toggle):** el estado real es `pagado boolean`; alternar requiere leer el actual o
  upsert con el nuevo valor. Decidir: el page conoce el estado actual (de la matriz) y envía el opuesto (upsert).
- **Rendimiento de la matriz:** `pagos` de la logia para el año en una sola consulta; índice por (usuario_id,anio).
- **`search_path` en security definer** (lección previa): fijarlo.

## Migration Plan

1. Rama; Supabase local; un tesorero + hermanos en una logia (con pagos), y otra logia.
2. Migración: `fecha_inicio`; ajuste `perfiles_self`; función `set_inicio_capita` (+ grant execute authenticated).
3. `lib/capitas.ts` (puro) + `lib/data/tesoreria.ts` (Supabase).
4. Cablear `tesoreria/page.tsx` (carga async de miembros/cápita/pagos; marcar pago; monto; fecha inicio).
5. Validar (ver tasks): marcar pago persiste; monto; fecha inicio recalcula; **aislamiento entre logias**; tesorero solo su logia; typecheck/lint/build verdes.
6. Rollback: revertir rama (migración aditiva salvo el reemplazo de la policy, que se restablece revirtiendo).

## Open Questions

- ¿La fecha de inicio por defecto es `fecha_registro` si `fecha_inicio` es null? (Propuesta: sí, como el mock.)
- ¿Periodicidad distinta de mensual? (Propuesta: mensual ahora; el esquema ya tiene `periodicidad`.)
- ¿El Gran Secretario debe ver cápitas agregadas? (Hoy la RLS lo excluye salvo su propia logia; mantener.)
