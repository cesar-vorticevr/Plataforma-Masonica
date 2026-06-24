## ADDED Requirements

### Requirement: Registro de pagos de cápitas por hermano y mes

El tesorero (o secretario/master) SHALL poder marcar como pagado/no pagado cada mes de cada hermano de
su logia, persistido en Supabase. Solo MUST contar como exigibles los meses que aplican según la fecha
de inicio del hermano y el mes actual. El sistema SHALL mostrar el total recaudado y el porcentaje de
cumplimiento.

#### Scenario: Marcar un pago
- **WHEN** el tesorero marca un mes como pagado para un hermano de su logia
- **THEN** el pago se persiste y los indicadores de cumplimiento se actualizan

#### Scenario: Meses no aplicables
- **WHEN** un mes es anterior a la fecha de inicio del hermano o posterior al mes actual
- **THEN** ese mes no se cuenta como exigible ni afecta el cumplimiento

### Requirement: Configuración del monto de cápita por logia

El tesorero/secretario SHALL poder definir el monto de la cápita de su logia, persistido en Supabase.

#### Scenario: Definir el monto
- **WHEN** el tesorero guarda un nuevo monto de cápita
- **THEN** el monto se persiste y se usa para calcular el recaudado

### Requirement: Fecha de inicio de cápitas por hermano

El tesorero/secretario SHALL poder fijar la fecha de inicio (desde cuándo paga cápitas) de un hermano de
su logia. Esta operación MUST estar restringida en el servidor a tesorero/secretario/master de la misma
logia y NO SHALL permitir modificar otros campos del perfil.

#### Scenario: Fijar fecha de inicio
- **WHEN** el tesorero fija la fecha de inicio de un hermano de su logia
- **THEN** se guarda y los meses exigibles se recalculan a partir de ella

### Requirement: Aislamiento de la tesorería por logia

La tesorería SHALL estar restringida a la propia logia. Un tesorero/secretario NO SHALL ver ni
modificar pagos, cápita o perfiles de otra logia. La restricción MUST aplicarse en el servidor (RLS).

#### Scenario: Aislamiento entre logias
- **WHEN** un tesorero intenta leer o registrar pagos de otra logia
- **THEN** la RLS lo impide
