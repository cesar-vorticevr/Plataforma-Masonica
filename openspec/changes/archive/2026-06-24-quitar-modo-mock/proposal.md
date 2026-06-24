## Why

El modo mock (`NEXT_PUBLIC_DATA_MODE`) existía para revisar la app sin backend. Pero ahora el
desarrollo local usa **Supabase local** (vía CLI) y producción usa **Supabase**: nunca se usará mock.
Mantener el toggle y el auth mock añade complejidad y rutas de código muertas. Además, al quitar el
mock no hay usuarios demo, así que se vuelve necesario **crear el administrador maestro** para poder
entrar, y dejar lista la configuración de **producción**.

Fase del roadmap: **Fase 0/1 — limpieza y bootstrap**, previo a los cortes siguientes de Fase 1.
Toca **autenticación y permisos** (master). No toca datos sensibles de salud.

## What Changes

- **Eliminar el modo mock de auth y UI:** quitar `NEXT_PUBLIC_DATA_MODE`, `MockAuthProvider`, el
  **selector de usuario demo** (AppShell), los **hints demo** (login) y las ramas mock en
  `register`, `admin` y `lib/data/identidad.ts`. La app **siempre** usa Supabase.
- **Conservar temporalmente `lib/data/store.ts` y `seed.ts`** como respaldo de los módulos **aún no
  cableados** (salud, generales, tesorería, tenidas, eventos, directorio, etc.). Se retiran **módulo
  por módulo** conforme cada corte/fase los migre a Supabase. (No se borran en este cambio.)
- **Script `crear:master`** (`scripts/crear-master.mjs`): con service-role crea/promueve al
  administrador maestro (`rol=master`, `estado=validado`, `grado=maestro`). Contraseña **generada con
  `crypto.randomBytes`** (impresa una sola vez) o tomada de `MASTER_PASSWORD`. Email desde `MASTER_EMAIL`.
  La contraseña se pasa a Supabase Auth, que la hashea con bcrypt (NO se pre-hashea).
- **Quitar `AltaRapida`** del admin (era mock-only); el alta de logias/secretarios en Supabase se
  abordará con un route handler en un corte posterior.
- **`.env.prod.example`** (plantilla committeable) + `.env.prod` gitignored para valores reales;
  recordatorio de que en Vercel las variables van al dashboard.
- Actualizar README y AGENTS (sin modo mock; documentar `crear:master` y `.env.prod`).

## Capabilities

### New Capabilities
- `bootstrap-administracion`: creación del administrador maestro de la plataforma (script reproducible local+prod) con contraseña generada de forma segura.

### Modified Capabilities
- `app-runtime`: backend único (Supabase); se elimina el modo mock / el toggle `NEXT_PUBLIC_DATA_MODE`.
- `identidad-acceso`: la autenticación deja de tener proveedor mock; siempre Supabase.

## Impact

- **Código:** `lib/supabase/client.ts` (quita `DATA_MODE`), `lib/auth.tsx` (solo proveedor Supabase),
  `app/login`, `app/register`, `components/layout/AppShell.tsx`, `app/(app)/admin/page.tsx`,
  `lib/data/identidad.ts`. **Nuevo** `scripts/crear-master.mjs` + script npm `crear:master`.
- **Conservado:** `lib/data/store.ts`, `lib/data/seed.ts` (módulos sin cablear).
- **Env:** quitar `NEXT_PUBLIC_DATA_MODE`; añadir `MASTER_EMAIL` (+ opcional `MASTER_PASSWORD`);
  `.env.prod.example` nuevo.
- **Seguridad:** la promoción a master usa service-role (server-only); la contraseña nunca se hardcodea.

## Non-goals

- Borrar `store.ts`/`seed.ts` o cablear los módulos restantes (eso es Fases 1–4, módulo por módulo).
- Alta de logias/secretarios en Supabase (route handler) — corte posterior.
- Configurar el proyecto Supabase de producción real (solo se deja la plantilla).
