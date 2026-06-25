## Why

La pantalla de Correspondencia masónica sigue contra el store mock: lista y crea
correspondencia en memoria y los adjuntos solo guardan el nombre del archivo. La tabla
`correspondencia` y su RLS base (`corr_read`/`corr_write`) ya existen, pero falta el
almacenamiento real de adjuntos y el cableado de la pantalla a Supabase. A diferencia del
buzón (interlogial, cualquier admin), la correspondencia es dirigida: solo la logia emisora
y las destinatarias deben poder leerla y descargar sus adjuntos.

## What Changes

- **Adjuntos reales en Supabase Storage** (segundo uso): bucket privado `correspondencia` con
  RLS de `storage.objects` que **refleja la visibilidad de la fila** (acceso al objeto solo si
  el admin puede ver la correspondencia correspondiente). Ruta `${corrId}/${uuid}-${nombre}`.
- **Endurecer RLS de la tabla:** `corr_write` exige además `autor_id = auth.uid()` (no falsear autor).
- **`lib/data/correspondencia.ts`:** `listCorrespondencia()` (filtrada por RLS), `enviar(...)`
  (genera id, sube adjuntos a Storage, inserta la fila con metadata `{nombre, tipo, ruta}`),
  `urlDescarga(ruta)` (URL firmada ~1h).
- **`correspondencia/page.tsx` async:** listar (RLS decide enviada/recibida), redactar con adjunto
  real, descargar adjunto vía URL firmada. Quitar imports del store.
- **`store.ts`:** retirar `listCorrespondencia`/`addCorrespondencia` (migrados). Ajustar el tipo
  `Correspondencia.adjuntos` para incluir `ruta`.

## Impact

- Affected specs: `correspondencia` (nueva capability).
- Affected code: `lib/data/correspondencia.ts` (nuevo), `app/(app)/correspondencia/page.tsx`,
  `lib/data/store.ts`, `lib/types.ts`, nueva migración `correspondencia_storage`.
- Seguridad: aislamiento por logia preservado tanto en tabla como en Storage; admins ven solo
  la correspondencia que envían o reciben (más global).
