# admin-identidad Specification

## Purpose
TBD - created by archiving change fix-admin-carga-master. Update Purpose after archive.
## Requirements
### Requirement: Selección de logia por defecto en el panel de administración

El panel `/admin` SHALL determinar la logia inicialmente seleccionada según el rol del usuario:
un administrador de logia (`secretario`) usa su propia logia (`perfiles.logia_id`); un
administrador global (`master` o `gran_secretario`), que no pertenece a ninguna logia, usa la
primera logia disponible del listado. El panel NUNCA debe quedar en un estado de carga permanente
por no tener una logia propia.

#### Scenario: Admin global entra y ve la primera logia
- **GIVEN** un usuario con rol `master` cuyo `logia_id` es nulo
- **AND** existe al menos una logia en el sistema
- **WHEN** abre `/admin`
- **THEN** el panel muestra el selector de logias con todas las logias existentes
- **AND** carga por defecto los datos (hermanos y palabra clave) de la primera logia del listado
- **AND** no muestra un estado "Cargando…" indefinido

#### Scenario: Admin de logia entra y ve su propia logia
- **GIVEN** un usuario con rol `secretario` con un `logia_id` asignado
- **WHEN** abre `/admin`
- **THEN** el panel carga los datos de su propia logia
- **AND** no muestra el selector de logias (solo administra la suya)

#### Scenario: Admin global cambia de logia con el selector
- **GIVEN** un admin global viendo el panel `/admin`
- **WHEN** elige otra logia en el selector
- **THEN** el panel refresca los hermanos y la palabra clave de la logia elegida

### Requirement: Estado vacío cuando no existen logias

El panel SHALL mostrar un estado vacío explícito cuando un administrador global abre `/admin` y
todavía no existe ninguna logia en el sistema, en lugar de un estado de carga, de modo que el
administrador entienda que aún no hay logias creadas y no quede bloqueado.

#### Scenario: Admin global sin ninguna logia creada
- **GIVEN** un usuario con rol `master` cuyo `logia_id` es nulo
- **AND** no existe ninguna logia en el sistema
- **WHEN** abre `/admin`
- **THEN** el panel muestra un estado vacío que indica que aún no hay logias
- **AND** no muestra un estado "Cargando…" indefinido

