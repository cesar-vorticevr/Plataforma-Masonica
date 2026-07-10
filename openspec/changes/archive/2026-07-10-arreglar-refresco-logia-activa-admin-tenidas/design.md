## Context

El selector de logia activa del header (`components/layout/AppShell.tsx`) escribe la cookie
`logia_activa` y llama a `router.refresh()`. En el App Router, `router.refresh()` re-ejecuta los
componentes de servidor de la ruta actual con la cookie nueva: `app/(app)/admin/page.tsx` y
`app/(app)/tenidas/page.tsx` resuelven la logia activa (`resolverLogiaActiva`), cargan los datos de
esa logia y los pasan como props a sus islas cliente. El servidor, por tanto, ya produce datos
correctos.

El fallo está en las islas cliente:

```
// AdminClient.tsx  y  TenidasClient.tsx  (patrón actual, con bug)
const [usuarios, setUsuarios] = useState(initialUsuarios);   // se siembra SOLO al montar
```

El argumento de `useState` se ignora en los re-render. Como `router.refresh()` re-renderiza pero no
remonta, los props nuevos se descartan y la tabla queda con la logia anterior. Recargar la página
entera sí remonta el componente y por eso "funciona".

`TesoreriaClient.tsx` ya usa el patrón correcto (patrón C): renderiza directo desde props y usa
`router.refresh()` para las mutaciones. Este diseño lo generaliza a `/admin` y `/tenidas`.

Seguridad: el aislamiento de datos lo garantiza RLS en el servidor. La cookie es preferencia de UI.
Este cambio es puramente de la capa de presentación cliente; no toca RLS, cookies, tipos ni esquema,
y no altera quién ve qué. No hay datos sensibles (salud) involucrados.

## Goals / Non-Goals

**Goals:**
- Que cambiar de logia en el header actualice en pantalla la tabla de `/admin` y las vistas de
  `/tenidas` sin recarga completa.
- Eliminar la doble fuente de verdad en `AdminClient` (fetch cliente + `setState` conviviendo con
  `router.refresh()`), unificando en el servidor como única fuente.
- Alinear `AdminClient` y `TenidasClient` con el patrón ya probado de `TesoreriaClient`.

**Non-Goals:**
- No modificar el selector, la cookie ni la resolución/validación de la logia activa en el servidor.
- No introducir librerías de estado ni data-fetching cliente adicional.
- No cambiar `/tesoreria`, `/cumplimientos` ni `/dashboard`.
- No cambios visuales ni de DESIGN.md.

## Decisions

### Decisión 1: Props del servidor como única fuente de verdad (patrón C)

Renderizar los datos de la logia directamente desde props en `AdminClient` y `TenidasClient`,
eliminando los `useState(props)` que los ensombrecen.

- `AdminClient`: eliminar `const [logia, setLogia] = useState(initialLogia)` y
  `const [usuarios, setUsuarios] = useState(initialUsuarios)`; usar `logia`/`usuarios` de props
  directamente. Renombrar parámetros para que ya no lleven el prefijo `initial`.
- `TenidasClient`: eliminar `useState` de `tenidas`, `miembros`, `asistencias`; usarlos de props.
  El estado de UI puramente local (`sel`, `nueva`, `enviando`, `error`) SÍ permanece como `useState`
  —no proviene del servidor.

**Rationale:** en el App Router el servidor ya recomputa los datos en cada `router.refresh()` y
navegación; duplicarlos en estado cliente crea exactamente esta clase de bug de sincronización.
Es el patrón que `TesoreriaClient` ya aplica en este mismo proyecto.

**Alternativas consideradas:**
- **`key={logiaId}` en el server component** para remontar la isla al cambiar de logia: una línea,
  pero no arregla la doble fuente de verdad y remonta todo el subárbol (pierde estado de formularios
  al vuelo). Rechazada por tratar el síntoma, no la causa.
- **`useEffect` que sincroniza props → estado**: mantiene el anti-patrón de "derived state",
  introduce un render con datos viejos antes de sincronizar y no unifica los mecanismos de refresco.
  Rechazada.

### Decisión 2: Mutaciones vía `router.refresh()`

Sustituir la función `refrescar()` (que hace `createClient()` + fetch + `setState`) por
`router.refresh()` en ambos clientes.

- `AdminClient.refrescar()` → `router.refresh()`. Los callbacks `onSave` de `PalabraClave` y el
  `refrescar` tras editar/guardar hermanos pasan a `router.refresh()`. `alCrearLogia` ya usa
  `router.refresh()`; queda consistente.
- `TenidasClient.refrescar()` → `router.refresh()` (crear tenida, registrar asistencia). Ya se
  usa `useRouter`; si no, importarlo.

**Rationale:** el servidor vuelve a leer con RLS y devuelve el estado canónico; se elimina la lógica
de fetch cliente redundante y sus posibles divergencias.

## Risks / Trade-offs

- **[Se pierde el estado de UI local al refrescar tras mutación]** → Aceptable y deseado: tras crear
  una tenida o cambiar la palabra clave, cerrar el formulario/selección es el comportamiento correcto
  (es lo que hoy hace `setSel(null)` en tenidas y lo que hace tesorería).
- **[Latencia percibida: `router.refresh()` va al servidor]** → Es un round-trip de servidor como ya
  lo es en `/tesoreria`; el volumen (hermanos/tenidas de una logia) es pequeño. Sin mitigación
  especial necesaria.
- **[Regresión si algún subcomponente dependía de que `usuarios`/`tenidas` fueran estado mutable]**
  → Revisar que ningún hijo llame a un setter de esos datos; los setters se eliminan, así que el
  typecheck detecta cualquier uso restante.

## Migration Plan

Cambio de código cliente sin migración de datos ni de esquema. Despliegue normal (Vercel). Rollback
= revertir el commit. Verificación manual: como admin global, en `/admin` y `/tenidas`, cambiar de
logia en el header y confirmar que la tabla cambia sin recargar; crear una tenida y registrar una
asistencia y confirmar que la vista se actualiza.

## Open Questions

Ninguna.
