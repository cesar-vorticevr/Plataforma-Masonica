# admin-alta-logias Specification

## Purpose
TBD - created by archiving change admin-crear-logias. Update Purpose after archive.
## Requirements
### Requirement: Crear una logia (solo admin global)

El sistema SHALL permitir crear una logia únicamente a un administrador global
(`master` o `gran_secretario`). La autorización SHALL aplicarse en el servidor mediante la RPC
`security definer` (guard `es_global()`) y RLS (`logias_admin`), no solo en la UI. Cualquier otro
rol NO debe poder crear logias.

#### Scenario: Admin global crea una logia
- **GIVEN** un usuario con rol `master`
- **WHEN** envía nombre, número, oriente y palabra clave de una nueva logia
- **THEN** el sistema crea la logia y devuelve su identificador
- **AND** la nueva logia aparece en el selector de `/admin` y queda seleccionada

#### Scenario: Un rol no global no puede crear logias
- **GIVEN** un usuario con rol `secretario`
- **WHEN** intenta invocar la creación de una logia
- **THEN** el servidor rechaza la operación por falta de autorización
- **AND** la UI de `/admin` no ofrece la opción de crear logias a ese rol

### Requirement: La palabra clave de la logia se guarda cifrada

Al crear una logia, el sistema SHALL almacenar la palabra clave como **hash bcrypt** (nunca en
texto plano), normalizada en minúsculas y sin espacios, igual que `set_palabra_logia`. La palabra
clave en claro NUNCA debe persistirse ni devolverse en respuestas.

#### Scenario: La palabra clave nueva queda como hash y permite el registro
- **GIVEN** un admin global que crea la logia "Aurora" N.° 42 con palabra clave "Jakin"
- **WHEN** la logia se crea
- **THEN** el valor almacenado en `logias.palabra_clave` es un hash bcrypt, no "Jakin"
- **AND** un hermano puede registrarse en "Aurora" usando "Jakin" (insensible a mayúsculas/espacios)

### Requirement: Validación de los datos de la logia

El sistema SHALL requerir nombre no vacío, número entero, oriente no vacío y palabra clave no
vacía para crear una logia. Si falta cualquiera, la operación NO se realiza.

#### Scenario: Falta la palabra clave
- **GIVEN** un admin global en la tarjeta "Crear logia"
- **WHEN** deja la palabra clave vacía e intenta crear
- **THEN** el sistema no crea la logia
- **AND** la UI indica que la palabra clave es obligatoria

