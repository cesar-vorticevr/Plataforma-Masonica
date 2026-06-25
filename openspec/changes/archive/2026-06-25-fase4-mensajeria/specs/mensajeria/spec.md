## ADDED Requirements

### Requirement: Envío de mensajes entre hermanos

Un miembro validado SHALL poder enviar un mensaje profesional a otro hermano (por ejemplo desde el
Directorio o desde una conversación existente). El mensaje MUST registrar `de_usuario_id` igual al
usuario autenticado. El contacto se realiza por la plataforma, sin compartir datos personales.

#### Scenario: Enviar un mensaje desde el directorio
- **WHEN** un miembro pulsa "Contactar" en un perfil y escribe un mensaje
- **THEN** el mensaje se guarda y aparece en la conversación con ese hermano

### Requirement: Confidencialidad emisor/receptor

Un mensaje SHALL ser visible únicamente para su emisor y su receptor. Ningún tercero SHALL leer la
conversación. La restricción MUST aplicarse en el servidor (RLS `msg_rw`).

#### Scenario: Tercero sin acceso
- **WHEN** un miembro que no es emisor ni receptor intenta leer un mensaje
- **THEN** la RLS lo impide

#### Scenario: No suplantar emisor
- **WHEN** un miembro intenta enviar un mensaje con `de_usuario_id` de otro
- **THEN** la RLS lo impide

### Requirement: Marcado de mensajes como leídos

El receptor de una conversación SHALL poder marcar como leídos los mensajes que ha recibido de un
emisor. Solo el receptor SHALL poder marcar sus propios mensajes recibidos, y la operación MUST
limitarse al estado de lectura (no altera el contenido). El conteo de no leídos del receptor SHALL
reflejarse en la navegación.

#### Scenario: Abrir una conversación marca como leídos
- **WHEN** el receptor abre una conversación con mensajes no leídos
- **THEN** esos mensajes quedan marcados como leídos y el contador de no leídos disminuye

#### Scenario: Solo el receptor marca sus mensajes
- **WHEN** un miembro intenta marcar como leídos mensajes que no le fueron dirigidos
- **THEN** la operación no afecta esos mensajes
