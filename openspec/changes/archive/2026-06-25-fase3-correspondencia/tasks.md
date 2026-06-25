## 1. Preparación

- [x] 1.1 Rama desde `main`; Supabase local; dos logias con un admin cada una, un admin de una tercera logia (no relacionado) y un hermano (casos negativos).

## 2. Migración (Storage + RLS)

- [x] 2.1 Crear bucket privado `correspondencia` (`insert into storage.buckets ... public=false on conflict do nothing`).
- [x] 2.2 Políticas de `storage.objects` para `correspondencia`: `select` (admin + existe fila visible) e `insert` (admin + existe fila propia), enlazando por `split_part(name,'/',1)::uuid`.
- [x] 2.3 Recrear `corr_write` endurecida: `with check (es_admin() and de_logia_id = mi_logia() and autor_id = auth.uid())`.
- [x] 2.4 `supabase db reset`; verificar bucket y políticas.

## 3. Datos y pantalla

- [x] 3.1 `lib/data/correspondencia.ts`: `listCorrespondencia()`, `enviar(deLogia, destinos, asunto, cuerpo, files, autorId)` (insert fila con adjuntos `{nombre,tipo,ruta}` → upload a Storage), `urlDescarga(ruta)` (signed URL).
- [x] 3.2 Ajustar `Correspondencia.adjuntos` en `lib/types.ts` a `{ nombre; tipo; ruta }[]`.
- [x] 3.3 `app/(app)/correspondencia/page.tsx` async: listar (RLS decide enviada/recibida), redactar con adjunto real, descargar vía URL firmada. Quitar imports del store.
- [x] 3.4 Retirar `listCorrespondencia`/`addCorrespondencia` de `lib/data/store.ts`.

## 4. Validación

- [x] 4.1 Admin de logia A envía a logia B con un adjunto: la fila se crea y el archivo queda en Storage.
- [x] 4.2 Admin de A la ve como "Enviada"; admin de B la ve como "Recibida" y descarga el adjunto (URL firmada).
- [x] 4.3 **Seguridad:** admin de una tercera logia (no relacionada) NO lee la fila ni descarga el adjunto.
- [x] 4.4 **Seguridad:** un hermano sin rol admin NO lee ni envía.
- [x] 4.5 **Seguridad:** un admin no puede insertar con `autor_id` falseado ni `de_logia_id` ajeno.
- [x] 4.6 `npm run typecheck`, `npm run lint`, `npm run build` en verde.
