## ADDED Requirements

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
