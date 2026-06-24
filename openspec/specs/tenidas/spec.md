# tenidas Specification

## Purpose
TBD - created by archiving change fase2-tenidas. Update Purpose after archive.
## Requirements
### Requirement: Calendario de tenidas por logia

El secretario (o master) SHALL poder crear tenidas de su logia (título y fecha) y verlas listadas,
persistidas en Supabase. Los hermanos de la logia SHALL poder ver las tenidas de su logia.

#### Scenario: Crear y listar tenidas
- **WHEN** el secretario crea una tenida con título y fecha
- **THEN** la tenida se persiste y aparece en el calendario de su logia

### Requirement: Registro de asistencia por tenida

El secretario SHALL poder marcar la asistencia (presente/ausente) de cada hermano de su logia en una
tenida, persistida en Supabase. El sistema SHALL mostrar la asistencia acumulada por hermano (presentes
sobre total de tenidas) y un promedio de la logia.

#### Scenario: Pasar lista
- **WHEN** el secretario marca presente a un hermano en una tenida
- **THEN** la asistencia se persiste y los indicadores acumulados se actualizan

### Requirement: Aislamiento de tenidas y asistencia por logia

Las tenidas y asistencias SHALL estar restringidas a la propia logia. Un secretario NO SHALL leer ni
modificar tenidas o asistencias de otra logia. La restricción MUST aplicarse en el servidor (RLS),
acotando al administrador a su logia.

#### Scenario: Aislamiento en escritura
- **WHEN** un secretario intenta crear/modificar una tenida o asistencia de otra logia
- **THEN** la RLS lo impide

#### Scenario: Aislamiento en lectura de asistencia
- **WHEN** un secretario intenta leer las asistencias de otra logia
- **THEN** la RLS no se las entrega

