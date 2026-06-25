## Context

La tabla `perfiles_profesionales` y su RLS ya existen (init_schema):
- `prof_read`: `mostrar_en_directorio or usuario_id = auth.uid()` — opt-in interlogial.
- `prof_write` (all): `usuario_id = auth.uid()` — solo el propio.

Columnas actuales: `usuario_id, profesion, sector, negocio, descripcion, palabras_clave[], mostrar_en_directorio`.
Falta cablear la pantalla a Supabase. El reto de gobierno: la pantalla muestra nombre y logia del
hermano, pero `perfiles_self` NO permite a un hermano leer el perfil de otro. Como el directorio es
**opt-in** (el usuario decide aparecer), se **denormaliza** su nombre y logia en el propio registro
profesional al guardar — consentido y sin abrir la lectura de `perfiles` a toda la membresía.

## Goals / Non-Goals

**Goals:** listar/editar perfiles profesionales reales con opt-in interlogial; mostrar nombre+logia sin
ampliar la RLS de `perfiles`; búsqueda por texto.
**Non-Goals:** mensajería (corte siguiente; "Contactar" sigue en mock); foto de perfil; verificación de
datos profesionales; filtros avanzados/paginación.

## Decisions

- **Denormalizar (migración):** `alter table perfiles_profesionales add column if not exists nombre text`
  y `... logia_id uuid references logias(id)`. Se rellenan con el nombre y la logia del propio usuario al
  guardar (el usuario puede leer su propio `perfiles`, así que los aporta el cliente desde el contexto de auth).
- **Logia para mostrar:** se lee de `logias` (RLS `logias_read = true`); el listado mapea `logia_id`→nombre/número.
- **Helper `lib/data/directorio.ts`:**
  - `listDirectorio()`: `select * from perfiles_profesionales` (la RLS deja solo opt-in + el propio), orden por `nombre`.
  - `miPerfil(userId)`: `select ... eq usuario_id` (single, puede no existir).
  - `guardarPerfil(perfil, nombre, logiaId)`: `upsert` por `usuario_id` con los campos + `nombre`/`logia_id` denormalizados.
  - `listLogias()`: para el mapa de nombres/números.
- **Tipo `PerfilProfesional`:** añadir `nombre?: string` y `logia_id?: string` (denormalizados).
- **Pantalla:** quitar `getUsuario`/`getLogia`/`getPerfil`/`guardarPerfil`/`listPerfilesDirectorio` del store;
  usar el helper. El propio perfil se excluye del listado en cliente. "Contactar" mantiene `enviarMensaje`
  (mock) hasta el corte de Mensajería; se deja una nota.
- **`store.ts`:** retirar `listPerfilesDirectorio`/`getPerfil`/`guardarPerfil`. Conservar `enviarMensaje`,
  `getUsuario`, `getLogia` (los usan mensajería mock y otras superficies aún sin migrar).

## Risks / Trade-offs

- **Denormalización de nombre/logia:** puede quedar obsoleta si el usuario cambia nombre/logia; se refresca
  al volver a guardar el perfil. Aceptable; alternativa (abrir `perfiles` a la membresía) tiene peor privacidad.
- **Dependencia mock transitoria:** "Contactar" sigue en mock hasta Mensajería; estado intermedio explícito.
- **Búsqueda en cliente:** suficiente para el volumen opt-in actual; si crece, mover a `ilike`/full-text en SQL.

## Migration Plan

1. Rama; Supabase local; tres miembros en logias distintas, dos con perfil opt-in y uno sin opt-in.
2. Migración `directorio_denormalizar`: columnas `nombre`/`logia_id`.
3. `lib/data/directorio.ts`; cablear `directorio/page.tsx`; ajustar tipo y quitar store del directorio.
4. Validar (ver tasks): editar/opt-in/opt-out; ver perfiles interlogiales; perfil oculto no aparece; solo el dueño edita; typecheck/lint/build.
5. Rollback: revertir rama (columnas se recrean al revertir).

## Open Questions

- ¿Restringir el directorio a una logia o mantenerlo interlogial? (Propuesta: interlogial, como la RLS actual y el propósito de red profesional.)
- ¿Mostrar foto? (Propuesta: fuera de este corte.)
