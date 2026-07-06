## MODIFIED Requirements

### Requirement: Calendario de tenidas por logia

El secretario SHALL poder crear tenidas de su logia (título y fecha) y verlas listadas, persistidas
en Supabase. Los hermanos de la logia SHALL poder ver las tenidas de su logia.

El administrador global (master / Gran Secretario) NO pertenece a ninguna logia; por ello SHALL poder
**seleccionar la logia** sobre la que opera. Toda la vista de `/tenidas` (indicadores, calendario,
alta de tenida, registro de asistencia y gráficas) SHALL reencuadrarse a la logia seleccionada. Un
secretario, que pertenece a una única logia, NO SHALL ver el selector: la vista opera implícitamente
sobre su logia.

El alta de tenida SHALL usar la logia en foco (la seleccionada por el global, o la propia del
secretario) y SHALL rechazar el envío si no hay logia en foco. El sistema NUNCA SHALL intentar crear
una tenida con un identificador de logia vacío.

#### Scenario: Secretario crea y lista tenidas de su logia
- **WHEN** el secretario crea una tenida con título y fecha
- **THEN** la tenida se persiste en su logia y aparece en el calendario

#### Scenario: Administrador global selecciona una logia y crea una tenida
- **GIVEN** un master / Gran Secretario sin logia propia
- **WHEN** selecciona una logia en el selector y crea una tenida con título y fecha
- **THEN** la tenida se persiste en la logia seleccionada y la vista se actualiza para esa logia

#### Scenario: La vista se reencuadra al cambiar de logia
- **GIVEN** un administrador global viendo la logia A
- **WHEN** selecciona la logia B en el selector
- **THEN** los indicadores, el calendario, la asistencia y las gráficas pasan a mostrar los datos de la logia B

#### Scenario: Secretario no ve el selector de logia
- **WHEN** un secretario abre `/tenidas`
- **THEN** no se muestra el selector de logia y la vista opera sobre su propia logia

#### Scenario: Nunca se crea una tenida sin logia en foco
- **WHEN** no hay logia en foco (p. ej. administrador global que aún no ha seleccionado ninguna)
- **THEN** el formulario de alta no envía y no se intenta persistir ninguna tenida

## ADDED Requirements

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
