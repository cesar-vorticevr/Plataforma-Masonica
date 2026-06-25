> **Estado:** PROPUESTA / backlog. Solo `proposal.md`. Aún no tiene `specs/`, `design.md` ni
> `tasks.md`; al retomarlo, completar con `/opsx:propose` o `/opsx:apply`.
>
> **Actualización (2026-06-25):** alcance **recortado**. La migración a Server Components + `proxy.ts`
> ya se completó y archivó en el change **`migrar-server-components`**, igual que el puntero de
> `AGENTS.md` a los docs de Next. Lo que aquí queda es el pulido de UX del App Router que **sigue
> pendiente**: 404, error boundary, `loading.tsx` y metadata de las páginas del área `(app)`.

## Why

La auditoría de best-practices de Next.js (sobre Next 16.2.9) encontró que los fundamentos son
idiomáticos (Metadata API, `lang="es"`, App Router, cookies async, TS strict, 0 `any`), pero faltan
algunas prácticas estándar de límites de UX del App Router que mejoran robustez y experiencia antes de
que llegue tráfico real. Hoy la app cae al **404 por defecto de Next** y **no tiene error boundary**;
tras la migración a Server Components, las páginas obtienen datos en el servidor, así que `loading.tsx`
(Suspense) pasó a ser **genuinamente útil** (antes era marginal por el mock).

Fase del roadmap: **Fase 0 / pulido** (no funcional).

## What Changes

- Añadir `app/not-found.tsx` (404 institucional, sobrio, conforme a `DESIGN.md`).
- Añadir `app/error.tsx` (error boundary global con reintento) y, donde aporte, `error.tsx` por segmento.
- Añadir `loading.tsx` donde haya espera perceptible (ahora real: las server pages `await` datos).
- Metadata por página en el área **`(app)`** (p. ej. "Salud", "Tesorería", "Administración"…), además
  del root. **Ya hechas:** `login` y `register` (durante `migrar-server-components`).

## Capabilities

### Modified Capabilities
- `app-runtime`: añadir requisitos de límites de UX del App Router (404, error boundary, loading) y
  metadata por página del área privada. (Capturar el delta al implementar.)

## Impact

- **Archivos nuevos:** `app/not-found.tsx`, `app/error.tsx`, posibles `loading.tsx`/`error.tsx` por
  segmento; `metadata` en las páginas de `(app)`.
- **UI:** debe cumplir `DESIGN.md` (estética institucional sobria) y apoyarse en las skills de diseño
  (impeccable/ui-ux-pro-max) — ver AGENTS.md §8.1–§8.2.
- **Sin impacto** en datos, permisos ni dependencias.

## Non-goals

- **Migrar a Server Components / data fetching server-side / `proxy.ts`.** Fuera de alcance porque **ya
  está hecho** (change `migrar-server-components`, archivado 2026-06-25): server-first por defecto,
  consultas server-side con RLS, gate de auth en servidor y `proxy.ts` para refresh de sesión.
- **Server Actions / route handlers** para mutaciones: idem, las mutaciones viven en islas cliente con el
  browser client (decisión de `migrar-server-components`); su posible migración a Server Actions es otro
  change futuro, no este.

## Notas / hallazgos relacionados

- ~~Server Components: 17/18 páginas client → migrar.~~ **Resuelto** en `migrar-server-components`
  (0 páginas `"use client"`; capa de datos agnóstica).
- ~~`proxy.ts` para refresh de sesión Supabase.~~ **Resuelto** en `migrar-server-components`.
- ~~`AGENTS.md` debe apuntar a los docs de Next.~~ **Resuelto**: bloque `nextjs-agent-rules` →
  `node_modules/next/dist/docs/` (añadido en `migrar-server-components`).
- **Next 16.3 (pendiente):** cuando sea estable (hoy en canary), el `AGENTS.md`/`CLAUDE.md` con
  best-practices se auto-genera vía `next dev` y se desbloquean las skills de Next de Vercel. **Revisitar
  entonces** (upgrade menor 16.2→16.3). No hand-escribir esas reglas; sustituir el bloque manual por el
  generado.
