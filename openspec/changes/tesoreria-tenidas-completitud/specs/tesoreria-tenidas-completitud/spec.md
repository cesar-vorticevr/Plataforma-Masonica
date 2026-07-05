## ADDED Requirements

### Requirement: Cumplimientos calcula solo lo del propio usuario

El sistema SHALL calcular los porcentajes y adeudos de la vista de Cumplimientos usando únicamente los
pagos y asistencias del propio usuario, sin contar los de otros miembros de la logia aunque la RLS del
rol devuelva más filas.

#### Scenario: Un tesorero abre Cumplimientos
- **GIVEN** un tesorero cuya RLS le devuelve pagos/asistencias de toda su logia
- **WHEN** abre `/cumplimientos`
- **THEN** ve solo sus propios porcentajes (asistencia ≤ 100%) y su propio adeudo

### Requirement: Recaudado por monto vigente del periodo

El sistema SHALL calcular el recaudado usando el monto de cápita vigente en cada periodo, no el monto
actual, para no distorsionar meses con montos distintos.

#### Scenario: La cápita cambió a mitad de año
- **GIVEN** una logia cuyo monto de cápita cambió en un mes
- **WHEN** se calcula el recaudado del año
- **THEN** cada periodo usa su monto vigente correspondiente

### Requirement: Indicadores de adeudo en tesorería

El sistema SHALL mostrar en el tablero de tesorería el adeudo total por logia y el monto adeudado por
cada hermano.

#### Scenario: Tablero de tesorería con adeudos
- **GIVEN** un tesorero en el tablero de su logia
- **WHEN** revisa los indicadores
- **THEN** ve el adeudo total de la logia y el monto adeudado por hermano

### Requirement: Periodicidad de cápita configurable

El sistema SHALL permitir configurar la periodicidad y el monto de la cápita con vigencia por periodo,
de modo que el histórico se conserve.

#### Scenario: Configurar nueva tarifa de cápita
- **GIVEN** un tesorero/secretario
- **WHEN** define un nuevo monto con su fecha de vigencia
- **THEN** el nuevo monto aplica desde esa vigencia y el anterior se conserva para el histórico

### Requirement: Tableros de asistencia por periodo y tendencia

El sistema SHALL mostrar la asistencia por mes y por año, por hermano y por logia, y una tendencia
temporal.

#### Scenario: Asistencia por mes/año
- **GIVEN** un secretario en el módulo de tenidas
- **WHEN** consulta los tableros de asistencia
- **THEN** ve porcentajes por mes y por año y una tendencia a lo largo del tiempo

### Requirement: Vistas agregadas para roles globales

El sistema SHALL ofrecer al Gran Secretario y al Master tableros agregados de cápitas y asistencia por
logia, sin exponer datos individuales al Gran Secretario.

#### Scenario: Gran Secretario ve tableros agregados
- **GIVEN** un usuario gran_secretario
- **WHEN** abre las estadísticas de cápitas/asistencia
- **THEN** ve cifras agregadas por logia (sin filas individuales)
