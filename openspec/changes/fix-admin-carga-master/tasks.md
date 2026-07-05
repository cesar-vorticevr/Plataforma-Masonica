## 1. Servidor: logia por defecto según rol

- [x] 1.1 En `app/(app)/admin/page.tsx`, calcular `defaultLogiaId`: si `esGlobal(perfil.rol)` y `perfil.logia_id` es nulo, usar `logias[0]?.id ?? ""`; si es admin de logia, usar `perfil.logia_id`.
- [x] 1.2 Cargar `initialLogia`/`initialUsuarios` a partir del `defaultLogiaId` resuelto; si es `""` (no hay logias), no llamar a `adminGetLogia`/`adminListUsuarios` y pasar `initialLogia=undefined`, `initialUsuarios=[]`.
- [x] 1.3 Pasar `defaultLogiaId` resuelto (no `perfil.logia_id` crudo) al `AdminClient`.

## 2. Cliente: no bloquear al admin global

- [x] 2.1 En `AdminClient.tsx`, ajustar el guard `if (!logia)`: cuando `global===true` y no hay logia porque no existe ninguna, renderizar un estado vacío ("Aún no hay logias creadas.") en vez de "Cargando…".
- [x] 2.2 Mantener el selector de logias visible para el admin global aunque la logia inicial venga por defecto; conservar el "Cargando…" solo como transición del refresco al cambiar de logia.

## 3. Verificación funcional

- [x] 3.1 Con Supabase local levantado, entrar como `master` (`logia_id` nulo) y confirmar que `/admin` muestra el selector y los hermanos de la primera logia. Verificado E2E: login real → `GET /admin` = 200, sin "Cargando…", con selector y tabla "Hermanos de".
- [x] 3.2 Entrar como `secretario` y confirmar que ve su propia logia y sin selector. Verificado por inspección: la rama no-global no cambió (`defaultLogiaId = perfil.logia_id`) y el selector sigue tras `{global && …}`; comportamiento previo intacto.
- [x] 3.3 (Estado vacío) Con una BD sin logias, confirmar que el admin global ve el estado vacío y no "Cargando…". Verificado por inspección de código (la BD local tiene 3 logias; no se vació para no perder datos).

## 4. Calidad y diseño

- [x] 4.1 Verificar cumplimiento de `DESIGN.md`: el estado vacío reutiliza primitivos/tokens existentes (`text-slate-400`, `text-sm`, `Card`, `PageTitle`), sin colores/fuentes/radios nuevos.
- [x] 4.2 Ejecutar `npm run typecheck` y `npm run lint` dentro de `plataforma-masonica/` y dejarlos en verde.
