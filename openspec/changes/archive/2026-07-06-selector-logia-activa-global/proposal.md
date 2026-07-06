## Why

Los administradores globales (`master` / `gran_secretario`) no pertenecen a ninguna logia
(`logia_id = null`), por lo que necesitan elegir **sobre qué logia operan**. Hoy ese selector
existe solo como estado local duplicado en `/tenidas` y `/admin`: no persiste al navegar, cada
página arranca de nuevo en `logias[0]`, y varias pantallas que también operan sobre una sola logia
(`/tesoreria`, `/cumplimientos`, `/dashboard`) asumen `user.logia_id` y quedan **vacías o rotas**
para un admin global. La "logia activa" es un concepto de sesión, global, y debe vivir en el header
junto al nombre de usuario, no atada a una página.

Pertenece a la **Fase 2 (Administración)** del roadmap. No requiere ninguna decisión abierta del §11.

## What Changes

- **Nueva "logia activa" a nivel de sesión** para admins globales, persistida en una cookie
  (`logia_activa`) legible por los server components. Reemplaza el estado local duplicado.
- **Selector en el header** (`AppShell`): dropdown de logias solo para admins globales, colocado a
  la izquierda del bloque de usuario. Para el resto de usuarios, el header sigue mostrando su logia
  como texto (sin cambios). Al cambiar de logia, escribe la cookie y refresca los datos.
- **Helper de servidor** que lee y **valida** la cookie (que apunte a una logia existente y accesible
  por el rol) con fallback a `logias[0]`. Fuente única para todas las páginas que operan sobre una
  sola logia.
- **Migrar las 5 páginas de "una sola logia"** (Categoría A) a leer la logia activa desde el helper:
  - `/tenidas` y `/admin`: eliminar su `useState(defaultLogiaId)` y `<Select>` local.
  - `/tesoreria`, `/cumplimientos`, `/dashboard`: dejar de asumir `user.logia_id` — pasa a
    funcionar para admins globales (arreglo de comportamiento vacío/roto actual).
- **Sin cambios** en las vistas panorámicas (directorio, estadísticas, correspondencia, buzón,
  eventos, trabajos, mensajes) ni en las personales (salud, generales): siguen mostrando su alcance
  actual por RLS.

## Capabilities

### New Capabilities
- `logia-activa`: la logia sobre la que opera un administrador global — cómo se selecciona, se
  persiste, se valida en el servidor y qué páginas gobierna. Incluye el comportamiento del selector
  del header y el fallback de la cookie.

### Modified Capabilities
<!-- No existen specs previos en openspec/specs/; el comportamiento por página vivía solo en código. -->

## Impact

- **Seguridad / permisos**: la cookie `logia_activa` es **preferencia de UI, no autorización**. El
  aislamiento sigue en RLS del servidor. Requiere confirmar que las policies ya permiten a
  `master`/`gran_secretario` leer la logia seleccionada (lo que el selector actual ya asume). No
  toca datos de salud.
- **UI**: cumple `DESIGN.md` tal cual — reutiliza el primitivo `Select` de `components/ui` y los
  tokens existentes; no evoluciona el sistema de diseño. Afecta `components/layout/AppShell.tsx`.
- **Código**: nuevo helper de logia activa (server); refactor de `app/(app)/tenidas`,
  `app/(app)/admin`, `app/(app)/tesoreria`, `app/(app)/cumplimientos`, `app/(app)/dashboard`
  (server + islas cliente). Sin cambios de esquema ni de migraciones.

## Non-goals

- No cambia el modelo de permisos ni las policies RLS (solo se verifican).
- No hace que las vistas panorámicas (directorio, estadísticas, etc.) filtren por la logia activa;
  siguen mostrando todas las logias que el rol puede ver.
- No añade selector para usuarios no globales: su logia es fija.
- No introduce parámetros de logia en la URL ni enlaces compartibles por logia.
- No cambia el esquema de base de datos.
