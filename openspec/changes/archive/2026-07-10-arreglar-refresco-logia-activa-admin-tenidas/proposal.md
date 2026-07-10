## Why

Al cambiar de logia en el selector del header, `/admin` y `/tenidas` no actualizan su tabla hasta
recargar la página entera. El header ya escribe la cookie `logia_activa` y llama a `router.refresh()`,
y el servidor recarga los datos correctos de la nueva logia; pero las islas cliente
(`AdminClient`, `TenidasClient`) siembran su estado con `useState(props)` **solo en el montaje** y
descartan los props nuevos que trae el refresco. `/tesoreria` ya funciona porque renderiza directo
desde props y usa `router.refresh()` para mutaciones. Este cambio incumple el requisito ya existente
"Cambiar de logia refresca los datos" de la capacidad `logia-activa`.

Pertenece a la **Fase 2 (Administración)** del roadmap. No requiere ninguna decisión abierta (§11).

## What Changes

- `AdminClient` y `TenidasClient` dejan de copiar los datos del servidor a estado local con
  `useState(props)`; pasan a **renderizar directamente desde props** (patrón C, el mismo de
  `TesoreriaClient`).
- Las recargas tras una mutación (crear tenida, registrar asistencia, cambiar palabra clave, etc.)
  pasan de "fetch en el navegador + `setState`" a **`router.refresh()`**, unificando en una sola
  fuente de verdad (el servidor) los dos mecanismos de refresco que hoy conviven en `AdminClient`.
- Resultado observable: cambiar de logia en el header actualiza la tabla de hermanos (`/admin`) y la
  de tenidas/miembros (`/tenidas`) sin recargar la página.

## Capabilities

### New Capabilities
<!-- Ninguna capacidad nueva. -->

### Modified Capabilities
- `logia-activa`: se refuerza el requisito de refresco para exigir que, tras `router.refresh()`, las
  páginas de una sola logia (`/admin`, `/tenidas`) reflejen la logia activa en pantalla **sin recarga
  completa**; las islas cliente no deben ensombrecer los props del servidor con estado local.

## Impact

- **Código UI (sin cambio visual):**
  - `plataforma-masonica/app/(app)/admin/AdminClient.tsx`
  - `plataforma-masonica/app/(app)/tenidas/TenidasClient.tsx`
- **Sin cambios** en el servidor, cookies, RLS, tipos ni esquema. No toca datos sensibles (salud) ni
  el modelo de permisos: la cookie `logia_activa` sigue siendo preferencia de UI y RLS sigue
  garantizando el aislamiento por logia.
- **DESIGN.md:** se cumple tal cual; no hay cambios de tokens ni de sistema de diseño (misma UI,
  ahora reactiva al selector).

## Non-goals

- No se modifica `/tesoreria`, `/cumplimientos` ni `/dashboard` (ya renderizan desde props).
- No se cambia el selector del header, la cookie, ni la resolución/validación de la logia activa en
  el servidor.
- No se introduce librería de estado ni gestión de datos del lado cliente; el servidor sigue siendo
  la única fuente de verdad.
