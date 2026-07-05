## ADDED Requirements

### Requirement: Los destinatarios pueden marcar correspondencia como leída

El sistema SHALL permitir que un secretario destinatario de una correspondencia la marque como leída,
registrando su lectura de forma trazable; solo los destinatarios (o el emisor) pueden hacerlo.

#### Scenario: Destinatario marca leído
- **GIVEN** una correspondencia dirigida a la logia B y un secretario de la logia B
- **WHEN** marca la correspondencia como leída
- **THEN** su lectura queda registrada en `leido_por` (idempotente)

#### Scenario: Un no destinatario no puede marcar leído
- **GIVEN** un secretario de una logia que no es emisora ni destinataria
- **WHEN** intenta marcar la correspondencia como leída
- **THEN** la operación es rechazada

#### Scenario: Ver quién ha leído
- **GIVEN** el emisor de una correspondencia
- **WHEN** la consulta
- **THEN** puede ver qué logias/usuarios la han marcado como leída
