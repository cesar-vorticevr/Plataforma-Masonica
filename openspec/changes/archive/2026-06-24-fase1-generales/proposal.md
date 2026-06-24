## Why

Tras quitar el modo mock, la pantalla **Generales** (`app/(app)/generales`) y la vista de Generales
del admin todavía leen de `lib/data/store.ts` (memoria): para un usuario real muestran vacío. Generales
es el **módulo de datos más simple** y el primero en migrarse a Supabase; estrena el **patrón de
migración** (helper en `lib/data/` + cableado de la página) que seguirán los demás módulos.

Fase del roadmap: **Fase 1 (MVP "Censo + identidad"), corte 2.** Toca **datos personales** (no sensibles).
La tabla `generales` y su RLS ya existen en las migraciones; **no se requiere migración nueva**.

## What Changes

- **Cablear Generales a Supabase:** el hermano lee/guarda sus propios datos de contacto (fecha de
  nacimiento, teléfono, dirección, contacto de emergencia, tipo de sangre, notas) contra la tabla
  `generales` (upsert por `usuario_id`).
- **Vista del admin:** en la pantalla de administración, al gestionar a un hermano de su logia, el
  secretario/admin **ve** sus Generales (reemplaza el "módulo en preparación"). Solo lectura.
- **Helper de datos** `lib/data/generales.ts` (Supabase) con la lógica de lectura/guardado.
- **Retirar** del `store.ts` mock las funciones de Generales (`getGenerales`, `guardarGenerales`) ya
  migradas (primer paso del retiro módulo-por-módulo del mock).
- Disponible también para hermanos en estado `pendiente` (pueden llenar Generales).

## Capabilities

### New Capabilities
- `generales`: gestión de los datos de contacto del hermano — edición por el propio hermano y visibilidad restringida (solo el dueño y los administradores de su logia; nunca otros hermanos).

### Modified Capabilities
<!-- Ninguna; la RLS y la tabla ya existen. -->

## Impact

- **Código:** `app/(app)/generales/page.tsx` (async contra Supabase), `app/(app)/admin/page.tsx`
  (`GestionUsuario` muestra Generales reales), **nuevo** `lib/data/generales.ts`. Quitar
  `getGenerales`/`guardarGenerales` de `lib/data/store.ts`.
- **Base de datos:** sin cambios (tabla `generales` + RLS `generales_rw` ya existen).
- **Seguridad/privacidad:** la RLS restringe Generales al **dueño** y a **administradores de su logia**
  (escritura solo del dueño). Datos personales (no sensibles); aun así, nunca visibles a otros hermanos.

## Non-goals

- Edición de Generales de un hermano por el secretario (este corte es solo lectura para el admin).
- Salud (datos sensibles + consentimiento) — corte siguiente.
- Borrar por completo `lib/data/store.ts`/`seed.ts` (se retira módulo por módulo; aquí solo Generales).
