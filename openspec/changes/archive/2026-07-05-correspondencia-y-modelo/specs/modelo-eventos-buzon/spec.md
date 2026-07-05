## ADDED Requirements

### Requirement: Los eventos admiten adjuntos

El sistema SHALL permitir adjuntar archivos a un evento y mostrarlos a quienes pueden ver el evento,
respetando las reglas de publicación y visibilidad existentes.

#### Scenario: Secretario adjunta un archivo a un evento
- **GIVEN** un secretario que publica un evento de su logia
- **WHEN** adjunta un archivo permitido
- **THEN** el adjunto se guarda y es visible para quienes pueden ver ese evento

### Requirement: Los documentos del buzón tienen alcance

El sistema SHALL registrar el alcance (logia o global) de cada documento del buzón y respetarlo en la
visibilidad, de modo que un documento de alcance logia no sea visible fuera de su ámbito.

#### Scenario: Documento de buzón con alcance logia
- **GIVEN** un secretario que sube un documento con alcance de su logia
- **WHEN** otro secretario de una logia distinta consulta el buzón
- **THEN** no ve ese documento (solo los de alcance global o de su propia logia)
