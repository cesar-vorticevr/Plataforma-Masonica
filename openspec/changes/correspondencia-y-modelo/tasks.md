## 1. Correspondencia: marcado de lectura

- [ ] 1.1 Migración: RPC `marcar_correspondencia_leida(p_id)` (security definer) que valida destinatario/emisor/global y hace append idempotente a `leido_por`; grants solo a `authenticated`.
- [ ] 1.2 `lib/data/correspondencia.ts`: función que invoca la RPC.
- [ ] 1.3 UI `CorrespondenciaClient`: botón "marcar leído" y mostrar quién ha leído (para el emisor).

## 2. Eventos: adjuntos

- [ ] 2.1 Migración: `eventos.adjuntos` (jsonb/text[]) y policy de Storage para adjuntos de eventos que herede la visibilidad de `eventos` (patrón `EXISTS`).
- [ ] 2.2 `lib/data/eventos.ts` + UI: adjuntar y descargar (tipos permitidos PDF/Word/PNG/JPG).

## 3. Buzón: alcance

- [ ] 3.1 Migración: `buzon_documentos.alcance` (logia/global) y `logia_id` (denormalizado); recrear políticas de lectura para respetar el alcance.
- [ ] 3.2 UI: selector de alcance al subir; la lista respeta el alcance.

## 4. Verificación (Supabase + app)

- [ ] 4.1 Destinatario marca leído → queda en `leido_por`; no destinatario → rechazado; el emisor ve quién leyó.
- [ ] 4.2 Adjuntar archivo a un evento → visible solo para quienes ven el evento.
- [ ] 4.3 Documento de buzón con alcance logia → no visible para admins de otra logia; global → visible para todos los admin.

## 5. Calidad

- [ ] 5.1 `npm run typecheck` y `npm run lint` en verde.
