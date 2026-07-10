# logia-activa Specification

## Purpose
La logia sobre la que opera un administrador global (master / gran_secretario, que no pertenece a
ninguna logia): cómo se selecciona en el header, se persiste entre navegaciones, se valida en el
servidor y qué páginas gobierna. La selección es preferencia de interfaz; el aislamiento real de
datos lo garantiza RLS en el servidor.

## Requirements
### Requirement: Selector de logia activa en el header para administradores globales

El sistema SHALL mostrar un selector de logia en el header, a la izquierda del bloque de usuario,
únicamente a los administradores globales (rol `master` o `gran_secretario`, que no pertenecen a
ninguna logia). Para cualquier otro usuario, el header SHALL seguir mostrando su logia como texto,
sin selector.

#### Scenario: Admin global ve el selector
- **WHEN** un usuario con rol `master` o `gran_secretario` abre cualquier página de la aplicación
- **THEN** el header muestra un selector con todas las logias existentes y la logia activa marcada

#### Scenario: Usuario de logia no ve selector
- **WHEN** un `secretario`, `tesorero` o hermano abre la aplicación
- **THEN** el header muestra su logia como texto (Resp∴ Log∴ …) y no muestra ningún selector

#### Scenario: Admin global sin logias creadas
- **WHEN** un admin global abre la aplicación y no existe ninguna logia
- **THEN** el header no muestra selector y las páginas que operan sobre una logia muestran un estado
  vacío claro en lugar de consultar con un identificador vacío

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

### Requirement: Validación de la logia activa en el servidor

El servidor SHALL resolver la logia activa leyendo la cookie y validando que apunte a una logia
existente y accesible por el rol del usuario; si la cookie falta, es inválida o apunta a una logia
inexistente, el servidor SHALL usar la primera logia disponible (`logias[0]`) como valor por defecto.
El aislamiento real de datos SHALL seguir garantizado por RLS en el servidor, con independencia del
valor de la cookie.

#### Scenario: Cookie apunta a una logia borrada
- **WHEN** la cookie `logia_activa` referencia una logia que ya no existe
- **THEN** el servidor cae a la primera logia disponible y no falla la carga de la página

#### Scenario: La cookie no otorga acceso indebido
- **WHEN** la cookie contiene un identificador de logia manipulado
- **THEN** RLS del servidor decide qué datos se devuelven, y una logia fuera del alcance del rol no
  expone datos aunque la cookie la nombre

### Requirement: Alcance de la logia activa por página

La logia activa SHALL gobernar únicamente las páginas que operan sobre una sola logia:
`/tenidas`, `/admin`, `/tesoreria`, `/cumplimientos` y `/dashboard`. Las vistas panorámicas
(directorio, estadísticas, correspondencia, buzón, eventos, trabajos, mensajes) y las personales
(salud, generales) SHALL conservar su alcance actual y NO cambiar según la logia activa.

#### Scenario: Páginas de una sola logia siguen la logia activa
- **WHEN** un admin global con una logia activa seleccionada abre `/tenidas`, `/admin`,
  `/tesoreria`, `/cumplimientos` o `/dashboard`
- **THEN** cada página carga los datos correspondientes a la logia activa

#### Scenario: Admin global opera páginas antes rotas
- **WHEN** un admin global (sin `logia_id`) abre `/tesoreria`, `/cumplimientos` o `/dashboard` con
  una logia activa seleccionada
- **THEN** la página muestra los datos de esa logia en lugar de quedar vacía

#### Scenario: Las vistas panorámicas no cambian
- **WHEN** un admin global cambia la logia activa y abre directorio o estadísticas
- **THEN** esas vistas siguen mostrando todas las logias que su rol puede ver, sin filtrar por la
  logia activa
