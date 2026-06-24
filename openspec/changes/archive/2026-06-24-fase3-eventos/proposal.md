## Why

**Eventos y anuncios** abre la Fase 3 (Comunicación). Los secretarios publican anuncios para su logia,
y el Gran Secretario/Master para todas; los hermanos los consultan. Hoy la pantalla usa el `store.ts`
mock. Al cablearlo se descubre que `eventos_write` permite a cualquier administrador publicar global o
en otra logia (RLS sin acotar), así que el corte incluye endurecerla.

Fase del roadmap: **Fase 3, corte 1.** Toca **comunicación** y **permisos** (alcance de publicación).

## What Changes

- **Migración (endurecer RLS de publicación):** `eventos_write` pasa a:
  - **Secretario:** solo eventos de **su** logia con alcance `logia` (no puede publicar global ni en otra logia).
  - **Gran Secretario/Master (`es_global`):** cualquier logia o alcance `global`.
- **Cablear Eventos a Supabase:** listar (eventos globales + de la propia logia, por RLS) y publicar (con
  alcance según el rol). Helper `lib/data/eventos.ts`.
- **Quitar el nombre del autor** del listado: un hermano no puede leer el perfil del autor (RLS de
  `perfiles`); se muestra fecha y alcance, sin "por &lt;autor&gt;".
- **Cablear la tarjeta de "próximos eventos" del dashboard** (diferida en Fase 2): muestra los próximos
  de la logia/globales desde Supabase.
- **Badge "nuevos eventos" del nav: diferido** (es síncrono y basado en mock; mostrará 0 con datos reales).
  Se migrará si se decide un mecanismo de "no leídos" del lado servidor.

## Capabilities

### New Capabilities
- `eventos`: publicación y consulta de anuncios — los administradores publican (secretario: su logia; gran secretario/master: cualquiera/global) y todos consultan los de su alcance, con la publicación restringida por rol/logia en el servidor.

### Modified Capabilities
<!-- Endurecimiento de la RLS de publicación de eventos. -->

## Impact

- **Base de datos:** migración que reescribe `eventos_write` (acota por rol/logia). `eventos_read` ya está bien.
- **Código:** `app/(app)/eventos/page.tsx` (async), **nuevo** `lib/data/eventos.ts`, `app/(app)/dashboard/page.tsx` (tarjeta de eventos).
- **`store.ts`:** sus funciones de eventos (`listEventos`, `addEvento`) y el badge (`nuevosEventos`) **permanecen** para el badge del nav (mock, inactivo); se retiran cuando se migre el badge.
- **Seguridad:** cierra el hueco — un secretario ya no puede publicar global ni en otra logia.

## Non-goals

- Badge de "nuevos eventos" del lado servidor (mecanismo de no-leídos) — diferido.
- Editar/eliminar eventos publicados (solo crear y listar en este corte).
- Notificaciones por correo de nuevos eventos.
