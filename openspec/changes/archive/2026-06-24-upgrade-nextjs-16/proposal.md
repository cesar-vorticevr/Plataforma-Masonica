## Why

El proyecto está en **Next.js 14.2.5 / React 18.3** y sigue siendo una demo en modo `mock` (sin
auth real ni consultas a Supabase). La capa que más cambia entre Next 14→16 (APIs de request
asíncronas, defaults de caché, patrón `@supabase/ssr` con cookies/middleware) es justamente la que
**aún no se escribe** y que llegará en la Fase 1. Migrar ahora —con la app pequeña y dependiente
casi solo de `@supabase/*`— es barato; hacerlo después de cablear producción es caro y arriesgado.
Por eso el upgrade va **antes** de la Fase 1.

Fase del roadmap: **Fase 0 / habilitador de Fase 1** (infraestructura, no funcional). No depende de
ninguna "decisión abierta" (§11 del .docx).

## What Changes

- **BREAKING** Subir `next` de 14.2.5 a **16.x** y `react`/`react-dom` de 18.3 a **19.x** (incluido a partir de Next 15).
- Actualizar `@supabase/ssr` (hoy 0.4.0) y `@supabase/supabase-js` a versiones compatibles con Next 16, adoptando el patrón de cookies actual (`getAll`/`setAll`).
- Adaptar a las **APIs de request asíncronas** (`cookies()`, `headers()`, `params`, `searchParams` ahora son `Promise`): afecta `lib/supabase/server.ts` y cualquier Server Component que las use.
- Revisar **caché**: `fetch` ya no se cachea por defecto; ajustar suposiciones donde aplique.
- Validar **Turbopack** (default en 16) en `dev` y `build`; fallback a webpack si surge un bloqueo.
- Cablear **ESLint** flat config (`eslint-config-next`) porque Next 16 eliminó `next lint`; el script `lint` pasa a `eslint .`. Corregir hallazgos preexistentes queda fuera de alcance (cambio `lint-cleanup`).
- Actualizar `@types/react`/`@types/react-dom` a 19, `tsconfig.json` y `next.config.mjs` si lo requieren.
- Aplicar codemods oficiales (`npx @next/codemod@latest upgrade`) para automatizar lo mecánico.
- La app debe seguir corriendo en modo `mock` con **todas las rutas** funcionando; `typecheck`, `lint` y `build` en verde.

## Capabilities

### New Capabilities
- `app-runtime`: baseline de plataforma/runtime de la app — versión de Next/React, App Router, contrato de APIs de request asíncronas, y que la build (Turbopack) y el modo `mock` funcionen tras el upgrade.

### Modified Capabilities
<!-- Ninguna: openspec/specs/ está vacío y el comportamiento funcional se preserva (upgrade no funcional). -->

## Impact

- **Código:** `plataforma-masonica/package.json`, `package-lock.json`, `next.config.mjs`, `tsconfig.json`, `lib/supabase/server.ts` (cookies async) y `lib/supabase/client.ts`. Impacto bajo en componentes: la mayoría son client components y los datos hoy son mock.
- **Dependencias:** Next 16, React 19, `@supabase/ssr`/`@supabase/supabase-js` al día. Posible cambio del piso de Node (verificar).
- **Sin impacto** en DB/RLS (sigue mock), ni en el sistema de diseño (`DESIGN.md`) ni en la UI. No toca datos sensibles ni permisos.
- **Habilita:** el cambio siguiente `dev-docker-local` (que containeriza el target final de Node/Next) y la Fase 1 (cableado de Supabase sobre 16). También desbloquea las skills de Next de Vercel (requieren 16.3+).
