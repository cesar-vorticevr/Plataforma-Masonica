## ADDED Requirements

### Requirement: El dueño no puede auto-escalar su perfil

El sistema SHALL impedir que el dueño de un perfil (`auth.uid() = perfiles.id`) modifique su propio
`rol`, `logia_id`, `estado` o `grado`, a menos que sea administrador global (`es_global()`). La
restricción SHALL aplicarse en el servidor (trigger), independientemente de la política RLS.

#### Scenario: Hermano intenta auto-promoverse
- **GIVEN** un usuario con rol `hermano`
- **WHEN** actualiza directamente su propia fila poniendo `rol = 'master'`
- **THEN** la operación es rechazada

#### Scenario: Hermano intenta auto-validarse
- **GIVEN** un usuario en estado `pendiente`
- **WHEN** actualiza directamente su propia fila poniendo `estado = 'validado'`
- **THEN** la operación es rechazada

### Requirement: No se rompen los flujos legítimos

La restricción SHALL afectar únicamente al dueño editándose a sí mismo con campos sensibles. Las vías
administrativas y de backend SHALL seguir funcionando.

#### Scenario: El registro asigna la logia con service-role
- **GIVEN** el flujo de registro que crea la cuenta con service-role
- **WHEN** fija el `logia_id` del nuevo perfil
- **THEN** la operación se permite (no es el dueño auto-editándose)

#### Scenario: Un admin valida a otro hermano
- **GIVEN** un `secretario` de la logia X
- **WHEN** valida y asigna grado a un hermano de su logia (otra fila)
- **THEN** la operación se permite

#### Scenario: El dueño edita un campo no sensible
- **GIVEN** un usuario `hermano`
- **WHEN** actualiza su propia `foto` sin tocar rol/logia/estado/grado
- **THEN** la operación se permite
