# admin-designar-secretario Specification

## Purpose
TBD - created by archiving change admin-designar-secretario. Update Purpose after archive.
## Requirements
### Requirement: Designar secretario (solo admin global)

El sistema SHALL permitir designar como secretario de una logia a un hermano validado de esa logia,
únicamente a un administrador global (`master` o `gran_secretario`). La autorización SHALL aplicarse
en el servidor (RPC `security definer` con guard `es_global()`). Un `secretario` o `tesorero` NO debe
poder designar secretarios.

#### Scenario: Admin global designa un secretario
- **GIVEN** un usuario con rol `master`
- **AND** un hermano validado que pertenece a la logia "Renacimiento"
- **WHEN** lo designa secretario
- **THEN** ese hermano pasa a `rol = 'secretario'`

#### Scenario: Un rol no global no puede designar secretarios
- **GIVEN** un usuario con rol `secretario`
- **WHEN** intenta designar secretario a otro hermano
- **THEN** el servidor rechaza la operación por falta de autorización

#### Scenario: Solo se designa a hermanos validados con logia
- **GIVEN** un admin global
- **AND** un usuario en estado `pendiente` o sin logia
- **WHEN** intenta designarlo secretario
- **THEN** el servidor rechaza la operación

### Requirement: Un secretario por logia

Al designar un nuevo secretario, el sistema SHALL degradar automáticamente a `hermano` al secretario
anterior de esa misma logia, de modo que cada logia tenga a lo sumo un secretario a la vez.

#### Scenario: Reemplazo del secretario existente
- **GIVEN** la logia "Renacimiento" cuyo secretario actual es el hermano A
- **WHEN** el admin global designa secretario al hermano B (de la misma logia)
- **THEN** el hermano B queda como `secretario`
- **AND** el hermano A vuelve a `rol = 'hermano'`

### Requirement: Quitar secretario

El sistema SHALL permitir a un admin global quitar el rol de secretario a un usuario, devolviéndolo a
`hermano`, con la misma autorización de servidor.

#### Scenario: Admin global quita el rol de secretario
- **GIVEN** un usuario con rol `secretario`
- **WHEN** un admin global le quita el rol
- **THEN** el usuario pasa a `rol = 'hermano'`

### Requirement: Un admin de logia no puede escalar roles

La política de actualización de perfiles SHALL impedir que un administrador de logia (no global)
cambie el `rol` de un perfil a un rol administrativo (`secretario`, `gran_secretario`, `master`) o lo
mueva a otra logia. Un admin global SHALL conservar el control total.

#### Scenario: Secretario intenta escalar a un hermano
- **GIVEN** un usuario con rol `secretario` de la logia X
- **WHEN** intenta actualizar directamente el `rol` de un hermano de su logia a `secretario`
- **THEN** la actualización es rechazada por la política (`with_check`)

#### Scenario: Secretario mantiene sus acciones legítimas
- **GIVEN** un usuario con rol `secretario` de la logia X
- **WHEN** valida a un hermano, le asigna grado, lo bloquea o le da/quita acceso de tesorero
- **THEN** la actualización se permite (el rol resultante es `hermano` o `tesorero`)

