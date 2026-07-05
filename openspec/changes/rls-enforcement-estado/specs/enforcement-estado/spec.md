## ADDED Requirements

### Requirement: Los módulos de solo-validados exigen estado validado en el servidor

El sistema SHALL exigir `estado = 'validado'` en la RLS para acceder a Directorio, Mensajería,
Eventos, Trabajos, Tenidas y las lecturas de Cumplimientos. Un hermano no validado NO debe poder
leer ni escribir en esos módulos aunque llame la API directamente.

#### Scenario: Hermano pendiente intenta leer el directorio por API
- **GIVEN** un hermano en estado `pendiente`
- **WHEN** consulta `perfiles_profesionales` de otros hermanos por API directa
- **THEN** no obtiene filas (la RLS exige validado)

#### Scenario: Hermano pendiente intenta enviar un mensaje profesional
- **GIVEN** un hermano en estado `pendiente`
- **WHEN** intenta insertar un mensaje profesional
- **THEN** la operación es rechazada

#### Scenario: Hermano validado usa los módulos con normalidad
- **GIVEN** un hermano en estado `validado` con grado
- **WHEN** lee el directorio, eventos o trabajos de su cámara
- **THEN** obtiene los datos permitidos por las demás reglas (rol/logia/grado)

### Requirement: El no validado solo accede a Generales y Salud

El sistema SHALL permitir a un hermano pendiente únicamente llenar/leer sus propios Generales y Salud;
esos módulos SHALL seguir accesibles para el dueño mientras no esté bloqueado.

#### Scenario: Pendiente llena Generales y Salud
- **GIVEN** un hermano en estado `pendiente` (con consentimiento cuando aplique a Salud)
- **WHEN** guarda sus Generales y una evaluación de Salud propia
- **THEN** la operación se permite

### Requirement: El bloqueado pierde acceso en el servidor

El sistema SHALL denegar en la RLS todo acceso a datos a un usuario en estado `bloqueado`, incluidos
sus propios Generales y Salud, y la app SHALL cerrar su sesión al detectarlo.

#### Scenario: Bloqueado con token vigente intenta leer datos
- **GIVEN** un usuario recién puesto en estado `bloqueado` cuyo token aún no expira
- **WHEN** intenta leer o escribir cualquier dato por API
- **THEN** la RLS no devuelve datos y las escrituras son rechazadas

#### Scenario: Bloqueado es expulsado de la app
- **GIVEN** un usuario `bloqueado` con sesión abierta en el navegador
- **WHEN** navega a cualquier página protegida
- **THEN** la app cierra su sesión y lo lleva a una pantalla de cuenta bloqueada
