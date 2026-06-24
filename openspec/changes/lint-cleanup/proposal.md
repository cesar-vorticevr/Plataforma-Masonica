## Why

Al cablear ESLint durante `upgrade-nextjs-16` (Next 16 eliminó `next lint`), el lint corrió por
primera vez en la historia del repo y afloró **27 hallazgos preexistentes** (20 errores, 7 warnings)
que nunca se habían revisado. Conviene resolverlos **antes de la Fase 1** para que el código nuevo se
sostenga contra un baseline de lint en verde, y porque **2 de ellos podrían ser bugs reales**.

Fase del roadmap: **Fase 0 / calidad** (habilitador de Fase 1). No depende de "decisiones abiertas"
(§11). Depende de `upgrade-nextjs-16` (que dejó ESLint configurado).

## What Changes

- **Revisar y corregir 2 `react-hooks/rules-of-hooks`** (posibles bugs): `useState` llamado
  condicionalmente / tras un early return en `app/(app)/admin/page.tsx:18` y
  `app/(app)/tesoreria/page.tsx:20`. Reordenar los hooks para que se llamen siempre en el mismo orden.
- Reemplazar **17 `@typescript-eslint/no-explicit-any`** por tipos concretos (apoyándose en `lib/types.ts`) o `unknown` donde el tipo sea genuinamente abierto.
- Eliminar **6 `@typescript-eslint/no-unused-vars`** (imports/variables sin usar).
- Corregir **1 `react-hooks/set-state-in-effect`** en `lib/auth.tsx` y **1 `import/no-anonymous-default-export`** en `postcss.config.mjs`.
- Dejar `npm run lint` en **verde (0 errores, 0 warnings)** sin relajar las reglas de `eslint-config-next`.

## Capabilities

### New Capabilities
- `code-quality`: baseline de calidad estática del código — `npm run lint` en verde con la config de Next, sin `any` explícito injustificado, sin código sin usar, y respetando las reglas de hooks de React.

### Modified Capabilities
<!-- Ninguna a nivel de requisitos funcionales; el comportamiento debe preservarse. -->

## Impact

- **Código:** ~14 archivos — `lib/auth.tsx`, `lib/types.ts`, `lib/health.ts`, `lib/data/store.ts`, `postcss.config.mjs`, y páginas de `app/(app)/` (`admin`, `buzon`, `directorio`, `eventos`, `salud`, `tesoreria`) más `app/login` y `app/register`.
- **Riesgo:** las correcciones de `rules-of-hooks` cambian el orden de ejecución de hooks → validar que el comportamiento se preserva (smoke test en modo mock). Tipar `any` puede aflorar errores de tipo legítimos a resolver.
- **Sin impacto** en dependencias, build, UI (`DESIGN.md`) ni en el modelo de permisos. No toca datos sensibles.
- **Depende de:** `upgrade-nextjs-16` (ESLint ya configurado).
