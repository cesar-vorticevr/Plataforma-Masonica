## Context

`evaluaciones_salud` es solo-dueño (RLS `salud_owner`): nadie más lee filas individuales. Para que los
administradores vean prevalencias sin acceder a lo individual, se usa una función **`security definer`**
(corre con privilegios del creador, salta la RLS para leer) que devuelve **solo agregados**. Es el diseño
más sensible del proyecto: la función es la única puerta a esos datos, así que debe gatear acceso y anonimizar.

## Goals / Non-Goals

**Goals:**
- Función `security definer` que devuelve agregados de salud (semáforos + prevalencia de etiquetas/condiciones)
  por logia o total, sobre la última evaluación por hermano.
- Anonimización por **cohorte mínimo** (suprimir bajo umbral) y **cero identificadores** en la salida.
- Gating interno por rol/logia (no confiar en la UI). Wire de la parte de salud de la pantalla.

**Non-Goals:**
- Cápitas/asistencia/comparativo (módulos tesorería/tenidas; sus cortes).
- Tendencias temporales y exportación.

## Decisions

- **Una función `estadisticas_salud(p_logia uuid default null) returns jsonb`, `security definer`,
  `set search_path = public`.** Devuelve un objeto: `{ cohorte, suprimido, semaforo_metabolico:{verde,amarillo,rojo},
  semaforo_oncologico:{...}, etiquetas:[{k,n}], condiciones:[{k,n}] }`.
- **Gating interno (clave):** al inicio, resolver el alcance según el llamante:
  - `es_global()` → puede `p_logia` cualquiera, o `null` = todas.
  - `es_admin()` no global (secretario) → se **fuerza** `p_logia := mi_logia()` (ignora lo pedido).
  - ni admin → `raise exception` / retorno vacío. Así la UI no puede ampliar el alcance.
- **Última evaluación por hermano:** `distinct on (usuario_id) ... order by usuario_id, fecha desc` sobre las
  evaluaciones de los perfiles en alcance; se agrega sobre ese conjunto (evita doble conteo del histórico).
- **k-anonimato:** `MIN_COHORTE = 5` (constante en la función). Si `cohorte < MIN_COHORTE` → `suprimido=true`
  y sin desglose. (El `cohorte` numérico se devuelve, pero no el detalle por etiqueta.)
- **Salida agregada, sin identificadores:** se hace `unnest(etiquetas)`/`unnest(condiciones)` y `count`; jamás
  se selecciona `usuario_id` en la salida.
- **EXECUTE acotado:** conceder `execute` a `authenticated` (el gating por rol vive dentro de la función);
  no a `anon`. La función no expone nada si el llamante no es admin.
- **Pantalla:** `estadisticas/page.tsx` consume la función vía RPC y muestra semáforos + factores +
  padecimientos + participación. Las secciones de cápitas/asistencia y el comparativo se **retiran de este
  corte** (vuelven al cablear sus módulos). Se conserva la leyenda de anonimización.

## Risks / Trade-offs

- **`security definer` mal gateado = fuga.** Mitigación: gating por rol/logia DENTRO de la función + tests
  (secretario solo su logia; hermano sin acceso; global todas). Revisar con la skill `supabase`.
- **Reidentificación en grupos chicos.** Mitigación: cohorte mínimo (suprimir). Documentar el umbral.
- **`search_path` en security definer.** Fijar `set search_path = public` (lección de cortes previos).
- **Rendimiento (distinct on + unnest) a escala.** Aceptable para el volumen; revisar índices con `supabase-postgres-best-practices` si crece.
- **Reducción de la pantalla:** quitar cápitas/asistencia ahora puede sorprender; se documenta que vuelven con sus módulos.

## Migration Plan

1. Rama desde `main`; Supabase local; varios hermanos con evaluaciones (para superar el cohorte mínimo) en una logia, y un secretario.
2. Migración: `estadisticas_salud(...)` security definer + grant execute a authenticated.
3. `lib/data/salud-estadisticas.ts` (RPC) + cablear la parte de salud de la pantalla; retirar cápitas/asistencia/comparativo del corte.
4. Validar (ver tasks): agregados correctos; supresión bajo umbral; secretario acotado a su logia; hermano sin acceso; el detalle individual sigue bloqueado.
5. `typecheck`/`lint`/`build` verdes. Rollback: revertir rama (migración aditiva).

## Open Questions

- Umbral de cohorte: ¿5 es adecuado para esta membresía? (Ajustable; default 5.)
- ¿Agregado por **oriente** además de por logia para el gran secretario? (Propuesta: por logia y total ahora; oriente, después.)
- ¿Mostrar el `cohorte` aunque se suprima el desglose? (Propuesta: sí, el tamaño del cohorte no identifica.)
