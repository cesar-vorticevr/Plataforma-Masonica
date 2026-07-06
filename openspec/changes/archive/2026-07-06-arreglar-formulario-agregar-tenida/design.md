## Context

`/tenidas` se construyó asumiendo un usuario **con** logia (un secretario). El Server Component
`page.tsx` calcula `const logiaId = perfil?.logia_id ?? ""` y consulta
`listTenidas/listMiembros(supabase, logiaId)`. La isla `TenidasClient.tsx` crea tenidas con
`addTenida(createClient(), user.logia_id, …)`.

Para un administrador global (master / Gran Secretario), `logia_id` es nulo → `""`. Esto rompe la
página de dos formas:

1. Las consultas del servidor filtran por `logia_id = ""` → no devuelven filas (o error), así que la
   página aparece vacía.
2. El alta envía `logia_id: ""` a una columna `uuid` → Postgres responde *"invalid input syntax for
   type uuid"*. Como `addTenida` devuelve `void` y `crear()` no revisa el resultado, el fallo se
   traga: se limpia el formulario y se hace `router.refresh()`, indistinguible de "roto".

El proyecto ya resolvió exactamente este problema en **Administración**: `app/(app)/admin/page.tsx`
detecta al global (`esGlobal(perfil.rol)`), lista las logias (`adminListLogias`) y elige
`defaultLogiaId = logias[0]?.id ?? ""`; `AdminClient` mantiene `logiaSel` en estado y un `<Select>`
que llama a `refrescar(id)` recargando los datos con el cliente de navegador. Este cambio replica ese
patrón consolidado en `/tenidas`.

## Goals / Non-Goals

**Goals:**
- El administrador global puede elegir la logia sobre la que opera; toda la vista de `/tenidas` se
  reencuadra a esa logia.
- El alta de tenida usa la logia en foco y nunca envía un `logia_id` vacío.
- Los fallos de persistencia (alta y asistencia) se muestran al usuario; el botón se deshabilita
  durante el envío.
- Reutilizar patrones y primitivos existentes; cambios acotados a la capa de aplicación.

**Non-Goals:**
- No tocar migraciones, RLS, esquema ni `lib/types.ts`.
- No añadir edición/borrado de tenidas ni nuevas métricas.
- No evolucionar el sistema de diseño (sin tokens nuevos).

## Decisions

### 1. Seguridad: apoyarse en la RLS existente, sin cambios de backend

La autorización ya vive en el servidor y **ya cubre** este flujo. Verificado en
`supabase/migrations/20260705150535_endurecimiento_rls_rendimiento_hashing.sql`:

- `tenidas_read`: `logia_id = mi_logia() OR es_global()` → el global lee cualquier logia.
- `tenidas_write`: `mi_rol() = 'master' OR (mi_rol() = 'secretario' AND logia_id = mi_logia())` → el
  master escribe cualquier logia; el secretario solo la suya.
- `asis_read`: incluye `es_global()`.
- `asis_write`: `mi_rol() = 'master' OR (secretario AND la tenida es de mi_logia())`.

Por tanto el aislamiento del secretario sigue garantizado **en el servidor** aunque la UI cambie: si
un secretario intentara operar sobre otra logia, la RLS lo rechazaría. El selector de logia solo se
ofrece al global, cuya RLS ya permite cualquier logia. **No se añaden ni modifican políticas.**

_Alternativa descartada:_ un RPC `security definer` para crear tenidas del global — innecesario,
la RLS de `tenidas_write` ya lo permite y añadiría superficie sin beneficio.

### 2. Resolución de la logia en foco: patrón `admin/page.tsx`

`page.tsx` calcula `global = esGlobal(perfil.rol)`; si global, `logias = adminListLogias(sb)` y
`defaultLogiaId = logias[0]?.id ?? ""`; si no, `defaultLogiaId = perfil.logia_id`. Las consultas de
tenidas/miembros/asistencias se ejecutan **solo si `defaultLogiaId ≠ ""`** (evita consultar con id
vacío, igual que admin). Se pasan `global`, `defaultLogiaId` e `initialLogias` a la isla.

_Alternativa descartada:_ resolver la lista de logias en el cliente — el servidor ya tiene la sesión
y el patrón admin resuelve en servidor; mantiene coherencia y evita un round-trip inicial.

### 3. Cambio de logia en cliente: estado `logiaSel` + `refrescar(id)`

La isla mantiene `logiaSel` (init = `defaultLogiaId`) y `tenidas/miembros/asistencias` en estado.
`refrescar(id)` recarga los tres con el cliente de navegador (`listTenidas`, `listMiembros`,
`listAsistencias`) y actualiza el estado, espejando `AdminClient.refrescar`. `crear()` y `marcar()`
llaman a `refrescar(logiaSel)` tras un éxito, en vez del `router.refresh()` actual, para no depender
de `perfil.logia_id` en el re-fetch del servidor.

Nota: `listAsistencias(sb)` no filtra por logia (confía en RLS) y las funciones de cálculo
(`pctDe`, `porMes`) cruzan contra las tenidas ya cargadas por `tenida_id`, por lo que asistencias de
otras logias serían inertes. Aun así, para el global conviene que `refrescar` recargue asistencias
tras cambiar de logia para reflejar la selección.

### 4. Capa de datos: devolver el error

`addTenida` y `setAsistencia` pasan de `Promise<void>` a devolver el resultado con `error` (p. ej.
`Promise<{ error: PostgrestError | null }>`), como ya hacen otras funciones del proyecto
(`subir` en `trabajos`, `directorio`) que la UI inspecciona con `const { error } = await …`. La isla
decide el mensaje.

### 5. UI: selector en el slot `action` del `PageTitle`

`PageTitle` ya expone `action?: React.ReactNode`. El selector es un reencuadre de **toda** la página
(no de una sección), así que va en la cabecera, no dentro de una Card. Se renderiza **solo si
`global`**; el secretario ve la cabecera idéntica a hoy.

- **Primitivos DESIGN.md reutilizados:** `PageTitle` (slot `action`), `Select`, `Button` (con
  `disabled`), `Input`. El mensaje de error usa texto con el token `rose` ya presente en el sistema
  (p. ej. la clase de estado de error existente / `text-rose-*`), sin introducir tokens nuevos.
- **Sin tokens nuevos:** no se tocan `tailwind.config.ts` ni `globals.css`.

_Alternativa descartada:_ una Card/barra entre `PageTitle` y los Stats (como en admin). Válida, pero
añade una banda solo para el global; con un único control, la cabecera es más limpia y el slot
`action` es justo el gancho previsto por el sistema.

## Privacidad · quién ve qué

- El selector solo se ofrece al global (master / Gran Secretario), que **por diseño y por RLS** ya
  puede ver y gestionar todas las logias. No expone datos nuevos a nadie.
- El secretario sigue viendo únicamente su logia (RLS). Sin selector, sin cambio.
- Este cambio **no toca datos de salud**; no hay agregado/anonimizado implicado.

## Risks / Trade-offs

- **[El global sin logias creadas ve una página vacía]** → Igual que admin: si `defaultLogiaId === ""`
  porque no hay logias, mostrar un estado vacío claro ("Aún no hay logias") en lugar de consultas con
  id vacío.
- **[Recargar en cliente vs. `router.refresh()`]** → Se pierde el re-render del Server Component, pero
  se gana independencia de `perfil.logia_id` y coherencia con `AdminClient`; el patrón ya está probado
  en admin.
- **[Doble envío / carreras al cambiar de logia mientras se crea]** → Deshabilitar el botón durante el
  envío y basar el alta en `logiaSel` en el momento del click mitiga envíos duplicados.
- **[La RLS rechaza una escritura inesperada]** → Ahora se muestra el error en vez de tragarlo; la
  seguridad no cambia, solo la visibilidad del fallo.

## Migration Plan

Cambio puramente de aplicación, sin migraciones ni datos. Se despliega con el build normal de Vercel.
Rollback = revertir el commit; no hay estado persistente que deshacer.

## Open Questions

_(ninguna)_ — alcance, causa raíz, patrón y ubicación del selector quedaron decididos en la
exploración previa.
