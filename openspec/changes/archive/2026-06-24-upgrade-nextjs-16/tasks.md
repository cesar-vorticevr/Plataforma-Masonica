## 1. Preparación

- [x] 1.1 Crear rama dedicada desde `main` para el upgrade.
- [x] 1.2 Con la skill `supabase` y la guía de upgrade de Next, confirmar versión objetivo de Next 16.x, piso de Node y el patrón vigente de `@supabase/ssr` (no asumir desde memoria).
- [x] 1.3 Registrar la versión actual en verde como línea base. (Checkout limpio sin `node_modules`; baseline = estado committeado; validación real post-upgrade.)

## 2. Upgrade de dependencias

- [x] 2.1 Bump de dependencias a versiones verificadas en el registro (alternativa determinista al codemod interactivo; el único cambio de código necesario era `server.ts`, hecho a mano en 3.1).
- [x] 2.2 Verificar en `package.json`: `next` 16.2.9, `react`/`react-dom` 19.2.7, `@types/react`/`@types/react-dom` 19.
- [x] 2.3 Actualizar `@supabase/ssr` (0.12.0) y `@supabase/supabase-js` (2.108.2), compatibles con Next 16.
- [x] 2.4 Fijar `engines.node` (`>=20.9.0`, piso de Next 16).

## 3. Adaptación de código

- [x] 3.1 Adaptar `lib/supabase/server.ts` a cookies asíncronas (`await cookies()`, función `async`) con el patrón `getAll`/`setAll`.
- [x] 3.2 Revisar `lib/supabase/client.ts` y usos de `cookies()`/`headers()`/`params`/`searchParams`: solo `server.ts` los usaba; nadie más afectado.
- [x] 3.3 Ajustar `tsconfig.json` (Next lo reconfiguró: `jsx: react-jsx` + `.next/dev/types`) y `next.config.mjs` (sin cambios necesarios).
- [x] 3.4 Revisar caché (`fetch`): no hay `fetch` de datos reales (mock = localStorage); nota dejada para la Fase 1.

## 4. Validación

- [x] 4.1 `npm run typecheck` en verde. Lint: Next 16 eliminó `next lint`; se cableó ESLint flat config (`eslint-config-next`) y `npm run lint` ya corre. Los 27 hallazgos preexistentes se descoparon al cambio `lint-cleanup`.
- [x] 4.2 `npm run build` exitosa con Next 16 (Turbopack); 20 rutas estáticas, sin fallback a webpack.
- [x] 4.3 `npm run dev` arranca sin errores (listo en ~1s).
- [x] 4.4 Smoke test en modo `mock`: las 20 rutas responden 200 sin errores de application-code (verificación HTTP/render; no click-through interactivo).

## 5. Cierre

- [x] 5.1 Actualizar AGENTS.md (§2), `openspec/config.yaml` y README a Next 16 / React 19. Skills de Next de Vercel: siguen requiriendo 16.3+ (preview/canary); revisitar cuando 16.3 sea estable.
- [x] 5.2 Merge a `main` (fast-forward) junto con `lint-cleanup`; `main` en verde (typecheck/lint). `dev-docker-local` parte de esta base.
