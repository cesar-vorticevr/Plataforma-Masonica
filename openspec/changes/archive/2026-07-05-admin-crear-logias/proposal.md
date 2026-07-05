## Why

Hoy no existe ninguna forma de **crear logias** desde la aplicación: las logias solo entran por
`seed.sql` o SQL manual. Esto rompe el arranque operativo, porque un hermano solo puede
registrarse en `/register` si su logia **ya existe** y **tiene palabra clave** (el registro
verifica `verificar_acceso` contra el hash de la logia). El permiso ya está previsto
(`can.altaLogias = esGlobal`) y RLS ya lo permite (`logias_admin` con `es_global()`), pero falta
la RPC de creación con hash, la función de datos y la UI. Sin esto, el admin global no puede poner
en marcha la plataforma ni incorporar nuevas logias a escala estatal (30+ logias previstas).

Pertenece a la **Fase 1 (MVP): Censo + identidad**. No requiere resolver decisiones abiertas del
§11. No toca datos de salud. Sí toca **datos sensibles de autenticación**: la palabra clave de la
logia se guarda **cifrada (hash bcrypt)**, nunca en texto plano, siguiendo el patrón existente
`set_palabra_logia`.

## What Changes

- **BD (migración nueva):** RPC `crear_logia(p_nombre text, p_numero int, p_clave text)`
  `security definer`, con guard `es_global()`, que inserta la logia con
  `palabra_clave = extensions.crypt(lower(trim(p_clave)), extensions.gen_salt('bf'))` y devuelve el
  `id` de la nueva logia. Grants: `revoke` de `public/anon`, `grant execute` a `authenticated`
  (igual que `set_palabra_logia`).
- **Datos:** `adminCrearLogia(sb, {nombre, numero, clave})` en `lib/data/identidad.ts` que invoca
  la RPC; conserva el estilo de las funciones existentes.
- **UI:** tarjeta "Crear logia" en `AdminClient.tsx`, visible solo si `global` (respaldada por
  `can.altaLogias`), con campos nombre + número + palabra clave; al crear, refresca el listado y
  selecciona la nueva logia.

## Capabilities

### New Capabilities
- `admin-alta-logias`: creación de una logia por el admin global desde `/admin`, incluyendo la
  fijación cifrada de su palabra clave, con las reglas de autorización y validación asociadas.

### Modified Capabilities
<!-- No hay specs previos en openspec/specs/; no se modifican capacidades existentes. -->

## Impact

- **Código:** nueva migración en `supabase/migrations/`, `lib/data/identidad.ts`,
  `app/(app)/admin/AdminClient.tsx`. Sin cambios en `lib/types.ts` (la forma de `Logia` no cambia).
- **Seguridad (servidor):** la autorización vive en la RPC (`es_global()`) y en RLS `logias_admin`;
  la palabra clave se hashea en el servidor dentro de la función `security definer`.
- **UI:** cumple `DESIGN.md` (reutiliza `Card`, `Input`, `Button`, `Select`); sin tokens nuevos.
- **Dependencia:** se apoya en que `/admin` cargue para el admin global (cambio
  `fix-admin-carga-master`); conviene aplicarlo después de esa corrección.

## Non-goals

- No agrega **edición** de logias existentes (nombre/número) ni su borrado.
- No agrega **alta directa de hermanos** desde el admin (siguen el auto-registro en `/register`).
- No cambia el flujo de `/register` ni `verificar_acceso`.
- No agrega la palabra clave general de la Orden (ya existe su gestión aparte).
