## Context

La tabla `mensajes_profesionales` y su RLS ya existen (init_schema):
- `msg_rw` (all): `using (de_usuario_id = auth.uid() or a_usuario_id = auth.uid())`,
  `with check (de_usuario_id = auth.uid())`.

Es el último módulo en mock. Dos obstáculos:
1. **Nombre del interlocutor:** `perfiles_self` no deja a un hermano leer el perfil de otro, así que
   no se puede resolver el nombre desde `perfiles`. Se **denormaliza** en cada mensaje (`de_nombre`,
   `a_nombre`); el emisor conoce ambos (el suyo por el contexto de auth, el del receptor desde el
   Directorio o desde la propia conversación).
2. **Marcar leídos por el receptor:** `with check (de_usuario_id = auth.uid())` impide al receptor
   actualizar la fila (su `de_usuario_id` es el emisor). Se resuelve con una función
   `security definer` que solo toca el flag `leido` de los mensajes recibidos por el llamante.

## Goals / Non-Goals

**Goals:** mensajería real emisor/receptor con nombres visibles, marcado de leídos correcto y badge de
no leídos en Supabase; cerrar el mock del Directorio.
**Non-Goals:** adjuntos en mensajes; notificaciones push/email; badge "nuevos eventos" server-side (backlog);
borrado de conversaciones.

## Decisions

- **Migración `mensajeria`:**
  - `alter table mensajes_profesionales add column if not exists de_nombre text` y `... a_nombre text`.
  - `create or replace function marcar_mensajes_leidos(p_de uuid) returns void language sql security definer
    set search_path = public as $$ update mensajes_profesionales set leido = true
    where a_usuario_id = auth.uid() and de_usuario_id = p_de and not leido $$;` + `grant execute ... to authenticated`.
    (Acota por `auth.uid()` dentro de la función → el receptor solo marca lo suyo; solo cambia `leido`.)
- **Helper `lib/data/mensajes.ts`:**
  - `listMensajes(userId)`: `select * order by fecha asc` (la RLS deja solo las mías); el cliente deriva
    contactos e hilos y el nombre del interlocutor (de_nombre/a_nombre según quién sea el "otro").
  - `enviar(deId, deNombre, aId, aNombre, cuerpo)`: `insert {de_usuario_id, a_usuario_id, cuerpo, de_nombre, a_nombre}`.
  - `marcarLeidos(deId)`: `rpc('marcar_mensajes_leidos', { p_de: deId })`.
  - `contarNoLeidos(userId)`: `select count head where a_usuario_id = userId and leido = false`.
- **Tipo `MensajeProfesional`:** añadir `de_nombre?` y `a_nombre?`.
- **Nav badge async:** `NavItem.badge?: (u) => Promise<number> | number`. `AppShell` resuelve todos los
  badges visibles con `Promise.resolve` a un `Record<href, number>` en estado; recalcula al montar y con
  el evento `notif`. Mensajes → `contarNoLeidos` (async); Eventos → `nuevosEventos` (sync mock, sin cambio).
- **Directorio:** `Contactar` recibe `deNombre` y llama `enviar(user.id, user.nombre, para.id, para.nombre, txt)`.
- **`store.ts`:** retirar `listMensajes`/`conversacion`/`enviarMensaje`/`marcarMensajesLeidos`/`unreadMensajes`.
  `getUsuario` permanece (uso interno del store); `nuevosEventos` permanece (badge de eventos en mock).

## Risks / Trade-offs

- **Nombres denormalizados:** pueden quedar obsoletos si alguien cambia su nombre; aceptable para un hilo de
  mensajes. Alternativa (abrir `perfiles`) empeora la privacidad.
- **`security definer`:** se fija `search_path = public` y se acota por `auth.uid()`; no recibe ni confía en
  identidades externas. Solo modifica `leido`.
- **Badge async:** ligero retraso hasta que resuelve el contador; se refresca con `notif` al abrir/enviar.
- **Conversaciones en cliente:** se cargan todos mis mensajes y se agrupan en cliente; suficiente para el
  volumen actual (mensajería 1:1). Si crece, paginar/consultar por contacto.

## Migration Plan

1. Rama; Supabase local; dos hermanos (A, B) que se escriben y un tercero (C) para el negativo de confidencialidad.
2. Migración `mensajeria`: columnas `de_nombre`/`a_nombre` + función `marcar_mensajes_leidos`.
3. `lib/data/mensajes.ts`; cablear `mensajes/page.tsx` y `directorio` (Contactar); refactor del badge en nav/AppShell; quitar store.
4. Validar (ver tasks): A↔B envían y leen; C no ve la conversación; no suplantar emisor; marcar leídos baja el contador; solo el receptor marca; typecheck/lint/build.
5. Rollback: revertir rama (columnas/función se recrean al revertir).

## Open Questions

- ¿Mostrar último mensaje/preview en la lista de conversaciones? (Propuesta: fuera de este corte; se puede derivar en cliente luego.)
- ¿Badge de eventos server-side ahora? (Propuesta: no; backlog aparte para no inflar este corte.)
