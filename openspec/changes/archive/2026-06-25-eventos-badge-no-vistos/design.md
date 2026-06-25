## Context

`eventos` ya está en Supabase con `created_at timestamptz default now()` y RLS `eventos_read`
(`alcance = 'global' or logia_id = mi_logia()`). `perfiles` tiene `perfiles_update_self` y un trigger
`perfiles_no_escalar` que solo bloquea cambios de `rol/estado/grado/logia_id` (no afecta a otras columnas).
Patrón de RPC del proyecto: `security definer set search_path = public`, `revoke all from public`,
`grant execute to authenticated` (p. ej. `set_inicio_capita`).

## Decisions

- **`contar_eventos_nuevos()` como security INVOKER (`stable`):** así la RLS de `eventos` filtra la
  visibilidad sin reimplementarla en la función; el subselect a `perfiles` usa `perfiles_self` (fila propia).
  Menos superficie que un definer que tendría que replicar `alcance/logia`.
- **`marcar_eventos_vistos()` como security DEFINER:** fija solo `eventos_vistos_at = now()` para
  `auth.uid()`. No toca columnas de privilegio → no dispara el trigger anti-escalada. Sigue el patrón de
  `set_inicio_capita`.
- **Comparación con `coalesce(eventos_vistos_at, 'epoch')`:** un hermano que nunca abrió Eventos ve todos
  los eventos visibles como nuevos (comportamiento esperado de un badge por primera vez).
- **Refresco del badge:** `EventosClient` llama `marcarEventosVistos` al montar y dispara `window`
  `notif`; `AppShell` ya recalcula los badges al oír `notif`. El badge baja a 0 tras abrir la sección.
- **`created_at` vs `creado`:** el conteo usa la columna real `created_at` en SQL; no se toca el tipo
  `Evento` (su campo `creado`, no poblado por `select *`, queda como deuda preexistente fuera de alcance).

## Risks / Trade-offs

- El badge se computa en el cliente (AppShell) vía RPC en cada carga/`notif`: una llamada ligera (count).
- "Visto" es a nivel de sección, no por evento: abrir Eventos marca todo como visto. Aceptable para un badge.

## Migration Plan

1. Rama; Supabase local. 2. Migración: columna + 2 RPC con grants. `supabase db reset`; verificar.
3. `lib/data/eventos.ts` + `nav.ts` + `EventosClient`. 4. Validar (ver tasks); `typecheck/lint/build`.

## Open Questions

- ¿"Visto" por evento individual en el futuro? (Propuesta: no; a nivel de sección es suficiente.)
