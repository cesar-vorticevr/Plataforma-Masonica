## MODIFIED Requirements

### Requirement: Registro controlado por doble palabra clave y logia

El registro SHALL exigir la palabra clave general de la Orden y la palabra clave de la logia elegida,
ambas verificadas en el SERVIDOR (no solo en la interfaz), e insensibles a mayúsculas/minúsculas. El
formulario de registro SHALL ofrecer únicamente logias en estado `activa`; una logia `inactiva` NO
SHALL poder seleccionarse para registrar hermanos nuevos. Al completarse, la cuenta SHALL quedar en
estado `pendiente` y asociada a la logia seleccionada. Las palabras clave NO SHALL viajar ni
almacenarse en texto plano en el cliente.

#### Scenario: Registro exitoso queda pendiente
- **WHEN** una persona ingresa palabra general y de logia correctas, elige una logia `activa` y crea su cuenta
- **THEN** se crea el usuario en estado `pendiente`, con su `logia_id`, y puede iniciar sesión

#### Scenario: Palabra clave incorrecta rechazada en servidor
- **WHEN** la palabra general o la de la logia es incorrecta
- **THEN** el servidor rechaza el registro y no se crea la cuenta

#### Scenario: Las logias inactivas no se ofrecen en el registro
- **GIVEN** una logia en estado `inactiva`
- **WHEN** una persona abre el formulario de registro
- **THEN** esa logia no aparece entre las opciones seleccionables
- **AND** solo puede registrarse en logias `activa`
