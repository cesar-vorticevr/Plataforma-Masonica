# tenidas Specification

## Purpose
TBD - created by archiving change fase2-tenidas. Update Purpose after archive.
## Requirements
### Requirement: Calendario de tenidas por logia

El secretario (o master) SHALL poder crear tenidas de su logia (título y fecha) y verlas listadas,
persistidas en Supabase. Los hermanos de la logia SHALL poder ver las tenidas de su logia.

El administrador global (master / Gran Secretario) NO pertenece a ninguna logia; opera sobre la
**logia activa** que elige en el selector del header (ver capability `logia-activa`). Toda la vista
de `/tenidas` (indicadores, calendario, alta de tenida, registro de asistencia y gráficas) SHALL
reencuadrarse a la logia activa. Un secretario, que pertenece a una única logia, opera implícitamente
sobre la suya.

El alta de tenida SHALL usar la logia en foco (la activa del global, o la propia del secretario) y
SHALL rechazar el envío si no hay logia en foco. El sistema NUNCA SHALL intentar crear una tenida con
un identificador de logia vacío.

#### Scenario: Crear y listar tenidas
- **WHEN** el secretario crea una tenida con título y fecha
- **THEN** la tenida se persiste y aparece en el calendario de su logia

#### Scenario: Administrador global opera sobre la logia activa
- **GIVEN** un master / Gran Secretario sin logia propia, con una logia activa elegida en el header
- **WHEN** crea una tenida con título y fecha
- **THEN** la tenida se persiste en la logia activa y la vista se actualiza para esa logia

#### Scenario: La vista se reencuadra al cambiar la logia activa
- **GIVEN** un administrador global viendo la logia A
- **WHEN** cambia la logia activa a B en el header
- **THEN** los indicadores, el calendario, la asistencia y las gráficas pasan a mostrar los datos de la logia B

#### Scenario: Nunca se crea una tenida sin logia en foco
- **WHEN** no hay logia en foco (p. ej. administrador global que aún no tiene ninguna logia activa)
- **THEN** el formulario de alta no envía y no se intenta persistir ninguna tenida

### Requirement: Registro de asistencia por tenida

El secretario SHALL poder marcar la asistencia (presente/ausente) de cada hermano de su logia en una
tenida, persistida en Supabase. El sistema SHALL mostrar la asistencia acumulada por hermano (presentes
sobre total de tenidas) y un promedio de la logia.

#### Scenario: Pasar lista
- **WHEN** el secretario marca presente a un hermano en una tenida
- **THEN** la asistencia se persiste y los indicadores acumulados se actualizan

### Requirement: Aislamiento de tenidas y asistencia por logia

Las tenidas y asistencias SHALL estar restringidas a la propia logia. Un secretario NO SHALL leer ni
modificar tenidas o asistencias de otra logia. La restricción MUST aplicarse en el servidor (RLS),
acotando al administrador a su logia.

#### Scenario: Aislamiento en escritura
- **WHEN** un secretario intenta crear/modificar una tenida o asistencia de otra logia
- **THEN** la RLS lo impide

#### Scenario: Aislamiento en lectura de asistencia
- **WHEN** un secretario intenta leer las asistencias de otra logia
- **THEN** la RLS no se las entrega

### Requirement: Retroalimentación de errores en tenidas y asistencia

El alta de tenida y el registro de asistencia SHALL informar al usuario cuando una operación falla,
en lugar de fallar en silencio. La capa de datos SHALL propagar el error de persistencia a la interfaz.
Mientras una operación de alta está en curso, el control de envío SHALL deshabilitarse para evitar
envíos duplicados. Solo tras una operación exitosa SHALL limpiarse el formulario y refrescarse la vista.

#### Scenario: El alta falla y se informa al usuario
- **WHEN** el usuario crea una tenida y la persistencia falla (p. ej. la RLS rechaza la escritura)
- **THEN** se muestra un mensaje de error, el formulario conserva lo capturado y no se refresca como si hubiera tenido éxito

#### Scenario: El registro de asistencia falla y se informa al usuario
- **WHEN** el usuario marca la asistencia de un hermano y la persistencia falla
- **THEN** se muestra un mensaje de error y el estado mostrado no queda como aplicado con éxito

#### Scenario: Botón deshabilitado durante el envío
- **WHEN** el usuario pulsa "Agregar tenida" y la operación está en curso
- **THEN** el botón queda deshabilitado hasta que la operación termina

#### Scenario: Éxito limpia y refresca
- **WHEN** el alta de tenida se persiste correctamente
- **THEN** el formulario se limpia y la lista de tenidas se actualiza con la nueva

