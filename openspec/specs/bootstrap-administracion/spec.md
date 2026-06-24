# bootstrap-administracion Specification

## Purpose
Bootstrap del administrador maestro de la plataforma: un mecanismo reproducible (local y producción)
para crear/promover al usuario master con credenciales seguras, sin exponer secretos en el repo.
## Requirements
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
librería criptográfica, mostrarla una vez y **persistirla** como `MASTER_PASSWORD` en el archivo de
entorno cargado (gitignored). La contraseña se entrega a Supabase Auth, que la almacena con hash
bcrypt; el script NO SHALL pre-hashearla ni guardarla en un archivo versionado del repo.

#### Scenario: Contraseña aleatoria mostrada y persistida
- **WHEN** se ejecuta el script sin una contraseña provista
- **THEN** se genera una contraseña fuerte, se usa para crear la cuenta, se imprime una vez y se guarda como `MASTER_PASSWORD` en el archivo de entorno gitignored (sin duplicar la línea en ejecuciones posteriores)

