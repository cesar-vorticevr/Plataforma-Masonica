## ADDED Requirements

### Requirement: Tarifas de cápita con vigencia

El sistema SHALL permitir registrar el monto de la cápita con una fecha de vigencia por logia,
conservando las tarifas anteriores para el histórico.

#### Scenario: Configurar nueva tarifa
- **GIVEN** un tesorero/secretario
- **WHEN** define un nuevo monto con su fecha de vigencia
- **THEN** el nuevo monto aplica desde esa vigencia y el anterior se conserva

### Requirement: Recaudado por monto vigente del periodo

El sistema SHALL calcular el recaudado usando el monto de cápita vigente en cada periodo, no el monto
actual.

#### Scenario: La cápita cambió a mitad de año
- **GIVEN** una logia cuyo monto de cápita cambió en un mes
- **WHEN** se calcula el recaudado del año
- **THEN** cada periodo usa su monto vigente correspondiente
