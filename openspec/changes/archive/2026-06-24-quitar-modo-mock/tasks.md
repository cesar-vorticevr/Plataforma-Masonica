## 1. Preparación

- [x] 1.1 Rama desde `main`; Supabase local arriba (`npx supabase start`).

## 2. Eliminar el modo mock (auth + UI)

- [x] 2.1 `lib/supabase/client.ts`: quitar el export `DATA_MODE`.
- [x] 2.2 `lib/auth.tsx`: dejar solo el proveedor Supabase (eliminar `MockAuthProvider` y el dispatch); quitar imports del store mock.
- [x] 2.3 `app/login`: quitar hints/credenciales demo (sin rama `DATA_MODE`).
- [x] 2.4 `app/register`: cargar siempre las logias desde Supabase (sin rama mock).
- [x] 2.5 `components/layout/AppShell.tsx`: eliminar el selector de usuario demo (`DemoSwitcher`) y `switchDemo`.
- [x] 2.6 `app/(app)/admin/page.tsx`: quitar `SB`/ramas mock; eliminar `AltaRapida`; PalabraClave siempre con campo vacío.
- [x] 2.7 `lib/data/identidad.ts`: quitar ramas mock (siempre Supabase); quitar `import * as mock`.
- [x] 2.8 Conservar `lib/data/store.ts` y `seed.ts` (módulos sin cablear); verificar que un módulo sin cablear no crashea (muestra vacío).

## 3. Script crear:master

- [x] 3.1 `scripts/crear-master.mjs`: con service-role, `admin.createUser` + promover a master/validado/maestro; contraseña de `MASTER_PASSWORD` o generada con `crypto.randomBytes` (impresa una vez); email de `MASTER_EMAIL` (default institucional).
- [x] 3.2 Script npm `crear:master` (`node --env-file=.env.local scripts/crear-master.mjs`); documentar variante prod (`--env-file=.env.prod`).
- [x] 3.3 Manejar idempotencia: si el email ya existe, promoverlo (no fallar).

## 4. Entorno

- [x] 4.1 Quitar `NEXT_PUBLIC_DATA_MODE` de `.env.local` y de `.env.local.example`; añadir `MASTER_EMAIL` (+ opcional `MASTER_PASSWORD`).
- [x] 4.2 Crear `.env.prod.example` (placeholders, service-role marcado server-only, recordatorio Vercel dashboard); confirmar `.env.prod` gitignored.

## 5. Documentación

- [x] 5.1 README: quitar la sección de demo/mock; documentar arranque (supabase start → crear:master → login) y `.env.prod`.
- [x] 5.2 AGENTS.md: actualizar §3/§4 (sin modo mock; backend único) y documentar `crear:master`.

## 6. Validación

- [x] 6.1 `crear:master` crea el maestro; login del maestro funciona; acceso de administrador.
- [x] 6.2 `npm run typecheck`, `npm run lint`, `npm run build` en verde (sin usos colgando de `DATA_MODE`).
- [x] 6.3 Un módulo sin cablear (p. ej. salud) renderiza sin crashear (vacío) para un usuario real.
