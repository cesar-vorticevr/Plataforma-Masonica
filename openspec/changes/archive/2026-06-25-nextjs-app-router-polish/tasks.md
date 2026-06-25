## 1. Preparación

- [x] 1.1 Rama `feat-app-router-polish` desde `main`. Revisados tokens (`DESIGN.md`: navy/gold,
      superficies claras, `.btn`/`.card`, rounded-xl) y componentes UI (`Card`/`Button`/`PageTitle`);
      skill de diseño `impeccable` cargada.

## 2. 404 institucional

- [x] 2.1 `app/not-found.tsx` (Server Component): pantalla completa sobria (eyebrow M.·.R.·.G.·.L.·.E.·.,
      "404" en navy, copy es-MX) con enlace "Volver al inicio".
- [x] 2.2 Verificado en runtime: `/ruta-que-no-existe` → status 404 + página institucional.

## 3. Error boundary

- [x] 3.1 `app/error.tsx` (`"use client"`): error boundary global con `reset()` ("Reintentar") + "Ir al
      inicio"; muestra `error.digest` como referencia.
- [x] 3.2 `app/(app)/error.tsx` (`"use client"`): fallback dentro del `AppShell` (navegación visible),
      reutiliza `PageTitle`/`Card`/`Button`, con `reset()`.
- [x] 3.3 Wired por convención de archivos de Next y compila en el build. **No fault-injected en vivo**
      (requiere lanzar un error real); el comportamiento de `reset()` es el estándar de Next.

## 4. Estado de carga

- [x] 4.1 `app/(app)/loading.tsx`: esqueleto sobrio (título + rejilla de tarjetas) con
      `animate-pulse motion-reduce:animate-none` y `aria-busy`.
- [x] 4.2 Wired por convención + build. **No observado en vivo** (aparece solo durante el streaming del
      fetch server; sin latencia artificial no se captura por curl).

## 5. Metadata por página

- [x] 5.1 `export const metadata = { title: "… · Plataforma Masónica" }` añadido a las 14 páginas de
      `(app)/`: dashboard, salud, generales, cumplimientos, directorio, mensajes, eventos, trabajos,
      buzon, correspondencia, tesoreria, tenidas, estadisticas, admin. (login/register ya estaban.)
- [x] 5.2 Verificado en runtime: `/dashboard` → "Inicio · Plataforma Masónica"; `/tesoreria` →
      "Tesorería · Plataforma Masónica" (el root mantiene su título).

## 6. Validación

- [x] 6.1 404: `/ruta-que-no-existe` → 404 institucional (runtime).
- [x] 6.2 Error boundary global + de `(app)` creados y compilados (convención Next). No fault-injected.
- [x] 6.3 `loading.tsx` de `(app)` creado y compilado. No observado en vivo (streaming).
- [x] 6.4 Metadata: títulos por sección confirmados en runtime (público y autenticado).
- [x] 6.5 `npm run typecheck`, `npm run lint`, `npm run build` en verde.
