## Context

La tabla `correspondencia` y su RLS base ya existen (init_schema):
- `corr_read`: `es_admin() and (de_logia_id = mi_logia() or mi_logia() = any(destinatarios_logia_ids) or es_global())`.
- `corr_write` (insert): `es_admin() and de_logia_id = mi_logia()`.

Falta el almacenamiento real de adjuntos. A diferencia del buzón (interlogial: cualquier admin lee
todo), la correspondencia es **dirigida**: el adjunto solo debe ser accesible para emisor/destinatarios.
Por eso NO se reutiliza el bucket `buzon` (su RLS es `es_admin()` para cualquiera) — se crea uno propio
cuya RLS **refleja la visibilidad de la fila**.

## Goals / Non-Goals

**Goals:** enviar/listar correspondencia dirigida con adjuntos reales en bucket privado; descarga por
URL firmada; aislamiento por logia en tabla y Storage.
**Non-Goals:** marcar leído (`leido_por` se inicializa al autor; no se expone "marcar leído" en esta
pantalla); hilos/respuestas; límites finos de tamaño.

## Decisions

- **Bucket privado `correspondencia`** (`public=false`). Migración:
  `insert into storage.buckets (id,name,public) values ('correspondencia','correspondencia',false) on conflict do nothing`.
- **Ruta del objeto:** `${corrId}/${crypto.randomUUID()}-${file.name}`. El prefijo (carpeta) es el id de la
  correspondencia, lo que permite a la RLS de Storage enlazar el objeto con su fila.
- **RLS de `storage.objects`** para el bucket, reflejando la visibilidad de la fila vía subconsulta
  (la subconsulta respeta la RLS de `correspondencia`, así que solo "ve" filas accesibles al usuario):
  - `select`: `bucket_id='correspondencia' and es_admin() and exists (select 1 from correspondencia c where c.id = split_part(name,'/',1)::uuid)`.
  - `insert`: `bucket_id='correspondencia' and es_admin() and exists (select 1 from correspondencia c where c.id = split_part(name,'/',1)::uuid and c.de_logia_id = mi_logia())` (solo subes a tu propia correspondencia, que ya debe existir).
- **Orden en `enviar`:** generar `corrId = crypto.randomUUID()`; **insertar primero** la fila (con adjuntos
  `{nombre,tipo,ruta}` precalculados) para que exista al subir; luego subir cada archivo a su `ruta`. Si una
  subida falla, se informa (la fila queda con referencia a un adjunto faltante; aceptable, se puede limpiar).
- **Endurecer `corr_write`:** recrear con `with check (es_admin() and de_logia_id = mi_logia() and autor_id = auth.uid())`.
- **Helper `lib/data/correspondencia.ts`:** `listCorrespondencia()` (select ordenado por fecha desc, la RLS
  filtra), `enviar(deLogia, destinos, asunto, cuerpo, files, autorId)`, `urlDescarga(ruta)` (signed URL ~1h).
- **Tipo `Correspondencia.adjuntos`:** `{ nombre: string; tipo: string; ruta: string }[]` (se añade `ruta`).
- **`store.ts`:** retirar `listCorrespondencia`/`addCorrespondencia`.

## Risks / Trade-offs

- **Subconsulta en RLS de Storage:** depende de que la subconsulta respete la RLS de `correspondencia`
  (políticas no-`security definer` → sí la respetan). Validar admin-no-relacionado denegado.
- **Insert antes de subir:** ventana en la que la fila referencia adjuntos aún no subidos; si falla la
  subida queda una referencia huérfana (no rompe el listado; el adjunto simplemente no descarga).
- **`split_part(name,'/',1)::uuid`:** si un objeto se subiera con ruta sin prefijo válido, el cast fallaría;
  solo el helper escribe rutas, siempre con prefijo `corrId/`.

## Migration Plan

1. Rama; Supabase local; dos logias con un admin cada una + un admin de una tercera (no relacionado) + un hermano.
2. Migración `correspondencia_storage`: bucket + políticas de `storage.objects`; recrear `corr_write` endurecida.
3. `lib/data/correspondencia.ts`; cablear `correspondencia/page.tsx`; ajustar tipo y quitar store.
4. Validar (ver tasks): emisor envía con adjunto; destinatario lo ve y descarga; tercero/hermano denegados; typecheck/lint/build.
5. Rollback: revertir rama (bucket/políticas se recrean al revertir).

## Open Questions

- ¿Marcar correspondencia como leída? (Propuesta: fuera de este corte; requeriría política UPDATE sobre `leido_por`.)
- ¿Borrar/retirar correspondencia enviada? (Propuesta: fuera de este corte.)
