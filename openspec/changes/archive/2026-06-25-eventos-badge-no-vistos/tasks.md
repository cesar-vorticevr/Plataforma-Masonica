## 1. Migración

- [x] 1.1 Rama `feat-eventos-badge-no-vistos` desde `main`; Supabase local arriba.
- [x] 1.2 Migración `20260625164839_eventos_badge_no_vistos`: `perfiles.eventos_vistos_at timestamptz`.
- [x] 1.3 RPC `marcar_eventos_vistos()` (security definer) con `revoke public` + `grant authenticated`.
- [x] 1.4 RPC `contar_eventos_nuevos()` (security invoker, `stable`, RLS filtra visibilidad) con grants.
- [x] 1.5 `supabase db reset`; columna y funciones verificadas.

## 2. Código

- [x] 2.1 `lib/data/eventos.ts`: `contarEventosNuevos(sb)` y `marcarEventosVistos(sb)` (rpc).
- [x] 2.2 `components/layout/nav.ts`: ítem Eventos con `badge: () => contarEventosNuevos(createClient())`.
- [x] 2.3 `app/(app)/eventos/EventosClient.tsx`: al montar, `marcarEventosVistos(createClient())` +
      `window.dispatchEvent(new Event("notif"))`.

## 3. Validación

- [x] 3.1 Conteo de eventos nuevos = 3 (2 global + 1 propia) con `eventos_vistos_at` null. Validado a nivel
      RPC simulando usuario autenticado (equivalente al badge).
- [x] 3.2 Tras `marcar_eventos_vistos` el conteo baja a 0; un evento nuevo posterior → 1. Validado por RPC.
      (Render visual del badge reutiliza el mecanismo de AppShell ya probado con mensajes; no re-screenshot.)
- [x] 3.3 **Seguridad:** el conteo excluyó el evento de otra logia (3, no 4) → RLS `eventos_read` respetada.
- [x] 3.4 `npm run typecheck`, `npm run lint`, `npm run build` en verde.
