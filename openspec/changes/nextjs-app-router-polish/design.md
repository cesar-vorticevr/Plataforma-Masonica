## Context

Tras `migrar-server-components`, las 18 páginas son Server Components y las 14 del área `(app)/`
obtienen datos en el servidor (`await createClient()` + consultas RLS). Faltan los límites de UX
estándar del App Router:

- **404:** la app cae al 404 por defecto de Next ("This page could not be found."), no institucional.
- **Error boundary:** no existe `error.tsx`; un error no controlado muestra el overlay de Next (dev) o
  una pantalla genérica (prod), sin reintento ni estética propia.
- **Loading:** no hay `loading.tsx`; como todas las páginas `(app)/` hacen `await` de datos en el
  servidor, un `loading.tsx` a nivel de segmento da feedback inmediato (Suspense) durante la navegación.
- **Metadata por página:** solo root + `login` + `register` tienen `metadata`. Las 14 páginas `(app)/`
  no fijan título (todas heredan el del root).

Ya resuelto en otros changes (fuera de alcance): RSC/`proxy.ts`/gate server/`AGENTS.md`→docs Next.

## Goals / Non-Goals

**Goals:**
- 404 institucional sobrio (`app/not-found.tsx`) conforme a `DESIGN.md`.
- Error boundary global con reintento (`app/error.tsx`); `error.tsx` por segmento solo donde aporte.
- `loading.tsx` a nivel del segmento `(app)/` para cubrir la espera de fetch server de todas sus páginas.
- Metadata (título) por página en las 14 rutas de `(app)/`.

**Non-Goals:**
- Server Components / data fetching server-side / `proxy.ts` / Server Actions / `AGENTS.md` (hechos en
  `migrar-server-components`).
- Rediseño visual: se reutiliza el sistema (`DESIGN.md`, componentes UI), no se introduce estética nueva.
- Skeletons elaborados por página: un `loading.tsx` de segmento sobrio es suficiente en esta fase.
- i18n de los mensajes de error/404 (la app es es-MX).

## Decisions

- **`loading.tsx` único a nivel `app/(app)/loading.tsx`:** cubre las 14 páginas (todas hacen fetch
  server) con un fallback sobrio dentro del `AppShell`. Evita 14 archivos casi idénticos. Si una página
  necesita un skeleton específico, se añade su propio `loading.tsx` después (no en este change).
- **`error.tsx` global en `app/error.tsx`** (Client Component, como exige Next) con botón `reset()`.
  Además un `app/(app)/error.tsx` para que un fallo dentro del área privada se contenga **dentro** del
  `AppShell` (navegación visible) en lugar de tumbar toda la página. No se ponen `error.tsx` por cada
  ruta salvo que una lo justifique.
- **`not-found.tsx` en la raíz** (`app/not-found.tsx`), institucional, con enlace a `/dashboard`/`/login`.
- **Metadata por página:** `export const metadata: Metadata = { title: "…" }` en cada `page.tsx` de
  `(app)/`. Las páginas que son islas-shell (todas ya son Server Components) lo admiten directamente. El
  root mantiene el `title` con plantilla; cada página fija su segmento (p. ej. "Salud", "Tesorería").
- **Estética:** colores/tipografía vía tokens existentes (`navy`, `gold`, componentes `Card`/`Button`),
  sin CSS nuevo. Cumple `DESIGN.md` y se apoya en las skills de diseño (impeccable / ui-ux-pro-max).

## Risks / Trade-offs

- **`error.tsx` es Client Component:** no puede leer datos server; solo presenta el error y ofrece
  `reset()`. Aceptable para un boundary de presentación.
- **`loading.tsx` de segmento muy genérico:** no refleja el layout concreto de cada página; trade-off
  consciente frente a 14 skeletons. Se puede afinar por página más adelante.
- **Metadata en 14 archivos:** repetitivo pero trivial y de bajo riesgo; sin lógica.
- **Riesgo de regresión:** mínimo — son archivos nuevos + un `export const metadata` por página; no toca
  datos, permisos ni el flujo de render existente.
