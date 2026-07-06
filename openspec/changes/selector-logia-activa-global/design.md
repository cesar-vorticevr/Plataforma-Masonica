## Context

Los administradores globales (`master`, `gran_secretario`) tienen `logia_id = null` y necesitan
elegir la logia sobre la que operan. Hoy esa elección vive como estado local de cliente
(`useState(defaultLogiaId)`) duplicado en `app/(app)/tenidas/TenidasClient.tsx` y
`app/(app)/admin/AdminClient.tsx`, cada uno con su propia función `refrescar` y su `<Select>`. El
default en ambos es `logias[0]`, calculado en el respectivo `page.tsx`.

Consecuencias del estado actual:
- La elección no persiste: al navegar de `/tenidas` a `/admin` el selector vuelve a `logias[0]`.
- `app/(app)/tesoreria/page.tsx`, `app/(app)/cumplimientos/page.tsx` y
  `app/(app)/dashboard/page.tsx` cargan datos con `perfil.logia_id ?? ""` / `user.logia_id`, que es
  nulo para un admin global → esas pantallas quedan **vacías o rotas** para `master`.

Los datos se cargan en **server components** (`page.tsx` hace `Promise.all(...)` con RLS antes del
render), por lo que un contexto de React de cliente no basta: el servidor necesita conocer la logia
activa en el momento de la consulta.

Restricción de seguridad: el aislamiento por logia lo garantiza RLS en el servidor. La logia activa
es preferencia de UI y no puede convertirse en un vector de autorización.

## Goals / Non-Goals

**Goals:**
- Una sola fuente de verdad para "la logia activa" del admin global, legible por server components.
- Persistir la elección al navegar.
- Eliminar el estado duplicado de `/tenidas` y `/admin`.
- Arreglar `/tesoreria`, `/cumplimientos` y `/dashboard` para admins globales.
- Selector en el header, junto al usuario, cumpliendo DESIGN.md.

**Non-Goals:**
- No cambia RLS ni el modelo de permisos (solo se verifica).
- No filtra las vistas panorámicas por la logia activa.
- No añade selector para usuarios no globales.
- No usa parámetros de URL ni enlaces compartibles por logia.
- No cambia el esquema de base de datos.

## Decisions

### 1. Persistencia: cookie `logia_activa` (no URL, no context, no localStorage)

Se usa una **cookie** legible por server components (`cookies()` de `next/headers`).

- **Por qué cookie**: es lo único legible por el servidor *antes* de la consulta a datos, que es
  donde se aplica RLS y se arma el `Promise.all`. Persiste al navegar sin ensuciar rutas.
- **Alternativas descartadas**:
  - *React Context / localStorage*: invisibles para server components; obligarían a mover la carga
    de datos al cliente, perdiendo el patrón server-first y complicando RLS.
  - *Param en URL (`?logia=`)*: visible/compartible, pero ensucia todas las rutas y es frágil al
    saltar entre secciones; el usuario ya eligió cookie.

Atributos de la cookie: `httpOnly: false` (la escribe el `<Select>` de cliente), `sameSite: lax`,
`path: /`. Contiene solo el `id` (uuid) de la logia. **Escritura**: la isla del header la fija con
`document.cookie` y llama `router.refresh()` para revalidar los server components. (Alternativa:
Server Action que fija la cookie con `cookies().set` — se decide en implementación según ergonomía;
ambas son válidas.)

### 2. Helper de servidor `resolverLogiaActiva`

Nuevo helper (server-only, p. ej. `lib/data/logia-activa.ts`) que centraliza la resolución:

```
resolverLogiaActiva(supabase, perfil, logias) -> logiaId
  1. si !esGlobal(perfil.rol) -> perfil.logia_id            // usuarios normales, sin cambios
  2. si logias.length === 0   -> ""                          // global sin logias creadas
  3. leer cookie logia_activa
  4. si la cookie ∈ logias    -> cookie                      // válida y accesible
  5. si no                    -> logias[0]                   // fallback
```

- **Validación**: el paso 4 comprueba pertenencia al conjunto `logias` que RLS ya devolvió como
  accesible para el rol; esto evita que una cookie manipulada apunte a algo fuera de alcance para
  fines de UI. Aun así, RLS es la barrera real (ver decisión 4).
- Cada `page.tsx` de Categoría A llama a este helper para obtener `logiaActiva` en vez de calcular
  `defaultLogiaId` localmente.

### 3. Selector en el header (`components/layout/AppShell.tsx`)

`AppShell` ya carga la logia del usuario y muestra el texto `Resp∴ Log∴ …`. Se extiende:
- Para admins globales: renderizar el primitivo `Select` de `components/ui` con la lista de logias
  (cargada en el servidor y pasada al shell, o cargada en cliente como hoy hace con `logias`),
  colocado a la izquierda del bloque de avatar/nombre.
- Para el resto: mantener el texto actual, sin cambios.
- `AppShell` necesita la lista de logias y la logia activa. Como el layout `(app)` es server, se
  pueden pasar como props desde el layout, o el shell (cliente) las obtiene vía `createClient()`
  como ya hace para la logia individual. Se prefiere pasarlas desde el server layout para una sola
  fuente y evitar parpadeo.

**DESIGN.md — tokens/primitivos usados**: `Select` de `components/ui` (mismo control que hoy usan
`/tenidas` y `/admin`), tokens `navy`/`slate` existentes del header. No se introducen colores,
fuentes, radios ni tamaños nuevos; no evoluciona el sistema de diseño.

### 4. Seguridad en el servidor (RLS)

- La cookie es **preferencia de UI**, nunca autorización. La consulta la sigue filtrando RLS.
- Se **verifica** (sin modificar, salvo que falte) que las policies permiten a `master` y
  `gran_secretario` leer las logias objetivo — lo que el selector actual ya asume al funcionar en
  `/tenidas` y `/admin`. Si al probar `/tesoreria`/`/cumplimientos` se descubre que faltan policies
  para el rol global, se documenta y se abre como trabajo aparte (no era funcional antes tampoco).
- Sin cambios de esquema: no se tocan `lib/types.ts` ni migraciones.

### 5. Privacidad — quién ve qué

- No toca datos de salud. Salud sigue siendo individual/privada; estadísticas siguen agregadas y
  anonimizadas y **no** se ven afectadas por la logia activa (Categoría B, sin cambios).
- El admin global ya podía ver datos administrativos por logia; este cambio solo unifica *cómo*
  elige la logia, no *qué* puede ver.

## Risks / Trade-offs

- **[Cookie desincronizada con la lista de logias]** (logia borrada, o rol que perdió acceso) →
  Mitigación: el helper valida pertenencia a `logias` y cae a `logias[0]`; nunca consulta con un id
  inválido.
- **[Parpadeo/estado obsoleto tras cambiar de logia]** (el cliente cambia la cookie pero el server
  aún no revalida) → Mitigación: `router.refresh()` inmediato tras escribir la cookie; los datos se
  recargan desde el servidor.
- **[Tesorería/Cumplimientos sin policy RLS para rol global]** (podrían haber estado rotas también a
  nivel de datos, no solo de UI) → Mitigación: verificar durante la implementación; si falta, se
  documenta como hallazgo y se decide si entra en este cambio o se separa.
- **[Confusión: creer que la cookie autoriza]** → Mitigación: comentar en el helper y en el spec que
  RLS es la barrera; la cookie solo elige el foco de UI.

## Migration Plan

1. Añadir helper `resolverLogiaActiva` (no rompe nada; nadie lo usa aún).
2. Añadir el selector en `AppShell` (escribe cookie + `router.refresh()`).
3. Migrar `page.tsx` de Categoría A a usar el helper; retirar `defaultLogiaId` local.
4. Retirar el `<Select>` y el `useState`/`refrescar`-por-logia de `TenidasClient` y `AdminClient`
   (conservar el refresco tras mutaciones, que ahora leen la logia activa del servidor).
5. Verificar `/tesoreria`, `/cumplimientos`, `/dashboard` para un admin global.
6. `npm run typecheck`, `npm run lint`, `npm run check:encoding`.

**Rollback**: cambio acotado a UI + un helper; revertir los commits restaura el selector local. Sin
migraciones de datos que deshacer.

## Open Questions

- ¿Escritura de la cookie vía `document.cookie` en cliente o vía Server Action con `cookies().set`?
  Se decide en implementación por ergonomía; ambas cumplen el spec.
- ¿La lista de logias para el header se pasa desde el server layout o se carga en cliente como hoy?
  Preferencia: server layout, a confirmar al tocar `AppShell`.
