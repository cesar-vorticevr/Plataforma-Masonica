# aislamiento-logia-escrituras Specification

## Purpose
TBD - created by archiving change fix-aislamiento-logia-escrituras. Update Purpose after archive.
## Requirements
### Requirement: Aislamiento por logia en escritura de pagos

El sistema SHALL permitir a un tesorero o secretario crear/actualizar pagos únicamente de hermanos
de su propia logia; un master puede escribir pagos de cualquier logia. La restricción SHALL aplicarse
en la RLS (`USING` y `WITH CHECK`), no solo en la UI.

#### Scenario: Tesorero escribe pago de otra logia
- **GIVEN** un tesorero de la logia A
- **WHEN** intenta insertar/actualizar un pago cuyo `usuario_id` pertenece a la logia B
- **THEN** la operación es rechazada por la RLS

#### Scenario: Tesorero escribe pago de su logia
- **GIVEN** un tesorero de la logia A
- **WHEN** registra un pago de un hermano de la logia A
- **THEN** la operación se permite

#### Scenario: Master escribe pago de cualquier logia
- **GIVEN** un usuario master
- **WHEN** registra un pago de un hermano de cualquier logia
- **THEN** la operación se permite

### Requirement: Aislamiento por logia en configuración de cápitas

El sistema SHALL permitir a un tesorero o secretario crear/actualizar la configuración de cápita
solo de su propia logia (`logia_id = mi_logia()`); un master puede escribir cualquier logia.

#### Scenario: Secretario configura cápita de otra logia
- **GIVEN** un secretario de la logia A
- **WHEN** intenta hacer upsert de `config_capitas` con `logia_id` de la logia B
- **THEN** la operación es rechazada por la RLS

### Requirement: Aislamiento por logia en tenidas

El sistema SHALL permitir crear/actualizar/borrar tenidas solo al secretario de esa logia
(`logia_id = mi_logia()`) o al master. Un tesorero o Gran Secretario NO debe poder escribir tenidas.

#### Scenario: Secretario crea tenida de otra logia
- **GIVEN** un secretario de la logia A
- **WHEN** intenta crear una tenida con `logia_id` de la logia B
- **THEN** la operación es rechazada por la RLS

#### Scenario: Gran Secretario no escribe tenidas
- **GIVEN** un usuario gran_secretario
- **WHEN** intenta crear o editar una tenida
- **THEN** la operación es rechazada (su alcance es agregado/lectura)

### Requirement: Aislamiento por logia en asistencias

El sistema SHALL permitir registrar asistencia solo al secretario de la logia de esa tenida, o al
master. La restricción SHALL validar que la tenida pertenece a `mi_logia()`.

#### Scenario: Secretario marca asistencia en tenida de otra logia
- **GIVEN** un secretario de la logia A
- **WHEN** intenta marcar asistencia sobre una tenida de la logia B
- **THEN** la operación es rechazada por la RLS

#### Scenario: Secretario marca asistencia en su logia
- **GIVEN** un secretario de la logia A
- **WHEN** marca asistencia en una tenida de la logia A
- **THEN** la operación se permite

