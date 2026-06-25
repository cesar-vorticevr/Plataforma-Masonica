> **Estado:** PROPUESTA / backlog. Solo `proposal.md`. **Hacer DESPUÉS de `dev-docker-local`.**
> Aún no tiene `specs/`, `design.md` ni `tasks.md`; al retomarlo, completar con `/opsx:propose` o `/opsx:apply`.

## Why

La auditoría de best-practices de Next.js (junio 2026, sobre Next 16.2.9) encontró que los
fundamentos son idiomáticos (Metadata API, `lang="es"`, App Router, cookies async, TS strict, 0 `any`),
pero faltan algunas prácticas estándar de App Router que **no dependen del modo mock** y se pueden
adoptar de forma independiente. Mejoran UX y robustez antes de que llegue tráfico real.

Fase del roadmap: **Fase 0 / pulido** (no funcional). No depende de "decisiones abiertas" (§11).

## What Changes

- Añadir `app/not-found.tsx` (404 institucional, sobrio, conforme a `DESIGN.md`).
- Añadir `app/error.tsx` (error boundary global con reintento) y, donde aporte, `error.tsx` por segmento.
- Añadir `loading.tsx` donde haya espera perceptible (hoy mínimo por el mock; útil al llegar Fase 1).
- Metadata por página/segmento (p. ej. título "Iniciar sesión", "Salud", etc.) además del root.

## Capabilities

### Modified Capabilities
- `app-runtime`: añadir requisitos de límites de UX del App Router (404, error boundary, loading) y metadata por página. (Capturar el delta al implementar.)

## Impact

- **Archivos nuevos:** `app/not-found.tsx`, `app/error.tsx`, posibles `loading.tsx`/`error.tsx` por segmento; `metadata` en páginas.
- **UI:** debe cumplir `DESIGN.md` (estética institucional sobria) y apoyarse en las skills de diseño (impeccable/ui-ux-pro-max) — ver AGENTS.md §8.1–§8.2.
- **Sin impacto** en datos, permisos ni dependencias.

## Non-goals

- **Migrar a Server Components / data fetching server-side.** NO es parte de este cambio; se aborda en
  el change dedicado **`migrar-server-components`** (Server Components por defecto, consultas server-side
  con RLS, `proxy.ts` para refresh de sesión — en Next 16 *Middleware* se renombró a *Proxy*).
  > **Actualización (2026-06-24):** la premisa original ("el all-client se corrige solo al cablear
  > Supabase") quedó superada. El cableado real (directorio, mensajería, trabajos) cerró el mock pero
  > **mantuvo el patrón all-client**, así que la migración a server se planificó como change propio en
  > vez de caer sola en la "Fase 1".
- Server Actions / route handlers (ver `migrar-server-components`; las mutaciones siguen en islas cliente
  en su primera fase).

## Notas / hallazgos relacionados (de la auditoría)

- **Server Components:** 17/18 páginas y 13/14 módulos de datos son `use client` → ahora se aborda en el
  change **`migrar-server-components`** (server-first + datos en servidor + gate de auth en servidor).
- **`proxy.ts`** (antes `middleware.ts`; renombrado en Next 16) para refresh de sesión Supabase
  (`@supabase/ssr`) → **`migrar-server-components`**.
- **Next 16.3:** cuando sea estable (hoy en canary), el `AGENTS.md`/`CLAUDE.md` con best-practices se
  auto-genera vía `next dev`, y se desbloquean las skills de Next de Vercel. **Revisitar entonces**
  (upgrade menor 16.2→16.3). No hand-escribir esas reglas a mano.
