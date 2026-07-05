## Why

La política `perfiles_update_self` (`UPDATE ... USING (id = auth.uid())`) **no tiene `WITH CHECK`**,
por lo que un usuario puede actualizar su **propia** fila de `perfiles` y cambiar campos privilegiados
(`rol`, `logia_id`, `estado`, `grado`) mediante una llamada directa a la API — auto-otorgándose, por
ejemplo, `rol='master'` o auto-validándose (`estado='validado'`). Es una escalada de privilegios que
contradice el modelo de seguridad de la especificación (§8.1: control de acceso por rol en el
servidor; la validación y el rol los asigna el secretario/Gran Secretaría, no el propio hermano).

Se descubrió al implementar `admin-designar-secretario`. Aquel cambio cerró la escalada por la vía del
admin de logia (`perfiles_admin`); este cierra la vía del **propio usuario**. Pertenece a la
**Fase 1 (identidad)** y **toca autorización** (no datos de salud).

## What Changes

- **BD (migración nueva):** trigger `BEFORE UPDATE` en `perfiles` que impide que el **dueño de la
  fila** (`auth.uid() = id`) cambie `rol`, `logia_id`, `estado` o `grado`, salvo que sea admin global
  (`es_global()`). No afecta:
  - a `service_role` ni a `postgres` (`auth.uid()` es nulo → no es "el dueño editándose"): el registro
    (que fija `logia_id` con service-role) y la semilla siguen funcionando;
  - a los administradores editando a **otros** (`auth.uid() ≠ id`): eso lo rige `perfiles_admin`;
  - a futuras auto-ediciones de campos **no** sensibles (p. ej. `foto`): siguen permitidas.

## Capabilities

### New Capabilities
- `perfil-integridad`: reglas de integridad/seguridad sobre la actualización del propio perfil
  (qué campos puede y no puede cambiar el dueño de la fila).

### Modified Capabilities
<!-- No hay specs previos publicados en openspec/specs/. -->

## Impact

- **Código:** una migración nueva en `supabase/migrations/`. Sin cambios de app (la app no hace
  self-update de `perfiles` hoy) ni de `lib/types.ts`.
- **Seguridad (servidor):** cierra la auto-escalada de rol/estado/logia/grado. Defensa en profundidad
  junto con el `with_check` de `perfiles_admin` (cambio `admin-designar-secretario`).
- **Privacidad:** no toca Salud; no cambia visibilidad de datos.
- **UI:** sin cambios; no requiere `DESIGN.md`.

## Non-goals

- No elimina la política `perfiles_update_self` (se conserva para permitir, en el futuro, editar
  campos no sensibles del propio perfil).
- No cambia cómo los administradores gestionan perfiles.
