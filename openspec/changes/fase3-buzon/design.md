## Context

`buzon_documentos` existe con RLS `buzon_admin` (`es_admin()` para todo) — el buzón es interlogial
(compartido entre administradores de cualquier logia), así que NO se acota por logia. Falta el
almacenamiento real de archivos: se introduce **Supabase Storage** (primer uso; lo reusarán
Correspondencia y Trabajos). El nombre del autor no es legible entre logias (RLS de `perfiles`).

## Goals / Non-Goals

**Goals:** subir/listar/descargar documentos reales en un bucket privado, solo para administradores.
**Non-Goals:** versiones/carpetas; Correspondencia/Trabajos; límites finos de tamaño.

## Decisions

- **Bucket privado `buzon`** (`public=false`): la descarga usa **URL firmada** (`createSignedUrl`), no URL
  pública. Migración: `insert into storage.buckets (id,name,public) values ('buzon','buzon',false) on conflict do nothing`.
- **RLS de `storage.objects`** para el bucket (solo admin):
  - `select`, `insert`, `delete` con `bucket_id = 'buzon' and es_admin()`. (Las funciones `es_admin()`/`mi_rol()`
    leen `auth.uid()`, disponible en las peticiones de Storage.)
- **Ruta del objeto:** `${crypto.randomUUID()}-${file.name}` (evita colisiones; conserva el nombre original).
- **Helper `lib/data/buzon.ts`:** `listBuzon()` (select metadata, orden por fecha desc), `subir(titulo, tipo, file, autorId)`
  (upload a Storage → insert metadata con `archivo_url = ruta`), `urlDescarga(ruta)` (signed URL, ~1h).
- **Sin nombre de autor en el listado** (RLS de perfiles entre logias); se muestra título, tipo, fecha, descarga.
- **`store.ts`:** retirar `listBuzon`/`addBuzon` (migrados). `getUsuario` permanece (lo usan otros módulos).

## Risks / Trade-offs

- **Crear políticas en `storage.objects`:** la migración corre como rol privilegiado; nombres únicos por política. Validar que admin sube/lee y un hermano no.
- **Huérfanos:** si el insert de metadata falla tras subir, queda un objeto sin registro (aceptable; se podría limpiar luego).
- **URL firmada temporal:** expira; se genera al pulsar descargar (no se cachea).
- **Tipos/tamaño:** el input filtra .pdf/.doc/.docx; el límite real se puede reforzar en Storage después.

## Migration Plan

1. Rama; Supabase local; un administrador (secretario) y un hermano (para negativo).
2. Migración: bucket `buzon` + políticas de `storage.objects` (solo admin).
3. `lib/data/buzon.ts`; cablear `buzon/page.tsx` (subir/listar/descargar). Quitar store del buzón.
4. Validar (ver tasks): admin sube un PDF y lo descarga (signed URL); hermano no accede; typecheck/lint/build.
5. Rollback: revertir rama (bucket/políticas se recrean al revertir; objetos de prueba se pueden borrar).

## Open Questions

- ¿Conservar `archivo_nombre` original para mostrarlo? (Propuesta: va en la ruta; el listado muestra el título. Añadir columna si se requiere.)
- ¿Permitir borrar documentos del buzón? (Propuesta: fuera de este corte; la política de delete admin queda lista.)
