## Context

La tabla `generales` (PK `usuario_id` → `perfiles.id`) y su política `generales_rw` ya existen en las
migraciones: lectura para el dueño y para administradores de su logia; escritura (with check) solo del
dueño (`usuario_id = auth.uid()`). Solo falta cablear la app (hoy usa el `store.ts` mock). Es el primer
módulo de datos que se migra: define el **patrón** para los siguientes.

## Goals / Non-Goals

**Goals:**
- El hermano lee/guarda sus Generales en Supabase (upsert por `usuario_id`).
- El admin de la logia ve (solo lectura) los Generales de un hermano de su logia.
- Helper reutilizable `lib/data/generales.ts`; retirar las funciones mock de Generales del `store.ts`.

**Non-Goals:**
- Edición de Generales ajenos por el admin (solo lectura aquí).
- Salud / consentimiento (corte siguiente).

## Decisions

- **Patrón de migración por módulo:** un helper `lib/data/<modulo>.ts` con funciones async (Supabase) que
  reemplaza las del `store.ts`. La página pasa a cargar con `useEffect` + estado y guardar async. Generales
  lo estrena; los módulos siguientes lo replican.
- **Upsert por `usuario_id`.** Guardar = `from('generales').upsert({ usuario_id, ...campos }, { onConflict: 'usuario_id' })`.
  La RLS (with check `usuario_id = auth.uid()`) garantiza que solo escribe su propia fila.
- **Vista del admin = lectura.** `GestionUsuario` lee los Generales del hermano con el mismo helper
  (la RLS permite al admin de la logia). No se habilita edición en este corte.
- **Tipos.** Reutilizar `Generales` de `lib/types.ts`. El campo `fecha_nacimiento` es `date` en Postgres;
  se maneja como string `YYYY-MM-DD` en el `<input type="date">`.
- **Retiro del mock.** Quitar `getGenerales`/`guardarGenerales` de `store.ts` (ya migradas). El resto del
  store permanece para los módulos aún no cableados.

## Risks / Trade-offs

- **`null` vs cadena vacía:** los `<input>` usan `?? ""`; al guardar, normalizar vacíos a `null` para no
  almacenar cadenas vacías (o aceptarlas) — decidir y ser consistente.
- **Pendiente sin logia validada:** un `pendiente` puede guardar Generales (RLS por `auth.uid()`, no por estado). OK.
- **Carga async:** la página muestra un estado de carga breve; evitar `setState` síncrono en efectos (regla de lint).

## Migration Plan

1. Rama desde `main`; Supabase local arriba; crear maestro / registrar un hermano de prueba.
2. `lib/data/generales.ts`: `getGenerales(userId)` (select) y `guardarGenerales(g)` (upsert).
3. Cablear `app/(app)/generales/page.tsx` (carga async + guardar) y `GestionUsuario` (lectura).
4. Quitar `getGenerales`/`guardarGenerales` de `store.ts`.
5. Validar (ver tasks): guardar/recuperar propios; admin ve los del hermano de su logia; aislamiento; otro hermano no accede.
6. `typecheck`/`lint`/`build` verdes. Rollback: revertir rama.

## Open Questions

- ¿Normalizar campos vacíos a `null` al guardar? (Propuesta: sí, para no guardar cadenas vacías.)
- ¿El admin debería poder **editar** ciertos Generales del hermano? (Decisión abierta §11 del .docx; fuera de este corte.)
