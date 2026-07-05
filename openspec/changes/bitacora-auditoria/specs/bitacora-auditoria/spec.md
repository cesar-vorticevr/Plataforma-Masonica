## ADDED Requirements

### Requirement: Registro de acciones administrativas

El sistema SHALL registrar en una bitácora de auditoría cada acción administrativa, con el actor
(`auth.uid()`), la acción, la entidad afectada, un detalle, la IP y la fecha. El registro SHALL
ocurrir en el servidor como parte de la operación.

#### Scenario: Designar secretario queda registrado
- **GIVEN** un admin global que designa secretario a un hermano
- **WHEN** la operación se completa
- **THEN** existe una fila de auditoría con actor, acción "designar_secretario", la entidad/usuario y la fecha

#### Scenario: Crear logia y cambiar palabra clave quedan registrados
- **GIVEN** un admin global que crea una logia y fija su palabra clave
- **WHEN** las operaciones se completan
- **THEN** existen filas de auditoría correspondientes (sin exponer la palabra clave en claro)

#### Scenario: Validar/bloquear un hermano queda registrado
- **GIVEN** un secretario que valida (asigna grado) o bloquea a un hermano
- **WHEN** la operación se completa
- **THEN** existe una fila de auditoría con la acción y el usuario afectado

### Requirement: Registro de accesos a datos sensibles

El sistema SHALL registrar cada acceso a datos sensibles agregados de salud (quién, cuándo, alcance),
sin almacenar datos individuales en la bitácora.

#### Scenario: Consulta de estadísticas de salud auditada
- **GIVEN** un administrador que consulta las estadísticas agregadas de salud
- **WHEN** se ejecuta la consulta
- **THEN** existe una fila de auditoría del acceso (actor, alcance, fecha) sin datos individuales

### Requirement: Bitácora append-only con lectura restringida

La bitácora SHALL ser de solo inserción (sin actualización ni borrado por usuarios) y su lectura
SHALL estar restringida a los roles autorizados (Master). Ningún rol ordinario puede leerla ni
modificarla.

#### Scenario: Un hermano no puede leer ni alterar la bitácora
- **GIVEN** un hermano o secretario
- **WHEN** intenta leer, actualizar o borrar filas de auditoría
- **THEN** la operación es rechazada por la RLS

#### Scenario: El Master consulta la bitácora
- **GIVEN** un usuario master
- **WHEN** consulta la bitácora
- **THEN** obtiene las filas de auditoría

### Requirement: Trazabilidad de la validación en el perfil

El sistema SHALL registrar quién validó a cada hermano y cuándo (`validado_por`, `fecha_validacion`),
además de la entrada en la bitácora.

#### Scenario: Validación registra validado_por y fecha
- **GIVEN** un secretario que valida a un hermano
- **WHEN** la validación se completa
- **THEN** el perfil del hermano tiene `validado_por` y `fecha_validacion` fijados
