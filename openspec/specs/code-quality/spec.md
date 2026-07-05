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

### Requirement: Código fuente libre de mojibake

El código fuente del proyecto SHALL estar libre de texto mal codificado (mojibake), es decir,
secuencias resultantes de una doble codificación UTF-8→Latin-1→UTF-8 (p. ej. `Â¿`, `Ã¡`, `Ã³`) y
caracteres de control indebidos en archivos de texto. El proyecto SHALL proveer un check automático
(`npm run check:encoding`) que recorra los archivos de código fuente y **falle** con código de
salida distinto de cero si detecta dichas secuencias, reportando archivo y línea de cada hallazgo.
El check MUST poder ejecutarse junto a `npm run lint` y `npm run typecheck` como parte del flujo de
"antes de cerrar trabajo".

#### Scenario: Fuente limpio pasa el check
- **WHEN** se ejecuta `npm run check:encoding` sobre un árbol de código sin mojibake
- **THEN** el check termina con código de salida 0 y no reporta hallazgos

#### Scenario: Mojibake detectado hace fallar el check
- **WHEN** un archivo de código contiene una secuencia de mojibake (p. ej. `Â¿CuÃ¡l`) y se ejecuta
  `npm run check:encoding`
- **THEN** el check termina con código de salida distinto de cero e informa el archivo y la línea del
  hallazgo

#### Scenario: El check ignora rutas no fuente
- **WHEN** se ejecuta `npm run check:encoding` en un repo con `node_modules/`, artefactos de build
  (`.next/`) y binarios
- **THEN** el check no inspecciona esas rutas y no produce falsos positivos por su contenido

