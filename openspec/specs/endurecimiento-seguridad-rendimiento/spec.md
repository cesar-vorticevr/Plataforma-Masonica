# endurecimiento-seguridad-rendimiento Specification

## Purpose
TBD - created by archiving change endurecimiento-rls-rendimiento-hashing. Update Purpose after archive.
## Requirements
### Requirement: Hashing de palabras clave con cost adecuado

El sistema SHALL generar los hashes de palabras clave con un cost de bcrypt de al menos 10, y las
funciones que fijan/verifican palabras clave SHALL usar ese cost.

#### Scenario: Fijar una palabra clave usa cost fuerte
- **GIVEN** un admin que fija o rota la palabra clave de una logia
- **WHEN** se guarda el hash
- **THEN** el hash usa cost ≥ 10 (p.ej. `$2a$10$…`)

### Requirement: Funciones SECURITY DEFINER con grants restringidos

El sistema SHALL restringir la ejecución de las funciones `security definer` al mínimo necesario;
ninguna función interna/trigger SHALL quedar ejecutable por `public`/`anon` por omisión.

#### Scenario: El trigger de anti-autoescalada no es ejecutable por anon
- **GIVEN** la función del trigger `perfiles_no_autoescalada`
- **WHEN** se revisan sus grants
- **THEN** no tiene EXECUTE para `public`/`anon` (revocado, como el resto del hardening)

### Requirement: Políticas RLS eficientes y acotadas a authenticated

El sistema SHALL evaluar las funciones auxiliares de RLS una sola vez por consulta (no por fila) y las
políticas SHALL aplicarse al rol `authenticated` (no a `public`/`anon`). Las columnas usadas por RLS y
FKs SHALL estar indexadas.

#### Scenario: Las funciones de RLS no se reevalúan por fila
- **GIVEN** una consulta con RLS sobre una tabla grande
- **WHEN** se ejecuta
- **THEN** `mi_logia()`/`mi_rol()`/etc. se evalúan como initPlan (envueltas en `(select …)`), no por fila

#### Scenario: Índices presentes en columnas de RLS/FK
- **GIVEN** las tablas con RLS por logia/usuario
- **WHEN** se revisan los índices
- **THEN** existen índices en `logia_id`/`usuario_id`/`tenida_id`/`de_logia_id` según corresponda

#### Scenario: Las políticas no se evalúan para anon
- **GIVEN** las políticas de las tablas de datos
- **WHEN** se revisan
- **THEN** están definidas `TO authenticated` (no `TO public`)

