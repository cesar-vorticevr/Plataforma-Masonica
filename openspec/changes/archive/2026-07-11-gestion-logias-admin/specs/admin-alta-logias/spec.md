## MODIFIED Requirements

### Requirement: Validación de los datos de la logia

El sistema SHALL requerir nombre no vacío, número entero, oriente no vacío y palabra clave no
vacía para crear una logia. El número SHALL ser **único**: el sistema NO SHALL crear una logia con
un número ya usado por otra logia. La unicidad SHALL garantizarse en la base de datos (restricción
única en `logias.numero`) además de validarse en la RPC `crear_logia`. Si falta cualquier dato
obligatorio o el número está duplicado, la operación NO se realiza.

#### Scenario: Falta la palabra clave
- **GIVEN** un admin global en la tarjeta "Crear logia"
- **WHEN** deja la palabra clave vacía e intenta crear
- **THEN** el sistema no crea la logia
- **AND** la UI indica que la palabra clave es obligatoria

#### Scenario: Número de logia duplicado rechazado
- **GIVEN** una logia existente N.° 12
- **WHEN** un admin global intenta crear otra logia con número 12
- **THEN** el sistema no crea la logia
- **AND** la UI indica que el número ya está en uso
