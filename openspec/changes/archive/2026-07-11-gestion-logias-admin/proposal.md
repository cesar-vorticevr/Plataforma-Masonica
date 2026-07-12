## Why

Hoy `/admin` permite **crear** logias, pero un administrador global no tiene forma de **ver el
listado** de logias existentes ni de **corregir sus datos** (nombre, número, oriente). El único
mecanismo relacionado es el selector de logia activa del header, que sirve para *elegir sobre qué
logia se opera*, no para administrar las logias como entidades. Además, la columna `logias.estado`
(`activa`/`inactiva`) existe en el esquema pero no se usa en ninguna parte: no hay manera de
archivar una logia para que deje de admitir registros nuevos.

Este cambio pertenece a la **Fase 2 (Administración)** del roadmap. Toca **permisos** (operaciones
solo para admin global, aplicadas en el servidor); no toca datos de salud.

## What Changes

- **Nueva tabla "Logias" en `/admin`** (visible solo para admin global): lista todas las logias con
  nombre, número, oriente y estado, más un botón **Editar** por fila.
- **Modal "Editar logia"**: permite corregir **nombre, número y oriente**, y **activar/desactivar**
  la logia. Reutiliza el patrón del modal `GestionUsuario`.
- **Semántica de `estado = 'inactiva'`**: una logia inactiva **deja de ofrecerse en el registro**
  (`/register`), de modo que no admite hermanos nuevos. Sigue **visible para admins** (selector del
  header y tabla de `/admin`), y los **hermanos ya validados conservan su acceso** (es archivar, no
  expulsar).
- **El número de logia pasa a ser único**: se añade restricción de unicidad en `logias.numero` y se
  valida al **crear** y al **editar**. La semilla actual (12, 27, 5) no tiene conflictos.
- **Backend**: nuevas RPC `editar_logia` y `set_estado_logia` con guard `es_global()`, siguiendo el
  patrón de `crear_logia`; `crear_logia` incorpora la validación de número único.
- **La auditoría no requiere trabajo extra**: el trigger `trg_audit_logias` ya registra `insert` y
  `update` sobre `logias`.

## Capabilities

### New Capabilities
- `admin-gestion-logias`: listar todas las logias en `/admin` (solo admin global), editar sus datos
  básicos (nombre, número, oriente) y gestionar su ciclo de vida (activar/desactivar) con
  autorización en el servidor.

### Modified Capabilities
- `admin-alta-logias`: la creación de logias debe rechazar un número ya usado por otra logia
  (número único), además de las validaciones actuales.
- `identidad-acceso`: el registro solo ofrece logias en estado `activa`; una logia inactiva no puede
  seleccionarse para registrar hermanos nuevos.

## Impact

- **Base de datos** (`supabase/migrations/`): restricción única en `logias.numero`; RPC
  `editar_logia(id, nombre, numero, oriente)` y `set_estado_logia(id, estado)` (`security definer`,
  guard `es_global()`); actualización de `crear_logia` para validar unicidad de número.
- **Semilla** (`supabase/seed.sql`): verificada, sin números duplicados (no requiere cambios).
- **Datos** (`plataforma-masonica/lib/data/identidad.ts`): nuevas funciones `adminEditarLogia` y
  `adminSetEstadoLogia`. `adminListLogias` ya existe.
- **Servidor** (`app/(app)/admin/page.tsx`): pasar el arreglo `logias` (que `resolverLogiaActiva` ya
  devuelve) a `AdminClient`.
- **UI** (`app/(app)/admin/AdminClient.tsx`): nueva tabla `Logias` y modal `EditarLogia` (solo
  `global`), reutilizando los primitivos de `components/ui` conforme a `DESIGN.md` (sin nuevos
  tokens; semáforo de estado con color + texto).
- **Registro** (`app/register/page.tsx`): filtrar la consulta de logias a `estado = 'activa'`.
- **Tipos** (`lib/types.ts`): el tipo `Logia` ya incluye `estado`; sin cambios de tipo.
- **Cuidado**: la logia activa puede editarse o desactivarse; tras la mutación se refresca desde el
  servidor y `resolverLogiaActiva` revalida la cookie (con fallback a la primera logia), por lo que
  desactivar la logia activa no rompe la vista.

## Non-goals

- **No** se elimina (borrado físico) ninguna logia; "desactivar" es el mecanismo de archivado.
- **No** se cambia la palabra clave de la logia desde este modal: eso ya lo cubre la tarjeta
  "Palabra clave" existente (`set_palabra_logia`).
- **No** se bloquea ni expulsa a los hermanos de una logia inactiva; su acceso no cambia.
- **No** se oculta la logia inactiva a los administradores (selector del header, directorio,
  correspondencia): solo se retira del formulario de registro.
- **No** se permite reasignar hermanos entre logias ni fusionar logias.
