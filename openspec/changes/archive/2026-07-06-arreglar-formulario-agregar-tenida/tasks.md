## 1. Capa de datos (lib/data/tenidas.ts)

- [x] 1.1 Cambiar `addTenida` para devolver el resultado con error (p. ej. `Promise<{ error: PostgrestError | null }>`) en vez de `void`; retornar el `{ error }` del `insert`.
- [x] 1.2 Cambiar `setAsistencia` para devolver el `{ error }` del `upsert` (mismo patrón).
- [x] 1.3 Confirmar que las firmas siguen el estilo de otras funciones que ya devuelven `{ error }` (p. ej. `subir` en `lib/data/trabajos.ts`).

## 2. Server Component (app/(app)/tenidas/page.tsx)

- [x] 2.1 Importar `esGlobal` (`lib/roles`) y `adminListLogias` (`lib/data/identidad`); calcular `global = esGlobal(perfil.rol)`.
- [x] 2.2 Resolver `logias = global ? await adminListLogias(supabase) : []` y `defaultLogiaId = global ? (logias[0]?.id ?? "") : perfil.logia_id`.
- [x] 2.3 Ejecutar `listTenidas/listMiembros/listAsistencias` SOLO si `defaultLogiaId !== ""`; en caso contrario pasar arreglos vacíos (no consultar con id vacío).
- [x] 2.4 Pasar `global`, `defaultLogiaId` e `initialLogias` como props a `TenidasClient` (además de tenidas/miembros/asistencias).

## 3. Isla cliente (app/(app)/tenidas/TenidasClient.tsx)

- [x] 3.1 Ampliar props: `global: boolean`, `defaultLogiaId: string`, `logias: Logia[]`.
- [x] 3.2 Añadir estado `logiaSel` (init `defaultLogiaId`) y estado local de `tenidas/miembros/asistencias` (sembrado con las props).
- [x] 3.3 Implementar `refrescar(id)` que recarga tenidas/miembros/asistencias con el cliente de navegador y actualiza estado + `logiaSel` (espejo de `AdminClient.refrescar`).
- [x] 3.4 Renderizar un `<Select>` de logias en el slot `action` del `PageTitle`, SOLO si `global`; su `onChange` llama a `refrescar(id)`.
- [x] 3.5 `crear()`: usar `logiaSel` (no `user.logia_id`); validar `logiaSel !== ""` y campos; capturar el `{ error }` de `addTenida`; si hay error mostrar mensaje y no limpiar; si éxito, limpiar formulario y `refrescar(logiaSel)`.
- [x] 3.6 Añadir estado de envío (p. ej. `enviando`) y deshabilitar el `Button` "Agregar tenida" mientras dura la operación.
- [x] 3.7 `marcar()`: capturar el `{ error }` de `setAsistencia`, mostrar mensaje en caso de fallo y refrescar en caso de éxito.
- [x] 3.8 Añadir un espacio de mensaje de error accesible (texto con token `rose` existente) cerca del formulario de alta.
- [x] 3.9 Estado vacío para global sin logias (`defaultLogiaId === ""` y `logias.length === 0`): mensaje claro, sin selector inútil (patrón `AdminClient`).

## 4. Verificación

- [x] 4.1 Verificar cumplimiento de `DESIGN.md`: solo primitivos existentes (`PageTitle`/`action`, `Select`, `Button`, `Input`), sin tokens/colores/fuentes nuevos; apoyarse en las skills de diseño (impeccable / ui-ux-pro-max). Confirmar que la cabecera del secretario no cambia.
- [x] 4.2 Verificación en capa de datos (Supabase local): causa raíz reproducida (`logia_id=''` → `invalid input syntax for type uuid`), insert con logia válida OK, 3 logias sembradas para el selector. Pendiente por el usuario: click-through en navegador logueado como master (seleccionar logia, crear tenida, pasar lista, cambiar de logia).
- [x] 4.3 Revisar RLS/aislamiento (sin cambios de backend): confirmado por inspección de políticas que la escritura del secretario sigue acotada a su logia y que el global (master) escribe la logia seleccionada; un fallo de RLS ahora muestra mensaje en vez de silencio.
- [x] 4.4 `npm run typecheck`, `npm run lint` y `npm run check:encoding` (dentro de `plataforma-masonica/`) en verde.
