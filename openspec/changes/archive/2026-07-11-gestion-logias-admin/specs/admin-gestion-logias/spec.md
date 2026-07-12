## ADDED Requirements

### Requirement: Listado de logias en /admin (solo admin global)

El sistema SHALL mostrar en `/admin`, únicamente a un administrador global (`master` o
`gran_secretario`), un listado de **todas** las logias con su nombre, número, oriente y estado
(`activa`/`inactiva`). Ningún rol no global (secretario, tesorero, hermano) SHALL ver este listado
ni las acciones de gestión de logias. La visibilidad de los datos SHALL respaldarse en el servidor
(RLS `logias_read` para lectura; las mutaciones por RPC con guard `es_global()`), no solo en la UI.

#### Scenario: Admin global ve todas las logias
- **GIVEN** un usuario con rol `master`
- **WHEN** abre `/admin`
- **THEN** ve una tabla con todas las logias (nombre, número, oriente, estado)
- **AND** cada fila ofrece la acción "Editar"

#### Scenario: Un rol no global no ve la gestión de logias
- **GIVEN** un usuario con rol `secretario`
- **WHEN** abre `/admin`
- **THEN** NO ve la tabla de logias ni la acción de editarlas
- **AND** solo ve la gestión de los hermanos de su propia logia

### Requirement: Editar los datos básicos de una logia (solo admin global)

El sistema SHALL permitir a un administrador global editar el **nombre**, el **número** y el
**oriente** de una logia existente. La autorización SHALL aplicarse en el servidor mediante una RPC
`security definer` con guard `es_global()`, no solo en la UI. La edición SHALL exigir nombre no
vacío, número entero y oriente no vacío; si falta cualquiera, la operación NO se realiza. La palabra
clave de la logia NO se modifica desde esta operación (se gestiona por separado con
`set_palabra_logia`).

#### Scenario: Admin global corrige los datos de una logia
- **GIVEN** un usuario con rol `master` y una logia "Luz y Verdad" N.° 12
- **WHEN** edita el nombre a "Luz y Verdad Restaurada" y guarda
- **THEN** el sistema actualiza la logia y el nuevo nombre aparece en la tabla y en el selector
- **AND** la palabra clave de la logia permanece sin cambios

#### Scenario: Un rol no global no puede editar logias
- **GIVEN** un usuario con rol `tesorero`
- **WHEN** intenta invocar la edición de una logia
- **THEN** el servidor rechaza la operación por falta de autorización

#### Scenario: Datos incompletos rechazados
- **GIVEN** un admin global editando una logia
- **WHEN** deja el oriente vacío e intenta guardar
- **THEN** el sistema no actualiza la logia
- **AND** la UI indica que el oriente es obligatorio

### Requirement: El número de logia es único al editar

Al editar una logia, el sistema SHALL rechazar un número que ya use **otra** logia. Conservar el
mismo número de la logia editada SHALL estar permitido. La unicidad SHALL garantizarse en la base de
datos (restricción única en `logias.numero`) además de validarse en la RPC de edición.

#### Scenario: Número duplicado rechazado al editar
- **GIVEN** dos logias, N.° 12 y N.° 27
- **WHEN** un admin global intenta cambiar el número de la segunda a 12
- **THEN** el sistema rechaza la operación y la logia conserva su número anterior
- **AND** la UI indica que el número ya está en uso

#### Scenario: Editar sin cambiar el número es válido
- **GIVEN** una logia N.° 12
- **WHEN** un admin global cambia solo el oriente y deja el número en 12
- **THEN** el sistema actualiza la logia sin error de duplicado

### Requirement: Activar y desactivar una logia (solo admin global)

El sistema SHALL permitir a un administrador global cambiar el estado de una logia entre `activa` e
`inactiva` mediante una RPC `security definer` con guard `es_global()`. Una logia `inactiva` es una
logia **archivada**: deja de admitir registros nuevos, pero NO se elimina, NO se oculta a los
administradores y NO afecta el acceso de los hermanos ya validados.

#### Scenario: Admin global desactiva una logia
- **GIVEN** un usuario con rol `master` y una logia `activa`
- **WHEN** la desactiva desde el modal de edición
- **THEN** la logia queda en estado `inactiva`
- **AND** sigue apareciendo en la tabla de `/admin` y en el selector del header

#### Scenario: Reactivar una logia
- **GIVEN** una logia `inactiva`
- **WHEN** un admin global la activa
- **THEN** la logia vuelve a estado `activa` y admite registros nuevos otra vez

#### Scenario: Los hermanos de una logia inactiva conservan su acceso
- **GIVEN** una logia `inactiva` con hermanos validados
- **WHEN** un hermano de esa logia inicia sesión
- **THEN** conserva su acceso normal a la plataforma sin cambios por el estado de la logia

### Requirement: Desactivar la logia activa no rompe la vista de administración

El sistema SHALL refrescar el estado desde el servidor y revalidar la cookie de logia activa cuando
el administrador global desactiva o edita la **logia activa** (la seleccionada en el header). Como
una logia inactiva sigue siendo accesible para el admin, la logia activa NO cambia por desactivarla;
la vista permanece consistente.

#### Scenario: Desactivar la logia actualmente activa
- **GIVEN** un admin global cuya logia activa es "Renacimiento" N.° 27
- **WHEN** desactiva esa misma logia
- **THEN** la operación se completa y la vista de `/admin` se refresca sin errores
- **AND** "Renacimiento" sigue siendo la logia activa (ahora `inactiva`) y visible en el selector
