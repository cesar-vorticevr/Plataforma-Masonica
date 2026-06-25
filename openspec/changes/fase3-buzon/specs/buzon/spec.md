## ADDED Requirements

### Requirement: Subida de documentos al buzón

Un administrador SHALL poder subir un documento (PDF/Word) al buzón: el archivo se almacena en Supabase
Storage y su metadato (título, tipo, ruta, autor, fecha) en la base. El archivo real MUST guardarse en
un bucket privado, accesible solo a administradores.

#### Scenario: Subir un documento
- **WHEN** un administrador sube un archivo con título y tipo
- **THEN** el archivo queda en Storage y el documento aparece listado en el buzón

### Requirement: Descarga mediante URL firmada

La descarga de un documento del buzón SHALL hacerse mediante una URL firmada temporal (el bucket es
privado; NO SHALL haber URL pública permanente).

#### Scenario: Descargar un documento
- **WHEN** un administrador pulsa descargar
- **THEN** obtiene una URL firmada temporal que permite abrir/descargar el archivo

### Requirement: Acceso restringido a administradores

El buzón (tabla y archivos) SHALL ser accesible únicamente para administradores (secretario/gran
secretario/master). Un hermano sin rol administrativo NO SHALL leer ni subir documentos. La restricción
MUST aplicarse en el servidor (RLS de la tabla y del bucket de Storage).

#### Scenario: Hermano sin acceso
- **WHEN** un hermano sin rol administrativo intenta leer o subir al buzón
- **THEN** la RLS lo impide (tabla y Storage)
