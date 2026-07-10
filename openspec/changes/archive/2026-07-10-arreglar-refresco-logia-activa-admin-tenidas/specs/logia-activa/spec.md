## MODIFIED Requirements

### Requirement: Persistencia de la logia activa en cookie

El sistema SHALL persistir la logia activa del administrador global en una cookie (`logia_activa`)
legible por los componentes de servidor, de modo que la elección se conserve al navegar entre
páginas. La cookie SHALL considerarse preferencia de interfaz y NUNCA una fuente de autorización.

Al cambiar de logia, el refresco SHALL actualizar los datos visibles en pantalla de la página actual
**sin requerir una recarga completa del navegador**. Las islas cliente de las páginas de una sola
logia SHALL renderizar los datos de la logia (listados, tablas) directamente desde los props que
provee el componente de servidor, y NO SHALL ensombrecerlos con estado local sembrado una sola vez en
el montaje; así `router.refresh()` refleja de inmediato la logia elegida.

#### Scenario: La elección persiste al navegar
- **WHEN** un admin global selecciona una logia en el header y navega a otra página que opera sobre
  una sola logia
- **THEN** la nueva página carga los datos de la logia seleccionada, no de `logias[0]`

#### Scenario: Cambiar de logia refresca los datos
- **WHEN** un admin global elige una logia distinta en el selector del header
- **THEN** el sistema escribe la cookie `logia_activa` y refresca los datos de la página actual para
  reflejar la logia elegida

#### Scenario: La tabla de /admin se actualiza sin recarga completa
- **WHEN** un admin global está en `/admin` viendo los hermanos de una logia y elige otra logia en el
  selector del header
- **THEN** la tabla "Hermanos de …" y el nombre de la logia se actualizan a la logia elegida sin que
  el usuario recargue la página

#### Scenario: La vista de /tenidas se actualiza sin recarga completa
- **WHEN** un admin global está en `/tenidas` viendo las tenidas y miembros de una logia y elige otra
  logia en el selector del header
- **THEN** el listado de tenidas y de miembros se actualiza a la logia elegida sin que el usuario
  recargue la página

#### Scenario: Refresco tras una mutación local
- **WHEN** un admin global crea una tenida, registra una asistencia, cambia la palabra clave de la
  logia o realiza otra mutación en `/admin` o `/tenidas`
- **THEN** la página vuelve a leer los datos desde el servidor (vía `router.refresh()`) y muestra el
  estado actualizado de la logia activa
