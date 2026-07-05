# tesoreria-tenidas-completitud Specification

## Purpose
TBD - created by archiving change tesoreria-tenidas-completitud. Update Purpose after archive.
## Requirements
### Requirement: Cumplimientos calcula solo lo del propio usuario

El sistema SHALL calcular los porcentajes y adeudos de la vista de Cumplimientos usando únicamente los
pagos y asistencias del propio usuario, sin contar los de otros miembros de la logia aunque la RLS del
rol devuelva más filas.

#### Scenario: Un tesorero abre Cumplimientos
- **GIVEN** un tesorero cuya RLS le devuelve pagos/asistencias de toda su logia
- **WHEN** abre `/cumplimientos`
- **THEN** ve solo sus propios porcentajes (asistencia ≤ 100%) y su propio adeudo

### Requirement: Indicadores de adeudo en tesorería

El sistema SHALL mostrar en el tablero de tesorería el adeudo total por logia y el monto adeudado por
cada hermano.

#### Scenario: Tablero de tesorería con adeudos
- **GIVEN** un tesorero en el tablero de su logia
- **WHEN** revisa los indicadores
- **THEN** ve el adeudo total de la logia y el monto adeudado por hermano

### Requirement: Vista agregada de asistencia para roles globales

El sistema SHALL ofrecer al Gran Secretario y al Master una vista agregada de asistencia por logia, sin
exponer asistencias individuales al Gran Secretario.

#### Scenario: Gran Secretario ve asistencia agregada
- **GIVEN** un usuario gran_secretario
- **WHEN** abre las estadísticas
- **THEN** ve porcentajes de asistencia agregados por logia (sin filas individuales)

