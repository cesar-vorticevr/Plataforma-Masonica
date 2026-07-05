## Why

La pantalla `/admin` no carga para el **admin global** (rol `master` o `gran_secretario`).
Estos roles no pertenecen a una logia (`perfiles.logia_id = NULL`), pero la página inicializa
la logia seleccionada con `perfil.logia_id`. Al ser nulo, `adminGetLogia` devuelve `undefined`
y `AdminClient` se queda en un `if (!logia) return "Cargando…"` permanente: el selector de
logias —que permitiría elegir una de las logias existentes— está renderizado *después* de ese
guard, así que nunca se pinta. Resultado: el administrador que más poder tiene queda sin acceso
a su única pantalla de gestión, bloqueando el arranque operativo de la plataforma.

Pertenece a la **Fase 1 (MVP): Censo + identidad**. No requiere resolver ninguna decisión
abierta del §11 de la especificación. No toca datos de salud. Es una corrección de un fallo de
autorización/estado de UI: no cambia el modelo de permisos del servidor (RLS), solo corrige cómo
la UI elige la logia por defecto para un rol que legítimamente no tiene logia propia.

## What Changes

- `app/(app)/admin/page.tsx`: para un admin global sin `logia_id`, la logia por defecto pasa a
  ser la primera logia disponible (`logias[0].id`) en vez de un id nulo; `initialLogia` e
  `initialUsuarios` se cargan de esa logia. Un admin de logia (secretario) mantiene su
  `perfil.logia_id` como hasta ahora.
- `AdminClient.tsx`: el guard `if (!logia)` deja de bloquear la pantalla cuando `global === true`.
  Si no existe ninguna logia todavía, se muestra un **estado vacío** claro (no un "Cargando…"
  indefinido) que explique que aún no hay logias.
- Sin cambios de base de datos, RLS ni permisos del servidor.

## Capabilities

### New Capabilities
- `admin-identidad`: comportamiento del panel de administración de identidad (`/admin`) —
  qué logia se selecciona por defecto según el rol, y qué se muestra cuando el admin global no
  tiene logia propia o cuando aún no existen logias.

### Modified Capabilities
<!-- No hay specs previos en openspec/specs/; no se modifican capacidades existentes. -->

## Impact

- **Código:** `app/(app)/admin/page.tsx`, `app/(app)/admin/AdminClient.tsx`.
- **Sin migraciones** ni cambios de RLS/RPC. Reutiliza `adminListLogias`, `adminGetLogia`,
  `adminListUsuarios` (`lib/data/identidad.ts`) sin cambiar sus firmas.
- **UI:** cumple `DESIGN.md` tal cual (reutiliza los primitivos de `components/ui`; el estado
  vacío usa los estilos ya existentes). No evoluciona el sistema de diseño.
- **Roles afectados:** desbloquea a `master` y `gran_secretario`; sin efecto para `secretario`.

## Non-goals

- No agrega la creación de logias ni el alta de hermanos desde el admin (eso es el cambio
  `admin-crear-logias`).
- No cambia RLS, RPC ni el modelo de autorización del servidor.
- No introduce una vista "todas las logias" agregada; el admin global sigue trabajando una logia
  a la vez mediante el selector.
