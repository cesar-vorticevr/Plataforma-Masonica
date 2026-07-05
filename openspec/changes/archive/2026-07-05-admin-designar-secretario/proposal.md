## Why

El admin global no tiene forma de **designar al secretario de una logia** desde la plataforma,
pese a que la especificación lo define como una atribución central del Gran Secretario / Master:

- §4.1: el Gran Secretario "Da de alta logias y **secretarios**".
- §4.2 (matriz): *"Alta de logias y secretarios"* → **Sí** solo para Gran Secretario y Master.
- §5.13: "El Gran Secretario gestiona el alta de logias y de secretarios."

Hoy la gestión de un hermano solo permite validar+grado, alternar tesorero y bloquear; `adminSetRol`
está cableada únicamente al toggle de tesorero y no existe ninguna acción para nombrar secretario.
Sin esto, no se puede constituir la cadena de mando por logia (cada logia debe tener *su* secretario,
en singular, según el glosario), que es la base de casi todos los permisos (`mi_rol()`/`mi_logia()`).

Pertenece a la **Fase 1 (MVP): Censo + identidad**. **Toca permisos/autorización** (asignación de un
rol administrativo), por lo que la seguridad se aplica en el servidor. No toca datos de salud.

## What Changes

- **BD (migración nueva):**
  - RPC `designar_secretario(p_usuario uuid)` `security definer`, guard `es_global()`: valida que el
    usuario esté `validado` y pertenezca a una logia; **degrada a `hermano` al secretario anterior de
    esa logia** (regla "uno por logia") y promueve al usuario a `secretario`, en una sola transacción.
  - RPC `quitar_secretario(p_usuario uuid)` `security definer`, guard `es_global()`: devuelve a
    `hermano`.
  - **Endurecer** la política `perfiles_admin` (UPDATE) añadiendo `WITH CHECK` para que un admin de
    logia (no global) solo pueda dejar el `rol` en `hermano`/`tesorero` y no mueva el perfil a otra
    logia. Cierra una escalada de privilegios latente (hoy la política no tiene `with_check`).
  - Grants: `revoke` de public/anon y `grant execute` a `authenticated` en ambas RPC.
- **Datos:** `adminDesignarSecretario(sb, usuarioId)` y `adminQuitarSecretario(sb, usuarioId)` en
  `lib/data/identidad.ts`.
- **UI:** en `GestionUsuario` (dentro de `/admin`), botón "Designar secretario / Quitar secretario",
  **visible solo para admin global**, sobre los hermanos de la logia seleccionada.

## Capabilities

### New Capabilities
- `admin-designar-secretario`: designación (y remoción) del secretario de una logia por el admin
  global, con la regla de un secretario por logia y la autorización aplicada en el servidor.

### Modified Capabilities
<!-- No hay specs previos publicados en openspec/specs/; no se modifican capacidades existentes. -->

## Impact

- **Código:** nueva migración en `supabase/migrations/`, `lib/data/identidad.ts`,
  `app/(app)/admin/AdminClient.tsx`. Sin cambios en `lib/types.ts` (el rol `secretario` ya existe).
- **Seguridad (servidor):** autorización en las RPC (`es_global()`) + endurecimiento de RLS
  `perfiles_admin`. La UI (`can.altaLogias`/`global`) es solo conveniencia.
- **UI:** cumple `DESIGN.md` (reutiliza `Button`/`Modal` existentes); sin tokens nuevos.
- **Dependencia:** conviene después de `fix-admin-carga-master` (para que el admin global vea el panel).

## Non-goals

- No designa al **Gran Secretario** (cuenta gestionada por el Master; acción distinta y más rara).
- No agrega `secretario_id` a la tabla `logias`; el secretario se sigue representando con
  `perfiles.rol='secretario'` + `logia_id`, coherente con las funciones RLS actuales.
- No cambia el flujo de validación/grado ni el toggle de tesorero existentes.
