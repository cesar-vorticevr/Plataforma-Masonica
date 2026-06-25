## 1. Preparación

- [x] 1.1 Rama desde `main`; Supabase local; en logia A un aprendiz, un compañero y un maestro; en logia B un maestro (negativo de logia).

## 2. Migración (Storage + columnas)

- [x] 2.1 `alter table trabajos add column if not exists archivo_nombre text` y `... autor_nombre text`.
- [x] 2.2 Crear bucket privado `trabajos` (`insert into storage.buckets ... public=false on conflict do nothing`).
- [x] 2.3 Políticas de `storage.objects` para `trabajos`: `select` (existe fila visible) e `insert` (existe fila propia), enlazando por `split_part(name,'/',1)::uuid`.
- [x] 2.4 `supabase db reset`; verificar columnas, bucket y políticas.

## 3. Datos y pantalla

- [x] 3.1 `lib/data/trabajos.ts`: `listTrabajos()`, `subir(usuarioId, logiaId, titulo, descripcion, camara, file, autorNombre)` (insert fila con `archivo_url`/`archivo_nombre`/`autor_nombre` → upload a Storage), `urlDescarga(ruta)` (signed URL).
- [x] 3.2 Ajustar `Trabajo` en `lib/types.ts`: añadir `archivo_url?` y `autor_nombre?`.
- [x] 3.3 `app/(app)/trabajos/page.tsx` async: listar (RLS filtra por cámara/logia), subir archivo real, descargar vía URL firmada, mostrar `autor_nombre`. Quitar imports del store.
- [x] 3.4 Retirar `listTrabajosLogia`/`addTrabajo` de `lib/data/store.ts`.

## 4. Validación

- [x] 4.1 Un maestro sube trabajos de cámara aprendiz, compañero y maestro: filas creadas y archivos en Storage.
- [x] 4.2 El maestro ve los tres; el compañero ve aprendiz+compañero; el aprendiz ve solo aprendiz.
- [x] 4.3 **Seguridad:** el aprendiz NO descarga el archivo de un trabajo de cámara maestro (Storage lo rechaza).
- [x] 4.4 **Seguridad:** el aprendiz NO inserta un trabajo de cámara maestro (RLS de la tabla lo rechaza).
- [x] 4.5 **Seguridad:** un maestro de la logia B NO ve ni descarga los trabajos de la logia A.
- [x] 4.6 `npm run typecheck`, `npm run lint`, `npm run build` en verde.
