# capita-historico-periodicidad Specification

## Purpose
TBD - created by archiving change tesoreria-historico-capita-tendencias. Update Purpose after archive.
## Requirements
### Requirement: Recaudado por el monto registrado en cada pago

El sistema SHALL calcular el recaudado sumando el importe (`monto`) registrado en cada pago marcado
como pagado, en lugar de multiplicar por la cápita actual, de modo que meses con montos distintos se
reflejen correctamente. No requiere cambio de esquema: `pagos.monto` ya guarda el importe del pago.

#### Scenario: La cápita cambió a mitad de año
- **GIVEN** una logia cuyo monto de cápita cambió durante el año
- **WHEN** se calcula el recaudado
- **THEN** el total suma el `monto` de cada pago (el importe vigente cuando se registró), no la cápita actual

#### Scenario: Recaudado con montos homogéneos
- **GIVEN** una logia con la misma cápita todo el año
- **WHEN** se calcula el recaudado
- **THEN** el total coincide con la suma de los pagos marcados

### Requirement: Periodicidad de cápita visible

El sistema SHALL exponer la periodicidad de la cápita configurada por logia (hoy mensual), dejándola
lista para configurarse.

#### Scenario: Mostrar periodicidad
- **GIVEN** un tesorero/secretario en el tablero de tesorería
- **WHEN** consulta la configuración de cápita
- **THEN** ve la periodicidad vigente de su logia

