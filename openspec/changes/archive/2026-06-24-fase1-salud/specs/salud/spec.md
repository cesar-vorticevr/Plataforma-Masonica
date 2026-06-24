## ADDED Requirements

### Requirement: Consentimiento previo a Salud

Antes de capturar una evaluación de salud, el hermano SHALL aceptar el aviso de privacidad. La
aceptación MUST registrarse con la **versión del aviso** y la **fecha**. Si no existe consentimiento
para la versión vigente, el cuestionario de salud NO SHALL estar disponible.

#### Scenario: Sin consentimiento, cuestionario bloqueado
- **WHEN** un hermano sin consentimiento de la versión vigente intenta llenar Salud
- **THEN** se le muestra el aviso de privacidad y el cuestionario permanece bloqueado hasta aceptarlo

#### Scenario: Registrar consentimiento habilita el cuestionario
- **WHEN** el hermano acepta el aviso de privacidad
- **THEN** se registra el consentimiento (versión + fecha) y se habilita el cuestionario

### Requirement: Evaluación de salud con histórico

El hermano SHALL poder responder el cuestionario y guardar una evaluación con sus respuestas, puntajes,
semáforos, etiquetas y condiciones, persistida en Supabase. El sistema SHALL conservar el **histórico**
de evaluaciones (varias en el tiempo, cada una fechada) y comparar la última con la anterior. La
evaluación es **orientativa** y la interfaz MUST mostrar que **no sustituye una consulta médica**.

#### Scenario: Guardar y listar evaluaciones
- **WHEN** el hermano completa el cuestionario y guarda
- **THEN** la evaluación se persiste y aparece en su histórico fechado

#### Scenario: Comparación con la evaluación previa
- **WHEN** existe más de una evaluación
- **THEN** el tablero indica la mejora o el deterioro respecto a la anterior

### Requirement: Privacidad estricta de los datos de salud

El detalle individual de salud SHALL ser visible únicamente para el **propio hermano**. Ningún otro
rol (secretario, Gran Secretario, Master, otros hermanos) SHALL acceder a las evaluaciones de salud
individuales de otro usuario. Esta restricción MUST aplicarse en el servidor (RLS).

#### Scenario: Solo el dueño ve su salud
- **WHEN** el hermano consulta sus evaluaciones
- **THEN** ve únicamente las propias

#### Scenario: Un administrador no accede a la salud individual
- **WHEN** un secretario o Gran Secretario intenta leer las evaluaciones de salud de un hermano
- **THEN** la RLS lo impide (no obtiene esas filas)
