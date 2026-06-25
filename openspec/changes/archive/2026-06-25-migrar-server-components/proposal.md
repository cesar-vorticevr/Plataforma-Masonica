## Why

Hoy **17 de 18 páginas** son `"use client"` y **13 de 14 módulos de datos** consultan Supabase con
el `createBrowserClient`. El cableado real (Fase 1/3/4: directorio, mensajería, trabajos…) ya cerró el
mock, pero se hizo **manteniendo el patrón all-client**: cada página es una SPA que tras hidratar dispara
`useEffect → listX()` contra Supabase desde el navegador. La premisa del proposal `nextjs-app-router-polish`
("el all-client se corrige solo al cablear Supabase") **no se está cumpliendo**: cada módulo cableado como
client es deuda que hay que volver a migrar.

La doc oficial de Next 16.2 (bundled en `node_modules/next/dist/docs/`) es explícita: **layouts y páginas
son Server Components por defecto**; `"use client"` solo para estado/efectos/APIs de navegador. Beneficios:
fetch cerca de la fuente, secretos fuera del bundle, menos JS al cliente, mejor FCP, y **autorización
verificada en servidor** (`getUser()`/`getClaims()` + RLS) en lugar de un gate por `useEffect`. Para este
stack, la guía de Supabase SSR prescribe además un `proxy.ts` (en Next 16 *Middleware* pasó a llamarse
**Proxy**) que refresca el token de sesión en cada request — pieza que **hoy no existe**.

Encaja con las restricciones no negociables (AGENTS.md §7): mover el fetch al servidor **refuerza** la
privacidad (palabras clave cifradas y agregados de salud no transitan el bundle ni una query expuesta en
el cliente), sin tocar las RLS por logia/grado, que siguen siendo la frontera de autorización.

## What Changes

- **`proxy.ts` (raíz de `plataforma-masonica/`):** refresco de sesión Supabase vía `@supabase/ssr` en cada
  request (patrón Proxy). NO se usa como solución de autorización (lo prohíbe el propio doc); solo refresh
  + checks optimistas. `matcher` que excluye estáticos.
- **Gating de auth en servidor:** `app/(app)/layout.tsx` pasa a Server Component async, valida sesión con
  `getUser()` y `redirect('/login')` si no hay sesión. Se conserva un **AuthProvider delgado sembrado desde
  el servidor** (`initialUser`) para que las islas cliente sigan usando `useAuth()` con mínima reescritura.
- **`app/page.tsx` raíz:** redirección en servidor según sesión (sin `useEffect`).
- **Capa de datos agnóstica:** los módulos `lib/data/*.ts` dejan de ser `"use client"` y **reciben el
  `SupabaseClient` por parámetro**. El Server Component pasa el cliente de servidor; las islas que aún
  consulten (formularios/mutaciones) pasan el cliente de navegador. Sin duplicar consultas.
- **Páginas → patrón "server page → isla cliente":** cada `page.tsx` pasa a Server Component async que
  obtiene datos en servidor (RLS aplica igual) y pasa props a una isla `XxxClient` (`"use client"`) que
  conserva búsqueda, modales y formularios. Migración **módulo por módulo**.
- **`AGENTS.md` → docs de Next como fuente de verdad:** añadir el bloque `nextjs-agent-rules` que apunta a
  `node_modules/next/dist/docs/` (docs version-matched para 16.2.9), conforme a la guía oficial de Next para
  agentes. Mantener `CLAUDE.md`/`AGENTS.md` del proyecto fuera de los marcadores gestionados.

## Impact

- **Affected specs:** `app-runtime` (MODIFIED + ADDED: renderizado server-first, Proxy, gating server,
  datos en servidor, docs para agentes).
- **Affected code:** nuevo `proxy.ts`; `app/(app)/layout.tsx`, `app/page.tsx`, `app/login`, `app/register`,
  y las 14 páginas de `(app)/`; `lib/data/*.ts` (firma con `SupabaseClient`); `lib/auth.tsx` (`initialUser`);
  `AGENTS.md` (marcadores Next).
- **Seguridad/privacidad:** RLS intacta (sigue siendo la frontera); la autorización pasa a verificarse en
  servidor. Salud/estadísticas se migran **al final** y con cuidado (consentimiento + agregado/anonimizado).
- **Sin cambios** de esquema, dependencias ni RLS.

## Non-goals

- **Server Actions / route handlers nuevos** para mutaciones: las mutaciones siguen en islas cliente con el
  browser client en esta fase (se puede abordar después). Solo se migra la **lectura** a servidor.
- **Rediseño de UI.** Debe seguir cumpliendo `DESIGN.md`; esto es arquitectura de render, no estética.
- **Upgrade de versión de Next** (seguimos en 16.2.9).
