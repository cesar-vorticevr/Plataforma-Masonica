## ADDED Requirements

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
