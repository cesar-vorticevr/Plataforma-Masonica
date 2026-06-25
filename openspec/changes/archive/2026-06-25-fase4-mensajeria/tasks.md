## 1. Preparación

- [x] 1.1 Rama desde `main`; Supabase local; dos hermanos (A, B) y un tercero (C) para el negativo de confidencialidad.

## 2. Migración (denormalización + RPC)

- [x] 2.1 `alter table mensajes_profesionales add column if not exists de_nombre text` y `... a_nombre text`.
- [x] 2.2 Función `security definer` `marcar_mensajes_leidos(p_de uuid)` (`set search_path = public`, acotada por `auth.uid()`, solo `leido`) + `grant execute to authenticated`.
- [x] 2.3 `supabase db reset`; verificar columnas y función.

## 3. Datos y pantallas

- [x] 3.1 `lib/data/mensajes.ts`: `listMensajes(userId)`, `enviar(deId, deNombre, aId, aNombre, cuerpo)`, `marcarLeidos(deId)` (RPC), `contarNoLeidos(userId)`.
- [x] 3.2 Ajustar `MensajeProfesional` en `lib/types.ts`: añadir `de_nombre?` y `a_nombre?`.
- [x] 3.3 `app/(app)/mensajes/page.tsx` async: conversaciones e hilo desde Supabase, envío real, marcar leídos, nombres denormalizados.
- [x] 3.4 Directorio `Contactar`: usar `enviar(...)` (pasar `deNombre`); quitar `enviarMensaje` del store.
- [x] 3.5 Nav badge async: `NavItem.badge` a `(u) => Promise<number> | number`; `AppShell` resuelve contadores en estado (refresco con `notif`). Mensajes → `contarNoLeidos`; Eventos sin cambio.
- [x] 3.6 Retirar `listMensajes`/`conversacion`/`enviarMensaje`/`marcarMensajesLeidos`/`unreadMensajes` de `lib/data/store.ts`.

## 4. Validación

- [x] 4.1 A envía a B: el mensaje aparece en la conversación de ambos con el nombre correcto del interlocutor.
- [x] 4.2 B responde a A: hilo bidireccional correcto.
- [x] 4.3 Marcar leídos: al abrir B la conversación, sus no leídos bajan a 0 (contador del nav).
- [x] 4.4 **Seguridad:** C (tercero) NO ve la conversación A↔B (RLS `msg_rw`).
- [x] 4.5 **Seguridad:** A NO puede enviar con `de_usuario_id` de otro (RLS `with check`).
- [x] 4.6 **Seguridad:** C NO puede marcar como leídos mensajes que no le fueron dirigidos (la RPC no los toca).
- [x] 4.7 `npm run typecheck`, `npm run lint`, `npm run build` en verde.
