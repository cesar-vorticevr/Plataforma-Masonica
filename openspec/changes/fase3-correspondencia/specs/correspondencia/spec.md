## ADDED Requirements

### Requirement: Envío de correspondencia dirigida con adjuntos

Un administrador SHALL poder enviar correspondencia oficial desde su logia a una o más logias
destinatarias, con asunto, cuerpo y adjuntos opcionales (PDF/Word/imagen). Los adjuntos MUST
almacenarse en Supabase Storage (bucket privado) y la fila MUST registrar `de_logia_id` igual a
la logia del emisor y `autor_id` igual al usuario autenticado.

#### Scenario: Enviar correspondencia con adjunto
- **WHEN** un administrador redacta correspondencia a otra(s) logia(s) y adjunta un archivo
- **THEN** el archivo queda en Storage y la correspondencia aparece como "Enviada" para su logia
- **AND** aparece como "Recibida" para cada logia destinataria

### Requirement: Visibilidad dirigida por logia

La correspondencia SHALL ser visible únicamente para administradores de la logia emisora, de las
logias destinatarias, o de alcance global. Un administrador de una logia no relacionada NO SHALL
leer la correspondencia ni descargar sus adjuntos. La restricción MUST aplicarse en el servidor
(RLS de la tabla y del bucket de Storage, este último reflejando la visibilidad de la fila).

#### Scenario: Admin no relacionado sin acceso
- **WHEN** un administrador de una logia que no es emisora ni destinataria intenta leer la correspondencia o descargar un adjunto
- **THEN** la RLS lo impide (tabla y Storage)

#### Scenario: Hermano sin acceso
- **WHEN** un hermano sin rol administrativo intenta leer o enviar correspondencia
- **THEN** la RLS lo impide

### Requirement: Descarga de adjuntos mediante URL firmada

La descarga de un adjunto SHALL hacerse mediante una URL firmada temporal (el bucket es privado;
NO SHALL haber URL pública permanente). La URL firmada SHALL generarse solo si el administrador
tiene acceso a la correspondencia asociada.

#### Scenario: Descargar un adjunto recibido
- **WHEN** un administrador de una logia destinataria pulsa descargar un adjunto
- **THEN** obtiene una URL firmada temporal que permite abrir/descargar el archivo
