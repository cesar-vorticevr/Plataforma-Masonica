## 1. AdminClient — props como única fuente de verdad

- [x] 1.1 Eliminar `const [logia, setLogia] = useState(initialLogia)` y `const [usuarios, setUsuarios] = useState(initialUsuarios)`; renombrar los props a `logia` y `usuarios` y usarlos directamente en el render
- [x] 1.2 Reemplazar el cuerpo de `refrescar()` (fetch cliente + `setState`) por `router.refresh()`; asegurar que `useRouter` esté importado y usado
- [x] 1.3 Actualizar los callbacks que llamaban a `refrescar`/setters (p. ej. `PalabraClave onSave`, guardado de hermanos) para que usen `router.refresh()`; confirmar que `alCrearLogia` sigue con `router.refresh()`
- [x] 1.4 Eliminar imports muertos que queden (p. ej. `createClient`, `adminGetLogia`, `adminListUsuarios` si ya no se usan en el cliente)

## 2. TenidasClient — props como única fuente de verdad

- [x] 2.1 Eliminar `useState` de `tenidas`, `miembros` y `asistencias`; usar los props directamente; conservar el estado de UI local (`sel`, `nueva`, `enviando`, `error`)
- [x] 2.2 Reemplazar el cuerpo de `refrescar()` por `router.refresh()` (crear tenida, registrar asistencia); mantener el cierre de selección/formulario si corresponde tras la mutación; importar/usar `useRouter`
- [x] 2.3 Eliminar imports muertos que queden (`listTenidas`, `listMiembros`, `listAsistencias`; `createClient` se conserva porque `addTenida`/`setAsistencia` lo usan)

## 3. Verificación

- [x] 3.1 Verificación manual como admin global: en `/admin`, cambiar de logia en el selector del header y confirmar que la tabla "Hermanos de …" y el nombre de la logia cambian sin recargar la página (aceptada por el usuario; pendiente smoke test en sesión con credenciales master)
- [x] 3.2 Verificación manual como admin global: en `/tenidas`, cambiar de logia en el header y confirmar que el listado de tenidas y de miembros cambia sin recargar (aceptada por el usuario; pendiente smoke test en sesión con credenciales master)
- [x] 3.3 Verificación de mutaciones: crear una tenida y registrar una asistencia en `/tenidas`, y cambiar la palabra clave en `/admin`; confirmar que la vista se actualiza vía `router.refresh()` (aceptada por el usuario; pendiente smoke test en sesión con credenciales master)
- [x] 3.4 Confirmar cumplimiento de DESIGN.md: sin cambios visuales, mismos primitivos/tokens; no se introducen colores/fuentes/tamaños nuevos (diff solo toca lógica de estado e imports, sin JSX/clases)
- [x] 3.5 Ejecutar `npm run typecheck`, `npm run lint` y `npm run check:encoding` dentro de `plataforma-masonica/` y dejarlos en verde
