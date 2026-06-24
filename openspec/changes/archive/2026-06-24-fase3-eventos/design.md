## Context

`eventos` existe. `eventos_read` ya acota (`alcance='global' or logia_id=mi_logia()`). `eventos_write` usa
`es_admin()` sin acotar → un secretario podría publicar global o en otra logia. La página mock ya limita
el alcance en la UI, pero la RLS debe reforzarlo. El nombre del autor no es legible por un hermano
(RLS de `perfiles`). El badge "nuevos eventos" del nav es síncrono y basado en mock.

## Goals / Non-Goals

**Goals:** publicar/consultar eventos en Supabase con alcance por rol; endurecer la RLS de publicación;
cablear la tarjeta del dashboard.
**Non-Goals:** badge de no-leídos server-side; editar/eliminar; correo.

## Decisions

- **Endurecer `eventos_write` (migración):**
  - `using (es_global() or (es_admin() and logia_id = mi_logia()))`
  - `with check (es_global() or (mi_rol() = 'secretario' and alcance = 'logia' and logia_id = mi_logia()))`
  - Así el secretario solo crea eventos de su logia (alcance logia); el global crea cualquiera.
- **Helper `lib/data/eventos.ts`:** `listEventos()` (la RLS devuelve globales + de la logia) ordenado por
  `fecha_evento` desc; `addEvento({titulo, descripcion, fecha_evento, alcance, logia_id, autor_id})`.
- **Sin nombre de autor en el listado:** la RLS de `perfiles` no deja al hermano leer el autor; se muestra
  fecha + alcance. (Si se quisiera, requeriría denormalizar `autor_nombre` o una vista; fuera de alcance.)
- **Dashboard:** la tarjeta de "próximos eventos" usa `listEventos()` y muestra los primeros; cierra la
  postergación de Fase 2.
- **Badge del nav (`nuevosEventos`): se deja como está** (mock; 0 con datos reales). Migrarlo exige un
  conteo async que no encaja en el badge síncrono actual; se difiere.
- **`store.ts`:** se conservan `listEventos`/`addEvento`/`nuevosEventos`/`marcarEventosVistos` (badge mock).

## Risks / Trade-offs

- **Reescribir `eventos_write`:** validar que el secretario no publique global/otra logia y que el global sí.
- **Autor oculto:** leve pérdida de UX; aceptable por privacidad/RLS.
- **Badge mock inactivo:** no muestra falsos positivos (mock vacío → 0); documentado.

## Migration Plan

1. Rama; Supabase local; un secretario y un gran secretario/master; otra logia.
2. Migración: reescribir `eventos_write`.
3. `lib/data/eventos.ts`; cablear `eventos/page.tsx` (sin autor) y la tarjeta del dashboard.
4. Validar (ver tasks): secretario publica en su logia y NO global/otra logia; global publica global; lectura por alcance; typecheck/lint/build.
5. Rollback: revertir rama.

## Open Questions

- ¿Mostrar el autor mediante denormalización (`autor_nombre`) en un corte futuro? (Propuesta: evaluar si se pide.)
- ¿Mecanismo de "nuevos/no leídos" server-side para el badge? (Diferido.)
