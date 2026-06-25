## Why

El badge de "eventos nuevos" en la navegación se eliminó al limpiar el mock (`store.ts`): dependía de
`nuevosEventos`, que leía una DB mock en `localStorage` y nunca se cableó a Supabase (`marcarEventosVistos`
jamás se llamaba). Se reimplementa como feature real, server-side y sincronizada entre dispositivos: el
hermano ve cuántos eventos visibles se publicaron desde su última visita a Eventos.

## What Changes

- **Migración `eventos_badge_no_vistos`:**
  - `perfiles.eventos_vistos_at timestamptz` (marca del último visto, por hermano).
  - RPC `marcar_eventos_vistos()` (security definer): fija `eventos_vistos_at = now()` para `auth.uid()`.
  - RPC `contar_eventos_nuevos()` (security invoker, `stable`): cuenta eventos con
    `created_at > eventos_vistos_at` (o todos si es null). La RLS de `eventos` (`eventos_read` =
    global + de su logia) filtra la visibilidad automáticamente.
- **`lib/data/eventos.ts`:** `contarEventosNuevos(sb)` y `marcarEventosVistos(sb)` (cliente inyectado).
- **`components/layout/nav.ts`:** badge del ítem Eventos → `contarEventosNuevos(createClient())`.
- **`EventosClient`:** al montar (abrir /eventos) llama `marcarEventosVistos` y dispara el evento `notif`
  para que `AppShell` recalcule el badge a 0.

## Impact

- Affected specs: `eventos` (nuevo requisito: badge de no vistos).
- Affected code: nueva migración; `lib/data/eventos.ts`; `components/layout/nav.ts`;
  `app/(app)/eventos/EventosClient.tsx`.
- Privacidad/seguridad: el conteo respeta la RLS de `eventos` (solo eventos visibles para el hermano);
  `eventos_vistos_at` es de su propio perfil. Sin cambios en otras políticas.

## Non-goals

- Notificaciones push o por correo. Marcas de "visto" por evento individual (es a nivel de sección).
- Badges de otras secciones.
