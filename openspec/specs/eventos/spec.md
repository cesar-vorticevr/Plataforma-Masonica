# eventos Specification

## Purpose
TBD - created by archiving change fase3-eventos. Update Purpose after archive.
## Requirements
### Requirement: Publicación de eventos por rol

Los administradores SHALL poder publicar eventos, persistidos en Supabase. Un secretario SHALL poder
publicar únicamente eventos de **su** logia (alcance `logia`); NO SHALL publicar eventos globales ni de
otra logia. El Gran Secretario y el Master SHALL poder publicar en cualquier logia o con alcance
`global`. La restricción MUST aplicarse en el servidor (RLS).

#### Scenario: Secretario publica en su logia
- **WHEN** un secretario publica un evento de su logia
- **THEN** el evento se persiste con alcance de logia y su `logia_id`

#### Scenario: Secretario no puede publicar global
- **WHEN** un secretario intenta publicar un evento global o de otra logia
- **THEN** la RLS lo impide

#### Scenario: Gran Secretario publica global
- **WHEN** el Gran Secretario publica un evento con alcance global
- **THEN** el evento se persiste y es visible para todas las logias

### Requirement: Consulta de eventos por alcance

Todo usuario autenticado SHALL ver los eventos globales y los de su propia logia, ordenados por fecha.
NO SHALL ver eventos exclusivos de otra logia.

#### Scenario: Ver eventos del propio alcance
- **WHEN** un hermano abre Eventos
- **THEN** ve los eventos globales y los de su logia, y no los exclusivos de otras logias

### Requirement: Indicador de eventos no vistos

La navegación SHALL mostrar, en el ítem de Eventos, un indicador con la cantidad de eventos **visibles
para el hermano** (globales o de su logia) publicados después de su última visita a la sección. El conteo
MUST respetar la RLS de `eventos` (no incluir eventos de otras logias). Al abrir la sección de Eventos, la
plataforma SHALL marcar los eventos como vistos para ese hermano y el indicador SHALL volver a cero. La
marca de "último visto" MUST persistir por hermano en el servidor (sincronizada entre dispositivos).

#### Scenario: Aparece el conteo de eventos nuevos
- **WHEN** se publica un evento visible para el hermano después de su última visita a Eventos
- **THEN** el ítem de Eventos muestra el indicador con el número de eventos nuevos

#### Scenario: El indicador se limpia al visitar la sección
- **WHEN** el hermano abre la sección de Eventos
- **THEN** sus eventos quedan marcados como vistos y el indicador vuelve a cero

#### Scenario: El conteo respeta la visibilidad
- **WHEN** se publica un evento de otra logia (alcance de logia, no global)
- **THEN** ese evento NO se cuenta en el indicador del hermano

