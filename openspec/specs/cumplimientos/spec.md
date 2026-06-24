# cumplimientos Specification

## Purpose
TBD - created by archiving change fase2-cumplimientos. Update Purpose after archive.
## Requirements
### Requirement: El hermano ve sus cápitas

El hermano SHALL ver, desde Supabase, su situación de cápitas del año: meses pagados/pendientes (solo
los exigibles según su fecha de inicio y el mes actual), porcentaje de cumplimiento y adeudo estimado.

#### Scenario: Resumen de cápitas propio
- **WHEN** el hermano abre Cumplimientos
- **THEN** ve sus meses pagados/pendientes, su % de cumplimiento y su adeudo estimado

### Requirement: El hermano ve su asistencia

El hermano SHALL ver su asistencia a las tenidas de su logia (presente/ausente por tenida) y su
porcentaje acumulado, desde Supabase.

#### Scenario: Asistencia propia
- **WHEN** el hermano abre Cumplimientos
- **THEN** ve por cada tenida si asistió y su porcentaje acumulado

### Requirement: Solo datos propios

Cumplimientos SHALL mostrar exclusivamente los datos del propio hermano; NO SHALL exponer pagos ni
asistencias de otros. La restricción MUST aplicarse en el servidor (RLS por `auth.uid()`).

#### Scenario: No se ven datos ajenos
- **WHEN** el hermano consulta Cumplimientos
- **THEN** solo obtiene sus propios pagos y asistencias

