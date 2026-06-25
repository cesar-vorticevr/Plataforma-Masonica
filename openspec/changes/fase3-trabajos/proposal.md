## Why

La pantalla de Trabajos, Burilados y Trazados sigue contra el store mock: lista y crea trabajos
en memoria y el archivo solo guarda el nombre. La tabla `trabajos` y su RLS de **visibilidad por
cámara** ya existen (`trabajos_read`/`trabajos_write` con `nivel(camara) <= nivel(mi_grado())` en la
misma logia), pero falta el almacenamiento real de archivos y el cableado a Supabase. Es el último
corte de la Fase 3 e introduce un patrón nuevo de RLS: visibilidad jerárquica por grado.

## What Changes

- **Archivos reales en Supabase Storage** (tercer uso): bucket privado `trabajos` con RLS de
  `storage.objects` que **refleja la visibilidad de la fila** (acceso al objeto solo si el usuario
  puede ver el trabajo: misma logia y `nivel(camara) <= nivel(mi_grado())`). Ruta `${trabajoId}/${uuid}-${nombre}`.
- **`lib/data/trabajos.ts`:** `listTrabajos()` (filtrada por RLS de cámara), `subir(...)` (genera id,
  inserta la fila con `archivo_url`/`archivo_nombre`/`autor_nombre`, sube el archivo a Storage),
  `urlDescarga(ruta)` (URL firmada ~1h).
- **Columnas de apoyo en `trabajos`:** `archivo_nombre` (nombre original a mostrar) y `autor_nombre`
  (denormalizado: el autor escribe su propio nombre en su propia fila, evitando ampliar la RLS de
  `perfiles` —un hermano no puede leer el perfil de otro—).
- **`trabajos/page.tsx` async:** listar respetando la cámara, subir archivo real, descargar vía URL
  firmada, mostrar `autor_nombre`. Quitar imports del store.
- **`store.ts`:** retirar `listTrabajosLogia`/`addTrabajo`. Ajustar el tipo `Trabajo`.

## Impact

- Affected specs: `trabajos` (nueva capability).
- Affected code: `lib/data/trabajos.ts` (nuevo), `app/(app)/trabajos/page.tsx`, `lib/data/store.ts`,
  `lib/types.ts`, nueva migración `trabajos_storage`.
- Seguridad: visibilidad por cámara preservada en tabla y Storage; un grado inferior no ve trabajos
  de cámaras superiores ni descarga sus archivos; aislamiento por logia intacto.
