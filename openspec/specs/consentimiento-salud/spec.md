# consentimiento-salud Specification

## Purpose
TBD - created by archiving change cumplimiento-consentimiento-salud. Update Purpose after archive.
## Requirements
### Requirement: Consentimiento previo forzado en el servidor

El sistema SHALL impedir en el servidor guardar una evaluación de salud si el usuario no tiene un
consentimiento vigente (con la versión de aviso actual) registrado. La restricción NO debe depender
solo de la interfaz.

#### Scenario: Insertar evaluación sin consentimiento
- **GIVEN** un hermano sin consentimiento registrado para la versión de aviso vigente
- **WHEN** intenta insertar una evaluación de salud (incluso por API directa)
- **THEN** la operación es rechazada por el servidor

#### Scenario: Insertar evaluación con consentimiento vigente
- **GIVEN** un hermano con consentimiento de la versión vigente registrado
- **WHEN** guarda una evaluación de salud propia
- **THEN** la operación se permite

### Requirement: Evidencia del consentimiento

El sistema SHALL registrar cada consentimiento con fecha, versión del aviso e IP de origen. La IP
SHALL capturarse en el servidor, no confiarse al cliente.

#### Scenario: Registro de consentimiento captura evidencia
- **GIVEN** un hermano que acepta el aviso de privacidad
- **WHEN** se registra su consentimiento
- **THEN** la fila incluye `version_aviso`, `fecha` e `ip`

### Requirement: Derechos ARCO y revocación in-app

El sistema SHALL ofrecer al hermano, dentro de la plataforma, revocar su consentimiento, exportar sus
datos y solicitar el borrado de sus evaluaciones de salud. Revocar el consentimiento SHALL impedir
registrar nuevas evaluaciones hasta volver a consentir.

#### Scenario: Revocar consentimiento bloquea nuevas evaluaciones
- **GIVEN** un hermano que revoca su consentimiento desde la app
- **WHEN** intenta guardar una nueva evaluación de salud
- **THEN** la operación es rechazada hasta que vuelva a consentir

#### Scenario: Borrado de datos de salud propios
- **GIVEN** un hermano que solicita el borrado de sus evaluaciones
- **WHEN** confirma la acción
- **THEN** sus evaluaciones de salud se eliminan y deja de haber datos sensibles suyos

#### Scenario: Exportar mis datos
- **GIVEN** un hermano autenticado
- **WHEN** solicita exportar sus datos
- **THEN** obtiene sus propios datos (incluida su salud) en un formato descargable

