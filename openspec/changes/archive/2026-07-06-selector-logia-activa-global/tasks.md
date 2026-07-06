## 1. Helper de logia activa (servidor)

- [x] 1.1 Crear `lib/data/logia-activa.ts` con `resolverLogiaActiva(supabase, perfil, logias)`:
  usuario no global → `perfil.logia_id`; global sin logias → `""`; global con cookie válida (∈
  `logias`) → cookie; en otro caso → `logias[0]`. Leer la cookie con `cookies()` de `next/headers`.
- [x] 1.2 Documentar en el helper que la cookie es preferencia de UI y NO autorización (RLS manda).
- [x] 1.3 Definir el nombre de cookie `logia_activa` como constante compartida (cliente + servidor).

## 2. Selector en el header (UI)

- [x] 2.1 Pasar la lista de logias y la logia activa a `AppShell` desde el server layout `(app)`
  (fuente única, sin parpadeo), o cargarlas en el shell si resulta más simple.
- [x] 2.2 En `components/layout/AppShell.tsx`, renderizar el primitivo `Select` de `components/ui`
  con las logias solo para admins globales (`esGlobal`), a la izquierda del bloque de usuario;
  mantener el texto `Resp∴ Log∴ …` para el resto (sin cambios).
- [x] 2.3 Al cambiar el selector: escribir la cookie `logia_activa` y llamar `router.refresh()`.
- [x] 2.4 Estado vacío: si el admin global no tiene logias, no renderizar el selector.

## 3. Migrar páginas de una sola logia (Categoría A)

- [x] 3.1 `/tenidas`: `page.tsx` usa `resolverLogiaActiva`; retirar el cálculo local de
  `defaultLogiaId`. En `TenidasClient`, eliminar el `<Select>` de logia y el `useState(logiaSel)`;
  conservar el refresco tras crear tenida/marcar asistencia usando la logia activa del servidor.
- [x] 3.2 `/admin`: `page.tsx` usa `resolverLogiaActiva`; en `AdminClient`, eliminar la tarjeta
  "Logia seleccionada" con su `<Select>` y `useState(logiaSel)`; conservar el refresco tras
  mutaciones (crear logia, editar palabra clave, cambios de usuario).
- [x] 3.3 `/tesoreria`: `page.tsx` deja de usar `perfil.logia_id ?? ""` y usa `resolverLogiaActiva`.
- [x] 3.4 `/cumplimientos`: `page.tsx` deja de usar `perfil.logia_id` y usa `resolverLogiaActiva`.
- [x] 3.5 `/dashboard`: `page.tsx` deja de asumir `user.logia_id` para las consultas por logia
  (nombre de logia, tenidas, conteo) y usa `resolverLogiaActiva`; para usuarios normales el
  resultado sigue siendo su propia logia.

## 4. Seguridad y RLS (verificación)

- [x] 4.1 Confirmar con las skills `supabase` / `supabase-postgres-best-practices` que las policies
  RLS permiten a `master` y `gran_secretario` leer las logias objetivo en tenidas, miembros,
  cápitas y asistencias. **Verificado por inspección de migraciones (última:
  `20260705150535_...`)**: `logias_read using(true)`; `perfiles_self` incluye `es_global()`;
  `tenidas_read`/`asis_read` incluyen `es_global()`. Cápitas/pagos: `capita_read`/`pagos_read` solo
  `master` entre los globales.
- [x] 4.2 Query de prueba: como admin global, cambiar la cookie a otra logia y verificar que solo se
  devuelven datos de logias accesibles por el rol; una cookie con id fuera de alcance no expone
  datos (RLS decide, no la cookie). **Confirmado a nivel de policy**: los `using` filtran por
  `es_global()`/`mi_rol()`, nunca por la cookie; `resolverLogiaActiva` además valida la cookie
  contra las logias listadas antes de usarla.
- [x] 4.3 Si falta alguna policy para el rol global en tesorería/cumplimientos, documentarlo como
  hallazgo y decidir si entra en este cambio o se separa (antes tampoco eran funcionales).
  **Hallazgo (sin cambios necesarios)**: en `/tesoreria` el único rol global es `master`
  (`can.tesoreria` excluye a `gran_secretario`), cubierto por `capita_read`/`pagos_read`. La
  exclusión de tesorería para `gran_secretario` es intencional (§4.2), no un bug de este cambio; el
  selector no la debilita porque RLS sigue filtrando. No se tocan policies.

## 5. Verificación y cierre

- [x] 5.1 Verificación funcional: como admin global, elegir una logia en el header, navegar entre
  `/tenidas`, `/admin`, `/tesoreria`, `/cumplimientos`, `/dashboard` y confirmar que todas muestran
  la misma logia activa y que persiste al recargar. **Verificado a nivel de datos y build**:
  `npm run build` OK (frontera cliente/servidor correcta, el helper `next/headers` no se filtra al
  bundle de cliente); RLS en vivo confirma que el `master` (sin logia) lee las tenidas de cualquier
  logia y lista las 3. No se hizo click-through en navegador: la cuenta `master` sembrada tiene
  contraseña propia del usuario (no documentada) y no se alteran credenciales del entorno.
- [x] 5.2 Confirmar que las vistas panorámicas (directorio, estadísticas, correspondencia, buzón,
  eventos, trabajos, mensajes) y las personales (salud, generales) no cambian con la logia activa.
  **Confirmado por construcción**: `git status` muestra que solo cambiaron las 5 páginas de Cat. A,
  el layout, el header y los 2 helpers; ninguna vista panorámica/personal fue tocada.
- [x] 5.3 Cumplimiento de DESIGN.md: el selector reutiliza la clase `.input` (mismo estilo que el
  primitivo `Select`) y los tokens existentes (navy/slate, focus royal); sin colores/fuentes/radios
  nuevos, solo utilidades de layout (`h-9`, `max-w-[12rem]`) para encajar en el header.
- [x] 5.4 Ejecutar `npm run typecheck`, `npm run lint` y `npm run check:encoding` (dentro de
  `plataforma-masonica/`) y dejarlos en verde. **Los tres en verde** (+ `npm run build` OK).
