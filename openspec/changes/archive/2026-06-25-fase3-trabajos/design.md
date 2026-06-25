## Context

La tabla `trabajos` y su RLS ya existen (init_schema) y son correctas:
- `trabajos_read`: `logia_id = mi_logia() and nivel(camara) <= nivel(mi_grado())`.
- `trabajos_write` (insert): `usuario_id = auth.uid() and nivel(camara) <= nivel(mi_grado())`.

`nivel(grado_t)` mapea aprendiz=1, compañero=2, maestro=3. `mi_grado()` lee el grado del perfil.
Falta el almacenamiento real de archivos (la columna `archivo_url` existe pero la pantalla solo
guarda el nombre) y el cableado a Supabase. Tercer uso de Storage, reutilizando el patrón de
correspondencia (RLS de Storage que refleja la visibilidad de la fila vía subconsulta).

`perfiles_self` (SELECT) NO permite a un hermano leer el perfil de otro de su logia (solo el propio,
o admins/tesorero de la logia). Por eso el nombre del autor se **denormaliza** en la fila al subir.

## Goals / Non-Goals

**Goals:** subir/listar/descargar trabajos reales con visibilidad jerárquica por cámara en bucket
privado; mostrar autor sin ampliar la RLS de `perfiles`.
**Non-Goals:** comentarios/valoración de trabajos; versiones; borrar trabajos; límites finos de tamaño.

## Decisions

- **Columnas de apoyo (migración):** `alter table trabajos add column if not exists archivo_nombre text`
  y `... autor_nombre text`. `archivo_url` (existente) guarda la ruta en Storage.
- **Bucket privado `trabajos`** (`public=false`). Descarga por URL firmada.
- **Ruta del objeto:** `${trabajoId}/${crypto.randomUUID()}-${file.name}`; el prefijo (carpeta) es el id
  del trabajo, lo que permite a la RLS de Storage enlazar el objeto con su fila.
- **RLS de `storage.objects`** para el bucket, reflejando la visibilidad de la fila (la subconsulta
  respeta `trabajos_read`/`trabajos_write`, así que solo "ve" filas accesibles al usuario):
  - `select`: `bucket_id='trabajos' and exists (select 1 from trabajos t where t.id = split_part(name,'/',1)::uuid)`.
  - `insert`: `bucket_id='trabajos' and exists (select 1 from trabajos t where t.id = split_part(name,'/',1)::uuid and t.usuario_id = auth.uid())`.
- **Orden en `subir`:** generar `id = crypto.randomUUID()`; **insertar primero** la fila (con `archivo_url`,
  `archivo_nombre`, `autor_nombre`, `camara`) para que exista al subir; luego subir el archivo a su ruta.
- **Autor denormalizado:** `autor_nombre` lo aporta el cliente con el nombre del usuario actual (su propia
  fila, `usuario_id = auth.uid()`); evita leer `perfiles` de otros y muestra quién subió el trabajo.
- **Helper `lib/data/trabajos.ts`:** `listTrabajos()` (select ordenado por fecha desc, la RLS filtra por
  cámara/logia), `subir(usuarioId, logiaId, titulo, descripcion, camara, file, autorNombre)`,
  `urlDescarga(ruta)` (signed URL ~1h).
- **Tipo `Trabajo`:** añadir `archivo_url?: string` y `autor_nombre?: string` (mantener `archivo_nombre`).
- **`store.ts`:** retirar `listTrabajosLogia`/`addTrabajo`. El filtro cliente `puedeVerTrabajo` se vuelve
  redundante (la RLS ya filtra); se conserva el filtro de cámara como UI.

## Risks / Trade-offs

- **Subconsulta en RLS de Storage:** depende de que respete la RLS de `trabajos` (políticas no
  `security definer` → sí). Validar que un grado inferior no descargue archivos de cámara superior.
- **Insert antes de subir:** ventana en la que la fila referencia un archivo aún no subido; si falla la
  subida queda una referencia huérfana (no rompe el listado; el archivo no descarga).
- **`autor_nombre` denormalizado:** puede quedar obsoleto si el usuario cambia su nombre; aceptable para
  un artefacto inmutable. Alternativa (ampliar `perfiles_self` a la logia) tiene implicaciones de privacidad.

## Migration Plan

1. Rama; Supabase local; en una logia: un aprendiz, un compañero y un maestro; en otra logia: un maestro (negativo de logia).
2. Migración `trabajos_storage`: columnas `archivo_nombre`/`autor_nombre`; bucket `trabajos`; políticas de `storage.objects`.
3. `lib/data/trabajos.ts`; cablear `trabajos/page.tsx`; ajustar tipo y quitar store.
4. Validar (ver tasks): subir por cámara; visibilidad jerárquica; descarga firmada; negativos por grado y por logia; typecheck/lint/build.
5. Rollback: revertir rama (columnas/bucket/políticas se recrean al revertir; objetos de prueba se pueden borrar).

## Open Questions

- ¿Mostrar el autor con perfil real en vez de denormalizado? (Propuesta: denormalizado por privacidad; revisar si se requiere directorio interno por logia.)
- ¿Permitir borrar/retirar un trabajo propio? (Propuesta: fuera de este corte.)
