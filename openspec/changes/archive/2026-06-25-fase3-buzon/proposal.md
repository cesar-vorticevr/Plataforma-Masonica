## Why

El **Buzón interlogial** es un repositorio de documentos (PDF/Word) compartido entre las secretarías de
todas las logias. Hoy la pantalla mock solo guarda el nombre del archivo. Cablearlo introduce
**Supabase Storage** (subida/descarga real de archivos) — un componente nuevo del stack que reutilizarán
Correspondencia y Trabajos.

Fase del roadmap: **Fase 3, corte 2.** Toca **comunicación** y **almacenamiento de archivos**. El buzón
es **interlogial** (compartido entre administradores de cualquier logia); la RLS actual (`es_admin()`)
ya lo refleja — no requiere acotar por logia.

## What Changes

- **Migración (Storage):** crear un **bucket privado `buzon`** y políticas de `storage.objects` que
  permitan **solo a administradores** (`es_admin()`) subir, leer y borrar objetos de ese bucket.
- **Cablear el Buzón a Supabase:** subir el archivo real a Storage y guardar su ruta en
  `buzon_documentos.archivo_url`; listar los documentos; **descargar** mediante URL firmada (signed URL).
- **Helper `lib/data/buzon.ts`** (listar, subir = upload + metadata, URL firmada de descarga).
- **Quitar el nombre del autor** del listado (un secretario no puede leer el perfil de otro de distinta
  logia por RLS); se muestra título, tipo, fecha y descarga.
- **Retirar del `store.ts`** las funciones del buzón (`listBuzon`, `addBuzon`) ya migradas.

## Capabilities

### New Capabilities
- `buzon`: repositorio interlogial de documentos (PDF/Word) en Supabase Storage — los administradores suben, listan y descargan archivos compartidos entre secretarías, con acceso restringido a administradores tanto en la tabla como en el bucket.

### Modified Capabilities
<!-- Ninguna; se añade Storage y se cablea la pantalla. -->

## Impact

- **Base de datos / Storage:** migración que crea el bucket `buzon` (privado) y sus políticas de
  `storage.objects` (solo `es_admin()`). `buzon_documentos` y su RLS ya existen.
- **Código:** `app/(app)/buzon/page.tsx` (async, subida/descarga real), **nuevo** `lib/data/buzon.ts`;
  quitar `listBuzon`/`addBuzon` del `store.ts`.
- **Seguridad:** solo administradores acceden al buzón (tabla y bucket). Bucket privado: la descarga usa
  URL firmada temporal (no URL pública).

## Non-goals

- Control de versiones / carpetas del buzón; búsqueda avanzada.
- Límite de tamaño/tipos más allá del filtro del input (se puede afinar después).
- Correspondencia y Trabajos (cortes siguientes; reusarán Storage).
