# code-quality Specification

## Purpose
TBD - created by archiving change lint-cleanup. Update Purpose after archive.
## Requirements
### Requirement: Lint en verde

El proyecto SHALL pasar `npm run lint` sin errores ni warnings, usando la configuración de
`eslint-config-next` sin relajar reglas para silenciar hallazgos.

#### Scenario: Lint sin hallazgos
- **WHEN** se ejecuta `npm run lint`
- **THEN** ESLint termina con 0 errores y 0 warnings

### Requirement: Reglas de hooks de React respetadas

Los componentes SHALL llamar a los hooks de React siempre en el mismo orden, sin invocarlos de forma
condicional ni después de un early return. El comportamiento observable de las pantallas afectadas
MUST preservarse tras la corrección.

#### Scenario: Hooks llamados incondicionalmente
- **WHEN** se renderiza una pantalla que antes llamaba un hook condicionalmente (admin, tesoreria)
- **THEN** los hooks se llaman en orden estable y la pantalla funciona igual que antes en modo mock

### Requirement: Tipado sin any injustificado

El código SHALL evitar `any` explícito; MUST usar tipos concretos (apoyándose en los tipos de
`lib/types.ts`) o `unknown` cuando el dato sea genuinamente abierto. El proyecto SHALL seguir pasando
`tsc --noEmit` tras el retipado.

#### Scenario: Typecheck sigue en verde tras retipar
- **WHEN** se reemplazan los `any` por tipos concretos y se ejecuta `npm run typecheck`
- **THEN** termina sin errores

### Requirement: Sin código sin usar

El código SHALL no contener imports ni variables declaradas y no usadas.

#### Scenario: Sin no-unused-vars
- **WHEN** se ejecuta `npm run lint`
- **THEN** no reporta `@typescript-eslint/no-unused-vars`

