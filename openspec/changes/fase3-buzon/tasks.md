## 1. Preparación

- [x] 1.1 Rama desde `main`; Supabase local; un administrador (secretario) y un hermano (caso negativo).

## 2. Migración (Storage)

- [x] 2.1 Crear bucket privado `buzon` (`insert into storage.buckets ... public=false on conflict do nothing`).
- [x] 2.2 Políticas de `storage.objects` para el bucket `buzon`: select/insert/delete con `bucket_id='buzon' and es_admin()`.
- [x] 2.3 `supabase db reset`; verificar bucket y políticas.

## 3. Datos y pantalla

- [x] 3.1 `lib/data/buzon.ts`: `listBuzon()`, `subir(titulo, tipo, file, autorId)` (upload a Storage + insert metadata con `archivo_url`), `urlDescarga(ruta)` (signed URL).
- [x] 3.2 `app/(app)/buzon/page.tsx` async: listar, subir archivo real, descargar (signed URL); sin nombre de autor. Quitar imports del store.
- [x] 3.3 Retirar `listBuzon`/`addBuzon` de `lib/data/store.ts`.

## 4. Validación

- [x] 4.1 Un administrador sube un PDF: queda en Storage y aparece listado.
- [x] 4.2 Descargar genera una URL firmada que abre el archivo.
- [x] 4.3 **Seguridad:** un hermano sin rol admin NO lee ni sube (tabla y Storage rechazan).
- [x] 4.4 `npm run typecheck`, `npm run lint`, `npm run build` en verde.
