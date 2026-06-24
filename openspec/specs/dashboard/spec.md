# dashboard Specification

## Purpose
TBD - created by archiving change fase2-dashboard. Update Purpose after archive.
## Requirements
### Requirement: Resumen personal del hermano

El dashboard SHALL mostrar, desde Supabase, el resumen del propio hermano: estado de su última
evaluación de salud, su cumplimiento de cápitas del año y su porcentaje de asistencia, además del
nombre y oriente de su logia. Los datos MUST ser exclusivamente del propio hermano (RLS).

#### Scenario: Resumen propio
- **WHEN** el hermano abre el dashboard
- **THEN** ve su estado de salud, cápitas y asistencia, y el nombre de su logia

#### Scenario: Cuenta pendiente
- **WHEN** un usuario en estado `pendiente` abre el dashboard
- **THEN** ve el aviso de que su cuenta está pendiente de validación

### Requirement: Conteo de logia solo para roles autorizados

El conteo de hermanos de la logia SHALL mostrarse únicamente a los roles que pueden leer los perfiles de
la logia (secretario/gran secretario/master/tesorero). Para un hermano sin ese acceso, NO SHALL mostrarse
(la RLS no le permite contar a otros).

#### Scenario: Conteo visible para administrador
- **WHEN** un secretario/tesorero abre el dashboard
- **THEN** ve el conteo de hermanos de su logia

#### Scenario: Conteo omitido para hermano
- **WHEN** un hermano sin rol administrativo abre el dashboard
- **THEN** no se muestra el conteo de hermanos de la logia

