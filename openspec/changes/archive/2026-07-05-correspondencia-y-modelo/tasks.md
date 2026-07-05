## 1. Correspondencia: marcado de lectura

- [x] 1.1 Migración: RPC `marcar_correspondencia_leida(p_id)` (security definer) que valida destinatario/emisor/global y hace append idempotente a `leido_por`; grants solo a `authenticated`. → `20260705142830_correspondencia_y_modelo.sql`
- [x] 1.2 `lib/data/correspondencia.ts`: `marcarLeida(sb, id)` que invoca la RPC.
- [x] 1.3 UI `CorrespondenciaClient`: botón "Marcar como leída" (recibidas) y conteo de lecturas (emisor).

## 2. Eventos: adjuntos

- [x] 2.1 Migración: `eventos.adjuntos` (jsonb) + bucket `eventos` (privado) + policies de Storage (select hereda visibilidad de `eventos` vía EXISTS; insert `es_admin()`).
- [x] 2.2 `lib/data/eventos.ts` + UI: adjuntar al publicar y descargar (enlace firmado); tipos PDF/Word/PNG/JPG.

## 3. Buzón: alcance

- [x] 3.1 Migración: `buzon_documentos.alcance` (logia/global) y `logia_id`; políticas separadas (lectura alcance-aware; insert/update/delete solo admin).
- [x] 3.2 UI: selector de alcance al subir; la lista muestra el alcance y lo respeta.

## 4. Verificación (Supabase + app)

- [x] 4.1 Destinatario marca leído → queda en `leido_por` (count=1); no destinatario → rechazado; el emisor ve el conteo. (verificado)
- [x] 4.2 `eventos.adjuntos` + bucket + policies presentes; `/eventos` 200 con adjuntar/descargar.
- [x] 4.3 Documento de buzón con alcance logia → no visible para admins de otra logia; global → visible para todos los admin. (verificado: secretario B ve solo global; secretario A ve ambas)

## 5. Calidad

- [x] 5.1 `npm run typecheck` y `npm run lint` en verde.
