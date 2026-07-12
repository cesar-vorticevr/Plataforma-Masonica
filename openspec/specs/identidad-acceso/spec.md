# identidad-acceso Specification

## Purpose
TBD - created by archiving change fase1-auth-identidad. Update Purpose after archive.
## Requirements
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

### Requirement: Autenticación por email y contraseña

El sistema SHALL permitir iniciar sesión con email y contraseña usando Supabase Auth. Las contraseñas
MUST quedar bajo el hash de Supabase Auth, nunca en texto plano.

#### Scenario: Login con email y contraseña
- **WHEN** un usuario registrado ingresa credenciales válidas
- **THEN** obtiene una sesión y accede según su estado y grado

#### Scenario: Credenciales inválidas rechazadas
- **WHEN** un usuario ingresa credenciales incorrectas
- **THEN** no obtiene sesión y se muestra un error

### Requirement: Login con Google desactivado

En este corte el login con Google NO SHALL estar operativo. El botón de Google SHALL mostrarse
**desactivado** (visible pero no funcional), sin iniciar ningún flujo de OAuth.

#### Scenario: Botón de Google no inicia sesión
- **WHEN** el usuario ve la pantalla de login
- **THEN** el botón de Google aparece desactivado y no dispara ningún flujo de autenticación

### Requirement: Estados de cuenta y alcance de acceso

El acceso SHALL depender del estado: `pendiente` solo puede completar su perfil mínimo (Generales y
Salud en cortes posteriores), `validado` accede según su grado, y `bloqueado` no accede pero conserva
sus datos. Estas restricciones MUST aplicarse en el servidor.

#### Scenario: Pendiente con acceso restringido
- **WHEN** un usuario `pendiente` intenta entrar a módulos que requieren validación
- **THEN** el servidor le niega el acceso hasta que el secretario lo valide

#### Scenario: Bloqueado sin acceso
- **WHEN** un usuario `bloqueado` inicia sesión
- **THEN** no obtiene acceso a los módulos, sin que se borren sus datos

### Requirement: Validación y asignación de grado por el secretario

El secretario de una logia SHALL poder validar a un hermano de SU logia, asignarle grado
(aprendiz/compañero/maestro), bloquearlo/desbloquearlo, y otorgar/quitar acceso de tesorero. Estas
acciones MUST estar limitadas por RLS a la logia del secretario; un secretario NO SHALL actuar sobre
otra logia.

#### Scenario: Secretario valida y asigna grado
- **WHEN** el secretario valida a un hermano de su logia y le asigna grado
- **THEN** el hermano pasa a `validado` con ese grado y obtiene acceso por cámara

#### Scenario: Aislamiento entre logias
- **WHEN** un secretario intenta gestionar a un usuario de otra logia
- **THEN** la operación es rechazada por la RLS del servidor

### Requirement: Sesión SSR y protección de rutas en el servidor

La sesión SHALL refrescarse en el servidor mediante middleware en cada request, y el acceso a las rutas
privadas del área de aplicación SHALL verificarse en el servidor (no solo con redirecciones de cliente).
Un usuario sin sesión válida MUST ser redirigido a iniciar sesión.

#### Scenario: Ruta privada sin sesión redirige
- **WHEN** alguien sin sesión solicita una ruta privada
- **THEN** el servidor lo redirige a la pantalla de login

#### Scenario: Sesión persistida entre requests
- **WHEN** un usuario autenticado navega entre páginas
- **THEN** su sesión se mantiene sin re-login, refrescada por el middleware

### Requirement: Autorización basada en la tabla de perfiles, sin auto-escalada

La autorización (rol, logia, grado) SHALL derivarse de la tabla de perfiles vía funciones del servidor,
NO de metadatos del JWT editables por el usuario. Un usuario NO SHALL poder modificar su propio `rol`,
`estado`, `grado` ni `logia_id` tras el registro; solo un administrador competente puede cambiarlos.

#### Scenario: Intento de auto-escalada bloqueado
- **WHEN** un hermano intenta actualizar su propio `rol` o `estado` a uno con más privilegios
- **THEN** la RLS rechaza el cambio de esos campos

#### Scenario: Edición de campos propios permitidos
- **WHEN** un usuario actualiza campos propios no privilegiados de su perfil
- **THEN** el cambio se aplica sin alterar `rol`/`estado`/`grado`/`logia_id`

### Requirement: Autenticación siempre vía Supabase

La autenticación SHALL realizarse siempre contra Supabase Auth; NO SHALL existir un proveedor de
autenticación mock ni un selector de usuario de demostración. La pantalla de inicio de sesión NO SHALL
mostrar credenciales de demostración.

#### Scenario: Sin selector demo ni credenciales de demostración
- **WHEN** un usuario abre la app
- **THEN** la sesión se resuelve contra Supabase y no hay selector de usuario demo ni lista de correos de demostración

