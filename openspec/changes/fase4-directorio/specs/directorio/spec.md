## ADDED Requirements

### Requirement: Perfil profesional propio editable y opt-in

Un miembro validado SHALL poder crear y editar su propio perfil profesional (profesión, sector,
negocio, descripción, palabras clave) y decidir si aparece en el directorio mediante una opción
explícita (`mostrar_en_directorio`). Solo el propio usuario SHALL poder modificar su perfil
(RLS `prof_write`).

#### Scenario: Editar y mostrar el perfil propio
- **WHEN** un miembro guarda su perfil profesional con "mostrar en el directorio" activado
- **THEN** su perfil queda visible para los demás miembros en el directorio

#### Scenario: Ocultar el perfil propio
- **WHEN** un miembro desactiva "mostrar en el directorio"
- **THEN** su perfil deja de aparecer para los demás (sigue siendo visible solo para él)

### Requirement: Directorio interlogial de perfiles opt-in

El directorio SHALL mostrar a cualquier miembro autenticado los perfiles profesionales cuyo dueño
activó `mostrar_en_directorio`, independientemente de la logia (red profesional interlogial). NO SHALL
mostrarse el perfil de quien no activó la opción. La restricción MUST aplicarse en el servidor
(RLS `prof_read`). El listado MUST mostrar nombre, logia y datos profesionales del miembro.

#### Scenario: Ver perfiles de otras logias
- **WHEN** un miembro abre el directorio
- **THEN** ve los perfiles opt-in de miembros de cualquier logia, con su nombre, logia y profesión

#### Scenario: Perfil no opt-in oculto
- **WHEN** un miembro NO activó "mostrar en el directorio"
- **THEN** ningún otro miembro lo ve en el directorio

### Requirement: Búsqueda en el directorio

El directorio SHALL permitir buscar perfiles por nombre, profesión, negocio, sector o palabras clave.

#### Scenario: Buscar por servicio
- **WHEN** un miembro escribe un término de búsqueda
- **THEN** el directorio muestra solo los perfiles que coinciden en nombre, profesión, negocio, sector o palabras clave
