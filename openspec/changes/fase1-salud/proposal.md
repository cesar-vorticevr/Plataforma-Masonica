## Why

El módulo **Salud** es el corazón del Proyecto Salud Integral y el dato más delicado de la plataforma:
**dato personal sensible** (LFPDPPP 2025). Hoy la pantalla usa el `store.ts` mock. Cablearlo a Supabase
cierra el MVP de la Fase 1 ("Censo + identidad + salud preventiva"). Es el corte con mayores requisitos
de **privacidad** y **consentimiento**.

Fase del roadmap: **Fase 1 (MVP), corte 3.** Toca **datos personales SENSIBLES** y exige
**consentimiento expreso**. Decisión abierta §11: la lógica del cuestionario (`lib/health.ts`) y el
texto del aviso deben ser validados por un médico y un abogado; este corte **digitaliza** la lógica
orientativa existente (no la valida clínicamente).

## What Changes

- **Migración pequeña:** añadir la columna `condiciones text[]` a `evaluaciones_salud` (la app y el
  tipo `EvaluacionSalud` ya la usan — "Padecimientos registrados"; falta en la tabla).
- **Consentimiento previo (obligatorio):** antes de llenar Salud, el hermano debe **aceptar el aviso de
  privacidad** (casilla), registrándose con **versión y fecha** en `consentimientos`. Si no hay
  consentimiento para la versión vigente, el cuestionario queda **bloqueado**.
- **Cablear Salud a Supabase:** guardar cada evaluación (respuestas, puntajes, semáforos, etiquetas,
  condiciones) en `evaluaciones_salud`; listar el **histórico** del hermano y comparar con la previa.
  El cálculo orientativo (`lib/health.ts`) permanece en cliente; se persiste el resultado.
- **Privacidad estricta:** solo el **propio hermano** ve su detalle de salud (RLS `salud_owner`). Ni
  secretarios ni Gran Secretario acceden al detalle individual.
- **Retirar** del `store.ts` mock las funciones de Salud (`listEvaluaciones`, `addEvaluacion`, `listTodasEvaluaciones`).
- Mantener la **leyenda** "no sustituye una consulta médica" y la tarjeta FAST.

## Capabilities

### New Capabilities
- `salud`: evaluación orientativa de salud del hermano — consentimiento previo, cuestionario con histórico y etiquetas de riesgo, con visibilidad restringida exclusivamente al propio hermano (dato sensible).

### Modified Capabilities
<!-- Ninguna a nivel de spec; se añade una columna a una tabla existente. -->

## Impact

- **Base de datos:** migración nueva — `evaluaciones_salud.condiciones text[]`. (RLS/grants existentes ya aplican.)
- **Código:** `app/(app)/salud/page.tsx` (consentimiento + carga/guardado async), **nuevo**
  `lib/data/salud.ts`; quitar funciones de Salud de `lib/data/store.ts`. Posible constante de versión
  del aviso de privacidad.
- **Seguridad/privacidad:** RLS `salud_owner` (solo dueño); `consent_rw` (solo dueño). Consentimiento
  con versión+fecha antes de capturar. Cumplimiento LFPDPPP (dato sensible).

## Non-goals

- **Estadísticas agregadas/anonimizadas** para administradores (prevalencia de etiquetas por logia/oriente)
  — requieren vistas/funciones `security definer`; **corte aparte** (no exponer filas individuales).
- Validación clínica del cuestionario y redacción legal del aviso (decisiones abiertas §11; externas al código).
- Captura de IP del consentimiento (se difiere; requiere lado servidor).
