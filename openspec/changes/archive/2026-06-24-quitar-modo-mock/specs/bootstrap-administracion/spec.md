## ADDED Requirements

### Requirement: Creación del administrador maestro

El sistema SHALL proveer un script reproducible para crear o promover al administrador maestro de la
plataforma, dejándolo con rol master, estado validado y grado maestro. El script MUST funcionar tanto
en local como en producción, tomando la configuración del entorno cargado. La promoción a master MUST
hacerse con la clave de service-role en el servidor, nunca desde el cliente.

#### Scenario: Crear el maestro en un entorno limpio
- **WHEN** se ejecuta el script con un email definido y no existe ese usuario
- **THEN** se crea la cuenta y su perfil queda con rol master, estado validado y grado maestro

#### Scenario: El maestro puede iniciar sesión
- **WHEN** el maestro inicia sesión con las credenciales del script
- **THEN** obtiene acceso de administrador de la plataforma

### Requirement: Contraseña del maestro generada de forma segura

Cuando no se provea una contraseña, el script SHALL generarla de forma aleatoria y segura con una
librería criptográfica y mostrarla una sola vez. La contraseña se entrega a Supabase Auth, que la
almacena con hash bcrypt; el script NO SHALL pre-hashearla ni guardarla en texto plano en el repo.

#### Scenario: Contraseña aleatoria mostrada una vez
- **WHEN** se ejecuta el script sin una contraseña provista
- **THEN** se genera una contraseña fuerte, se usa para crear la cuenta y se imprime una sola vez para resguardo
