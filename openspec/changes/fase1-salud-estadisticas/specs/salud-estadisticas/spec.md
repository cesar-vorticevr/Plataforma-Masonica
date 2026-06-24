## ADDED Requirements

### Requirement: Estadísticas de salud solo agregadas

El sistema SHALL exponer estadísticas de salud únicamente de forma **agregada** (distribución de
semáforos y prevalencia de etiquetas y condiciones), calculadas sobre la **última evaluación por
hermano** en el alcance. La salida NO SHALL incluir identificadores de usuario ni filas individuales.
El detalle individual de salud MUST permanecer inaccesible para cualquier rol distinto del propio hermano.

#### Scenario: Agregado sin datos individuales
- **WHEN** un administrador consulta las estadísticas de salud de su alcance
- **THEN** recibe conteos/prevalencias agregadas, sin ningún identificador ni fila individual

#### Scenario: El detalle individual sigue protegido
- **WHEN** un administrador intenta leer las evaluaciones de salud de un hermano
- **THEN** la RLS lo impide (las estadísticas no abren esa puerta)

### Requirement: Anonimización por cohorte mínimo

Cuando el cohorte de hermanos evaluados en el alcance sea menor a un umbral mínimo, el sistema SHALL
**suprimir** el desglose (no devolver prevalencias por etiqueta/condición ni distribución), para evitar
la reidentificación en grupos pequeños.

#### Scenario: Cohorte pequeño suprimido
- **WHEN** el alcance tiene menos evaluados que el umbral mínimo
- **THEN** la respuesta indica cohorte insuficiente y no entrega el desglose

#### Scenario: Cohorte suficiente entrega agregados
- **WHEN** el alcance alcanza o supera el umbral mínimo
- **THEN** se entregan las prevalencias y la distribución de semáforos

### Requirement: Acceso restringido por rol y logia (en el servidor)

El cálculo de estadísticas de salud SHALL estar restringido en el servidor a administradores. Un
secretario SHALL obtener únicamente los agregados de **su** logia; un gran secretario o master, de
cualquier logia o del total. Un hermano sin rol administrativo NO SHALL obtener agregados.

#### Scenario: Secretario acotado a su logia
- **WHEN** un secretario solicita estadísticas de salud
- **THEN** obtiene solo las de su logia (no las de otras)

#### Scenario: Hermano sin acceso a agregados
- **WHEN** un hermano sin rol administrativo solicita las estadísticas
- **THEN** la función no le entrega agregados
