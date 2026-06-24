## 1. Preparación

- [x] 1.1 Rama desde `main`; Supabase local arriba; maestro + un hermano de prueba.

## 2. Migración

- [x] 2.1 Migración nueva: `alter table evaluaciones_salud add column condiciones text[] not null default '{}'`.
- [x] 2.2 `supabase db reset`; verificar la columna y que la RLS `salud_owner` sigue vigente.

## 3. Cableado

- [x] 3.1 `lib/data/salud.ts`: `listEvaluaciones(userId)` (select propio, orden por fecha), `addEvaluacion(ev)` (insert), `tieneConsentimiento(userId, version)` y `registrarConsentimiento(userId, version)`.
- [x] 3.2 Constante `AVISO_PRIVACIDAD_VERSION` (y nota de sincronía con el texto de `/privacidad`).
- [x] 3.3 `salud/page.tsx`: gating de consentimiento (aviso + casilla → registrar → habilitar cuestionario); carga del histórico async; guardar evaluación (calcular con `evaluar()`, persistir resultado); comparación con la previa; conservar leyenda "no sustituye consulta médica" y tarjeta FAST.
- [x] 3.4 Quitar `addEvaluacion` y `listTodasEvaluaciones` de `lib/data/store.ts`. `listEvaluaciones` se **conserva** (la usan el dashboard y las estadísticas mock aún no cableadas; se retirará cuando esos módulos se migren).

## 4. Validación

- [x] 4.1 Sin consentimiento: el cuestionario está bloqueado; al aceptar el aviso se registra (versión+fecha) y se habilita.
- [x] 4.2 Guardar una evaluación y verla en el histórico; guardar otra y ver la comparación (mejora/deterioro).
- [x] 4.3 `pendiente` puede llenar Salud.
- [x] 4.4 **Privacidad (RLS):** otro hermano y un administrador (secretario/Gran Secretario) NO acceden a las evaluaciones de salud de otro usuario.
- [x] 4.5 `npm run typecheck`, `npm run lint`, `npm run build` en verde.
