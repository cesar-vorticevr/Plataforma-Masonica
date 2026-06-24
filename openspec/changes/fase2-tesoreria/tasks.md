## 1. Preparación

- [x] 1.1 Rama desde `main`; Supabase local; un tesorero + varios hermanos en una logia, y otra logia (para aislamiento).

## 2. Migración (esquema + RLS)

- [x] 2.1 `alter table perfiles add column fecha_inicio date;`
- [x] 2.2 Ajustar `perfiles_self`: añadir `or (mi_rol() = 'tesorero' and logia_id = mi_logia())` (lectura del tesorero de su logia).
- [x] 2.3 `set_inicio_capita(p_usuario uuid, p_fecha date)` `security definer` (`search_path=public`): valida tesorero/secretario/master de la misma logia; actualiza solo `fecha_inicio`. `grant execute` a `authenticated`.
- [x] 2.4 `supabase db reset`; verificar columna, policy y función.

## 3. Lógica y datos

- [x] 3.1 `lib/capitas.ts` (puro): `rangoCapitas`, `mesAplica`, `cumplimiento` (sin store; reciben datos).
- [x] 3.2 `lib/data/tesoreria.ts`: `listMiembros(logiaId)`, `getCapita/setCapita`, `listPagos(...)`, `togglePago(...)` (upsert por unique usuario_id,anio,mes), `setInicioCapita(usuario, fecha)` (RPC).

## 4. Pantalla

- [x] 4.1 `app/(app)/tesoreria/page.tsx`: carga async (miembros, cápita, pagos del año); matriz hermano×mes con marcar pagado; configurar monto; fijar fecha de inicio; indicadores (recaudado, % cumplimiento). Quitar imports del store mock.

## 5. Validación

- [x] 5.1 Marcar/desmarcar un pago persiste; los indicadores se actualizan.
- [x] 5.2 Configurar el monto de la cápita persiste.
- [x] 5.3 Fijar fecha de inicio recalcula los meses exigibles.
- [x] 5.4 **Aislamiento (RLS):** un tesorero/secretario NO lee ni escribe pagos/cápita/perfiles de otra logia.
- [x] 5.5 `npm run typecheck`, `npm run lint`, `npm run build` en verde.
