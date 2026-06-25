# trabajos Specification

## Purpose
TBD - created by archiving change fase3-trabajos. Update Purpose after archive.
## Requirements
### Requirement: Subida de trabajos por cámara

Un miembro validado con grado SHALL poder subir un trabajo (plancha/burilado/trazado) de su logia,
indicando la cámara del trabajo, que NO SHALL ser superior a su propio grado. El archivo MUST
almacenarse en Supabase Storage (bucket privado) y la fila MUST registrar `usuario_id` igual al
usuario autenticado.

#### Scenario: Subir un trabajo de la propia cámara o inferior
- **WHEN** un maestro sube un trabajo de cámara aprendiz, compañero o maestro con un archivo
- **THEN** el archivo queda en Storage y el trabajo aparece listado

#### Scenario: No subir por encima del propio grado
- **WHEN** un aprendiz intenta subir un trabajo de cámara maestro
- **THEN** la RLS lo impide

### Requirement: Visibilidad jerárquica por cámara

Un miembro SHALL ver únicamente los trabajos de su logia cuya cámara sea igual o inferior a su grado
(`nivel(camara) <= nivel(mi_grado())`). NO SHALL ver trabajos de cámaras superiores ni de otras
logias. La restricción MUST aplicarse en el servidor (RLS de la tabla y del bucket de Storage, este
último reflejando la visibilidad de la fila).

#### Scenario: Grado inferior no ve cámara superior
- **WHEN** un aprendiz consulta los trabajos
- **THEN** ve solo trabajos de cámara aprendiz de su logia, y NO los de compañero ni maestro
- **AND** no puede descargar el archivo de un trabajo de cámara superior

#### Scenario: Aislamiento por logia
- **WHEN** un miembro consulta los trabajos
- **THEN** no ve trabajos de otras logias aunque la cámara sea igual o inferior a su grado

### Requirement: Descarga de archivos mediante URL firmada

La descarga del archivo de un trabajo SHALL hacerse mediante una URL firmada temporal (el bucket es
privado; NO SHALL haber URL pública permanente). La URL firmada SHALL generarse solo si el miembro
tiene acceso al trabajo asociado (misma logia y cámara visible).

#### Scenario: Descargar un trabajo visible
- **WHEN** un miembro pulsa descargar un trabajo de una cámara que puede ver
- **THEN** obtiene una URL firmada temporal que permite abrir/descargar el archivo

