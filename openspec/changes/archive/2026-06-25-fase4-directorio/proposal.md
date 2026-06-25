## Why

El Directorio profesional sigue contra el store mock: lista perfiles, edita el propio y "contacta"
en memoria. La tabla `perfiles_profesionales` y su RLS ya existen (`prof_read` = opt-in interlogial,
`prof_write` = solo el propio), pero falta el cableado a Supabase. Es el primer corte de la Fase 4.

A diferencia del resto de superficies, el directorio es **interlogial y opt-in**: un hermano que
activa "mostrar en el directorio" acepta que cualquier miembro autenticado vea su nombre, logia y
datos profesionales. Como `perfiles_self` NO deja a un hermano leer el perfil de otro, el nombre y la
logia se **denormalizan** en `perfiles_profesionales` al guardar (consensual, sin ampliar la RLS de
`perfiles`).

## What Changes

- **`lib/data/directorio.ts`:** `listDirectorio()` (perfiles con `mostrar_en_directorio`, filtrados por
  RLS), `miPerfil(userId)`, `guardarPerfil(...)` (upsert del propio con `nombre`/`logia_id`
  denormalizados), `listLogias()` (mapa id→nombre/número, `logias` es legible).
- **Columnas denormalizadas en `perfiles_profesionales`:** `nombre text`, `logia_id uuid` (referencia a
  `logias`). Se rellenan con los datos del propio usuario al guardar.
- **`directorio/page.tsx` async:** listar (RLS decide), buscar (cliente), editar el perfil propio
  (incl. opt-in). El botón "Contactar" se conserva apuntando a la mensajería mock **hasta el corte de
  Mensajería** (siguiente); se documenta la dependencia.
- **`store.ts`:** retirar `listPerfilesDirectorio`/`getPerfil`/`guardarPerfil` (migrados). Mantener
  `enviarMensaje`/`getUsuario` (los usa la mensajería mock, aún sin migrar).

## Impact

- Affected specs: `directorio` (nueva capability).
- Affected code: `lib/data/directorio.ts` (nuevo), `app/(app)/directorio/page.tsx`, `lib/data/store.ts`,
  `lib/types.ts`, nueva migración `directorio_denormalizar`.
- Seguridad/privacidad: visibilidad opt-in interlogial preservada; la denormalización de nombre/logia
  es consentida (el usuario activa su aparición) y evita exponer todos los perfiles vía `perfiles`.
