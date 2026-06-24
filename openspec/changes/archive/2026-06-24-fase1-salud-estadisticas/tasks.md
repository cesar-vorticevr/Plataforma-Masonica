## 1. Preparación

- [x] 1.1 Rama desde `main`; Supabase local; crear varios hermanos con evaluaciones en una logia (para superar el cohorte mínimo) + un secretario y otra logia.

## 2. Migración (función agregada)

- [x] 2.1 Migración: `estadisticas_salud(p_logia uuid default null) returns jsonb`, `security definer`, `set search_path = public`. Gating interno: global → cualquier/total; secretario → forzar `mi_logia()`; no admin → sin datos.
- [x] 2.2 Última evaluación por hermano (`distinct on`), agregación de semáforos + `unnest` de etiquetas/condiciones con `count`; salida SIN `usuario_id`.
- [x] 2.3 k-anonimato: `MIN_COHORTE = 5`; si `cohorte < MIN_COHORTE` → `suprimido=true` sin desglose.
- [x] 2.4 `grant execute` a `authenticated` (no `anon`). `supabase db reset` y verificar.

## 3. Cableado de la pantalla

- [x] 3.1 `lib/data/salud-estadisticas.ts`: RPC `estadisticas_salud(p_logia?)` con tipo de retorno.
- [x] 3.2 `app/(app)/estadisticas/page.tsx`: mostrar la parte de salud (semáforos, factores, padecimientos, participación) desde la función; selector de logia para global; mensaje de "cohorte insuficiente" cuando aplique. Conservar la leyenda de anonimización.
- [x] 3.3 Retirar de este corte las secciones de cápitas/asistencia y el comparativo por logia (vuelven con tesorería/tenidas). Ajustar imports del store mock que queden sin uso.

## 4. Validación

- [x] 4.1 Con cohorte suficiente: agregados correctos (semáforos + prevalencia de etiquetas/condiciones).
- [x] 4.2 Con cohorte por debajo del umbral: respuesta suprimida (sin desglose).
- [x] 4.3 Seguridad: secretario obtiene solo su logia; un hermano no obtiene agregados; la salida nunca trae `usuario_id`.
- [x] 4.4 El detalle individual sigue bloqueado (RLS `salud_owner`) — los agregados no lo exponen.
- [x] 4.5 `npm run typecheck`, `npm run lint`, `npm run build` en verde.
