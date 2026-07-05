## ADDED Requirements

### Requirement: El Gran Secretario no ve generales individuales

El sistema SHALL impedir que el Gran Secretario lea los generales individuales de los hermanos; su
alcance sobre generales es agregado. El Secretario conserva la lectura individual de su propia logia y
el Master la lectura completa.

#### Scenario: Gran Secretario intenta leer generales de un hermano
- **GIVEN** un usuario gran_secretario
- **WHEN** consulta los generales individuales de un hermano por API
- **THEN** no obtiene la fila individual

#### Scenario: Secretario y Master conservan su acceso a generales
- **GIVEN** un secretario (su logia) o un master
- **WHEN** consulta generales dentro de su alcance
- **THEN** obtiene los datos permitidos

### Requirement: Los roles globales ven Trabajos de todas las logias

El sistema SHALL permitir a Master y Gran Secretario ver los trabajos/burilados/trazados de cualquier
logia, sin quedar limitados por `logia_id`/`grado` nulos.

#### Scenario: Gran Secretario ve trabajos de cualquier logia
- **GIVEN** un usuario gran_secretario o master (validado)
- **WHEN** consulta los trabajos
- **THEN** puede ver los trabajos de todas las logias y cámaras

#### Scenario: El hermano sigue limitado por cámara y logia
- **GIVEN** un hermano validado de la logia A con grado compañero
- **WHEN** consulta trabajos
- **THEN** solo ve los de su logia hasta su cámara (sin cambio respecto a la regla actual)

### Requirement: Vista agregada de cápitas para el Gran Secretario

El sistema SHALL ofrecer al Gran Secretario una vista **agregada** de cápitas (por logia), sin acceso a
pagos individuales. El Master conserva el acceso total; el Secretario y el Tesorero, su logia.

#### Scenario: Gran Secretario consulta cápitas agregadas
- **GIVEN** un usuario gran_secretario
- **WHEN** consulta las estadísticas de cápitas
- **THEN** obtiene cifras agregadas por logia, sin filas de pago individuales

#### Scenario: Gran Secretario no lee pagos individuales
- **GIVEN** un usuario gran_secretario
- **WHEN** intenta leer la tabla de pagos por API
- **THEN** no obtiene filas individuales
