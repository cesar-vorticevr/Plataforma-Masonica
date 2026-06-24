# generales Specification

## Purpose
TBD - created by archiving change fase1-generales. Update Purpose after archive.
## Requirements
### Requirement: El hermano edita sus Generales

Un usuario autenticado SHALL poder ver y guardar sus propios datos de contacto (fecha de nacimiento,
teléfono, dirección, contacto de emergencia nombre/teléfono, tipo de sangre, notas), persistidos en
Supabase. El guardado MUST escribir únicamente la fila del propio usuario. Un usuario en estado
`pendiente` SHALL poder llenar sus Generales.

#### Scenario: Guardar y recuperar Generales propios
- **WHEN** un hermano edita sus datos de contacto y guarda
- **THEN** los datos se persisten en Supabase y se recuperan al volver a abrir la pantalla

#### Scenario: Pendiente puede llenar Generales
- **WHEN** un usuario en estado `pendiente` abre Generales
- **THEN** puede capturar y guardar sus datos de contacto

### Requirement: Visibilidad restringida de Generales

Los Generales de un hermano SHALL ser visibles solo para el propio hermano y para los administradores
de SU logia (secretario y superiores). NO SHALL ser visibles para otros hermanos. La escritura de los
Generales de un hermano MUST estar restringida al propio hermano.

#### Scenario: El admin de la logia ve los Generales de un hermano
- **WHEN** el secretario gestiona a un hermano de su logia
- **THEN** ve los Generales de ese hermano (solo lectura)

#### Scenario: Otro hermano no accede a Generales ajenos
- **WHEN** un hermano intenta leer los Generales de otro hermano
- **THEN** la RLS lo impide (no obtiene los datos)

#### Scenario: Aislamiento entre logias
- **WHEN** un administrador intenta ver los Generales de un hermano de otra logia
- **THEN** la RLS lo impide

