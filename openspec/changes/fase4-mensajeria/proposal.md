## Why

La mensajería profesional es el **último módulo en mock**: `mensajes/page.tsx` lee y escribe en
memoria, el botón "Contactar" del Directorio aún usa el `enviarMensaje` mock y el badge de no leídos
del nav (`unreadMensajes`) también. La tabla `mensajes_profesionales` y su RLS `msg_rw` (solo
emisor/receptor) ya existen. Este corte cierra el cableado a producción y la dependencia que dejó el
Directorio.

## What Changes

- **`lib/data/mensajes.ts`:** `listMensajes(userId)` (mis conversaciones, filtradas por RLS),
  `enviar(deId, deNombre, aId, aNombre, cuerpo)`, `marcarLeidos(deId)` (vía RPC), `contarNoLeidos(userId)`.
- **Migración `mensajeria`:**
  - Columnas denormalizadas `de_nombre`/`a_nombre` (mostrar el nombre del interlocutor sin ampliar la
    RLS de `perfiles` —un hermano no puede leer el perfil de otro—; el emisor aporta ambos nombres).
  - Función `security definer` `marcar_mensajes_leidos(p_de uuid)`: el **receptor** marca como leídos
    los mensajes recibidos de un emisor. Necesaria porque `msg_rw` (`with check de_usuario_id = auth.uid()`)
    impide al receptor actualizar la fila directamente.
- **`mensajes/page.tsx` async:** lista de conversaciones e hilo activo desde Supabase, envío real,
  marcado de leídos, nombres denormalizados.
- **Directorio:** "Contactar" usa el nuevo `enviar(...)` (fin de la dependencia mock).
- **Nav badge async:** `NavItem.badge` pasa a `(u) => Promise<number> | number`; `AppShell` resuelve los
  contadores en estado (se refresca con el evento `notif`). Mensajes usa `contarNoLeidos` (Supabase);
  Eventos mantiene su badge mock (su migración server-side queda en backlog).
- **`store.ts`:** retirar `listMensajes`/`conversacion`/`enviarMensaje`/`marcarMensajesLeidos`/`unreadMensajes`.

## Impact

- Affected specs: `mensajeria` (nueva capability).
- Affected code: `lib/data/mensajes.ts` (nuevo), `app/(app)/mensajes/page.tsx`, `app/(app)/directorio/page.tsx`,
  `components/layout/nav.ts`, `components/layout/AppShell.tsx`, `lib/data/store.ts`, `lib/types.ts`,
  nueva migración `mensajeria`.
- Seguridad: confidencialidad emisor/receptor (RLS `msg_rw`); el marcado de leídos se acota en una
  función `security definer` (solo el receptor, solo el flag). Cierre del último mock activo.
