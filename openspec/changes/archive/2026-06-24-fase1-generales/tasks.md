## 1. Preparación

- [x] 1.1 Rama desde `main`; Supabase local arriba; tener un maestro y un hermano de prueba (registro + validación).

## 2. Cableado

- [x] 2.1 `lib/data/generales.ts`: `getGenerales(userId)` (select por `usuario_id`) y `guardarGenerales(g)` (upsert `onConflict: usuario_id`, normalizando vacíos a `null`). Tipos de `lib/types.ts`.
- [x] 2.2 `app/(app)/generales/page.tsx`: cargar con `useEffect` + estado (sin `setState` síncrono en efecto) y guardar async; feedback de "guardado".
- [x] 2.3 `app/(app)/admin/page.tsx` (`GestionUsuario`): leer y mostrar los Generales del hermano (solo lectura) en vez de "módulo en preparación".
- [x] 2.4 Quitar `getGenerales`/`guardarGenerales` de `lib/data/store.ts` (módulo migrado).

## 3. Validación

- [x] 3.1 Como hermano: guardar Generales y recuperarlos al recargar (persisten en Supabase).
- [x] 3.2 Como `pendiente`: puede llenar Generales.
- [x] 3.3 Como secretario: ver los Generales de un hermano de su logia (solo lectura).
- [x] 3.4 Seguridad: otro hermano NO accede a Generales ajenos; un admin NO ve Generales de otra logia (RLS).
- [x] 3.5 `npm run typecheck`, `npm run lint`, `npm run build` en verde.
