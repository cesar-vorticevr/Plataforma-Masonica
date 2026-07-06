## Why

En `/tenidas` el formulario "Agregar tenida" no funciona para un administrador global (master /
Gran Secretario). La causa raíz: un master no pertenece a ninguna logia (`logia_id` nulo → `""` en
el cliente), y toda la página asume un usuario con logia. Al enviar, `addTenida` inserta
`logia_id: ""` en una columna `uuid` y Postgres rechaza el insert (*"invalid input syntax for type
uuid"*). Peor aún: el error se **traga en silencio** (la capa de datos devuelve `void`, la isla no
valida ni informa, limpia el formulario y hace `router.refresh()`), así que el fallo es
indistinguible de "roto" para cualquier rol. La página completa (Stats, calendario, gráficas)
también queda vacía para el master porque consulta con `logia_id = ""`.

Pertenece a la **Fase 2 (Administración · tenidas)** del roadmap: completar el cableado de gestión de
tenidas para que funcione con la cadena de mando real. No requiere resolver ninguna decisión abierta
del §11 del `.docx`.

## What Changes

- **Selector de logia para el administrador global.** En `/tenidas`, un master / Gran Secretario
  SHALL poder elegir sobre qué logia opera. Toda la página (los 3 Stats, el calendario, el alta de
  tenida, el registro de asistencia y las dos gráficas) SHALL reencuadrarse a la logia seleccionada.
  Un secretario (una sola logia) NO ve el selector; la cabecera queda idéntica a hoy.
- **Alta de tenida contra la logia seleccionada, nunca contra `logia_id` vacío.** El formulario SHALL
  usar la logia en foco (seleccionada por el global, o la propia del secretario) y SHALL validar que
  no esté vacía antes de enviar.
- **Feedback de errores real.** La capa de datos (`addTenida`, `setAsistencia`) SHALL propagar el
  error de Supabase, y la isla SHALL mostrar un mensaje claro y deshabilitar el botón mientras envía,
  en lugar de fallar en silencio. Beneficia también al secretario.
- La página server SHALL evitar consultar tenidas/miembros/asistencias con un `logia_id` vacío.

## Non-goals

- **No se tocan las migraciones ni las políticas RLS.** La RLS ya soporta que un master opere sobre
  cualquier logia (`tenidas_read`/`asis_read` incluyen `es_global()`; `tenidas_write`/`asis_write`
  incluyen `mi_rol() = 'master'`). El bug es 100% de la capa de aplicación.
- No cambia el aislamiento por logia del secretario (sigue acotado a la suya por RLS).
- No añade edición ni borrado de tenidas, ni nuevas métricas de asistencia.
- No introduce nuevos tokens ni evoluciona el sistema de diseño.

## Capabilities

### New Capabilities

_(ninguna)_

### Modified Capabilities

- `tenidas`: se amplía el requisito de creación/gestión para contemplar al administrador global
  (selección de logia sobre la que opera) y se añade el requisito de retroalimentación de errores en
  el alta de tenida y el registro de asistencia. El aislamiento por logia del secretario no cambia.

## Impact

- **Código (solo capa app, sin backend):**
  - `plataforma-masonica/lib/data/tenidas.ts`: `addTenida` y `setAsistencia` devuelven el `error` de
    Supabase (hoy `void`).
  - `plataforma-masonica/app/(app)/tenidas/page.tsx`: replica el patrón canónico de
    `app/(app)/admin/page.tsx` (global → `adminListLogias`, `defaultLogiaId`, carga condicionada a
    `logia_id ≠ ""`).
  - `plataforma-masonica/app/(app)/tenidas/TenidasClient.tsx`: estado `logiaSel`, `<Select>` de logias
    en el slot `action` del `PageTitle` (solo global), `refrescar(id)`, y manejo de error/estado de
    envío en `crear()` y `marcar()`.
- **Sin cambios** en `supabase/migrations/`, RLS, esquema ni `lib/types.ts`.
- **UI:** cumple `DESIGN.md` tal cual; reutiliza los primitivos `PageTitle` (slot `action`), `Select`
  y `Button` existentes. No requiere evolucionar el sistema de diseño.
- **Permisos:** no cambia el modelo. El global ya podía escribir cualquier logia por RLS; este cambio
  solo expone esa capacidad en la UI. No toca datos sensibles de salud.
