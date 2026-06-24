## Context

`evaluaciones_salud` y `consentimientos` existen con RLS **solo-dueño** (`salud_owner`, `consent_rw`).
La lógica orientativa (`lib/health.ts`: `PREGUNTAS`, `evaluar()` → puntajes/semáforos/etiquetas/condiciones)
ya existe. Falta: (1) la columna `condiciones` en la tabla (el tipo y la app la usan, la tabla no la tiene);
(2) gating de consentimiento; (3) cablear lectura/guardado a Supabase. Es el módulo más sensible (LFPDPPP).

## Goals / Non-Goals

**Goals:**
- Consentimiento previo (versión + fecha) que bloquea el cuestionario hasta aceptarse.
- Guardar/listar evaluaciones del hermano en Supabase, con histórico y comparación con la previa.
- Privacidad estricta (solo el dueño; verificada por RLS).

**Non-Goals:**
- Estadísticas agregadas para admins (vistas `security definer`) — corte aparte.
- Validación clínica/legal del cuestionario y del aviso (decisiones abiertas §11).
- Captura de IP del consentimiento (diferida; requiere servidor).

## Decisions

- **Migración: `alter table evaluaciones_salud add column condiciones text[] default '{}'`.** Alinea la
  tabla con el tipo `EvaluacionSalud` y la app. RLS/grants existentes aplican a la nueva columna.
- **Versión del aviso como constante en código** (p. ej. `AVISO_PRIVACIDAD_VERSION` en `lib/health.ts` o
  un módulo de consentimiento). El gating compara contra `consentimientos.version_aviso`. Al cambiar el
  aviso, se sube la versión y se vuelve a pedir consentimiento.
- **Gating en la página de Salud:** al abrir "Nueva evaluación", si no hay consentimiento de la versión
  vigente → mostrar aviso + casilla de aceptación → al aceptar, `insert` en `consentimientos` → habilitar
  el cuestionario. Si ya hay → directo.
- **Cálculo en cliente, persistir resultado.** `evaluar(respuestas)` corre en cliente (orientativo); se
  guarda `{ usuario_id, respuestas (jsonb), puntaje_*, semaforo_*, etiquetas, condiciones }`. `fecha` la
  pone la BD (`default now()`).
- **Helper `lib/data/salud.ts`:** `listEvaluaciones(userId)`, `addEvaluacion(ev)`,
  `tieneConsentimiento(userId, version)`, `registrarConsentimiento(userId, version)`.
- **Privacidad:** no se añade ninguna política de admin sobre `evaluaciones_salud`; el detalle individual
  queda solo-dueño. La pantalla de estadísticas (admins) NO lee filas individuales (corte aparte).
- **Retiro del mock:** quitar `listEvaluaciones`/`addEvaluacion`/`listTodasEvaluaciones` de `store.ts`.

## Risks / Trade-offs

- **`respuestas` jsonb ↔ `RespuestasSalud`:** guardar el objeto tal cual; al leer, castear. Validar que
  el `<select>`/botones sigan funcionando con los valores recuperados.
- **Versión del aviso desalineada** entre la constante y el contenido de `/privacidad` → documentar que se
  suben juntas.
- **Pendiente puede llenar Salud** (RLS por `auth.uid()`, no por estado) — correcto por spec.
- **Sensibilidad:** cualquier vista futura para admins DEBE ser agregada/anonimizada (no este corte).
- **Migración aditiva** (`add column ... default '{}'`) — segura, sin pérdida.

## Migration Plan

1. Rama desde `main`; Supabase local; maestro + un hermano de prueba.
2. Migración `add column condiciones`; `supabase db reset`; verificar.
3. `lib/data/salud.ts` (evaluaciones + consentimiento). Constante de versión del aviso.
4. Cablear `salud/page.tsx`: gating de consentimiento + carga/guardado async + histórico/comparación.
5. Quitar funciones de Salud del `store.ts`.
6. Validar (ver tasks): consentimiento bloquea/habilita; guardar/listar; comparación; **otro rol no ve la salud ajena (RLS)**; pendiente puede llenar; typecheck/lint/build verdes.
7. Rollback: revertir rama (la migración es aditiva).

## Open Questions

- ¿Dónde vive `AVISO_PRIVACIDAD_VERSION` y cómo se sincroniza con el texto de `/privacidad`? (Propuesta: constante + nota.)
- ¿El consentimiento es único por versión, o se re-pide periódicamente? (Propuesta: único por versión vigente.)
- IP del consentimiento: ¿se captura server-side en un corte posterior?
