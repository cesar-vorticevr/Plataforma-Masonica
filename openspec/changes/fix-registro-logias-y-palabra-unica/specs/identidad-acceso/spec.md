## MODIFIED Requirements

### Requirement: Registro controlado por palabra clave de la logia

El registro SHALL exigir la palabra clave de la logia elegida, verificada en el
SERVIDOR (no solo en la interfaz) e insensible a mayúsculas/minúsculas y espacios. NO
SHALL existir una segunda palabra clave "de la Orden" ni ninguna verificación global
equivalente. El formulario de registro SHALL ofrecer únicamente logias en estado
`activa`; una logia `inactiva` NO SHALL poder seleccionarse para registrar hermanos
nuevos. Las logias ofrecidas SHALL obtenerse mediante una función de servidor acotada
(no por acceso directo a la tabla), legible por un registrante público sin sesión
(`anon`), que devuelva solo campos no sensibles (`id`, `nombre`, `numero`, `oriente`) y
NUNCA la palabra clave. Al completarse, la cuenta SHALL quedar en estado `pendiente` y
asociada a la logia seleccionada. La palabra clave NO SHALL viajar ni almacenarse en
texto plano en el cliente ni en la base de datos (se guarda con hash).

#### Scenario: Registro exitoso queda pendiente
- **WHEN** una persona ingresa la palabra clave correcta de la logia, elige una logia `activa` y crea su cuenta
- **THEN** se crea el usuario en estado `pendiente`, con su `logia_id`, y puede iniciar sesión

#### Scenario: Palabra clave incorrecta rechazada en servidor
- **WHEN** la palabra clave de la logia es incorrecta
- **THEN** el servidor rechaza el registro y no se crea la cuenta

#### Scenario: No hay palabra clave de la Orden
- **WHEN** una persona abre el formulario de registro
- **THEN** el formulario solicita únicamente la palabra clave de la logia
- **AND** no existe campo ni verificación de una "palabra clave de la Orden"

#### Scenario: El registrante público ve las logias activas
- **GIVEN** un visitante sin sesión (rol `anon`) y al menos una logia en estado `activa`
- **WHEN** abre el formulario de registro
- **THEN** el selector de logias se carga con las logias `activa`
- **AND** cada opción expone solo `nombre`, `numero` y `oriente`, nunca la palabra clave

#### Scenario: Las logias inactivas no se ofrecen en el registro
- **GIVEN** una logia en estado `inactiva`
- **WHEN** una persona abre el formulario de registro
- **THEN** esa logia no aparece entre las opciones seleccionables
- **AND** solo puede registrarse en logias `activa`
