## Context

`plataforma-masonica/` corre Next 14.2.5 + React 18.3 + TS strict + Tailwind 3, con `@supabase/ssr`
0.4.0 y `@supabase/supabase-js` 2.45.0. Es una demo navegable en modo `mock` (localStorage); no hay
auth real ni consultas a Supabase. El esquema RLS de producción existe en `supabase/schema.sql` pero
no está cableado. La Fase 1 (auth + datos reales) escribirá la capa más afectada por los breaking
changes de Next 14→16; este cambio prepara el terreno para escribirla una sola vez sobre 16.

Principio operativo (AGENTS.md §8.3): **no confiar en el conocimiento previo**; verificar versiones,
codemods y el patrón `@supabase/ssr` contra la guía de upgrade de Next y el changelog/docs de Supabase
con la skill `supabase` al momento de implementar.

## Goals / Non-Goals

**Goals:**
- App sobre Next 16.x + React 19.x, con `build`/`dev` (Turbopack) en verde.
- `@supabase/ssr` y `@supabase/supabase-js` al día, con el patrón de cookies asíncrono vigente.
- Comportamiento funcional idéntico en modo `mock`; `typecheck` y `lint` en verde.

**Non-Goals:**
- Cablear auth/datos reales contra Supabase (eso es Fase 1).
- Containerizar el entorno (eso es el cambio `dev-docker-local`, que depende de éste).
- Cambios de UI o del sistema de diseño (`DESIGN.md` no se toca).
- Tocar el modelo de datos, RLS o permisos.

## Decisions

- **Subir directo a 16 con codemods, no 14→15→16 a mano.** `npx @next/codemod@latest upgrade`
  automatiza dependencias y migraciones mecánicas (incl. APIs de request asíncronas). Alternativa
  (saltos manuales escalonados): más control pero más trabajo; innecesario en un proyecto pequeño.
- **Aceptar React 19.** Viene con Next 15+. Riesgo bajo: las únicas dependencias de runtime son
  `@supabase/*`. Alternativa (quedarse en React 18): no es opción soportada en Next 16.
- **Adoptar el patrón `getAll`/`setAll` de `@supabase/ssr`.** El patrón viejo `get/set/remove` está
  deprecado; el vigente encaja con las cookies asíncronas de Next 15+. Confirmar con la skill `supabase`.
- **Mantener `NEXT_PUBLIC_DATA_MODE=mock` durante todo el upgrade.** Permite validar build y todas las
  rutas sin levantar backend; aísla el upgrade del cableado de Supabase.
- **Turbopack por defecto; webpack como fallback documentado.** Si algún plugin/postcss falla en
  Turbopack, documentar el fallback en vez de bloquear el upgrade.

## Risks / Trade-offs

- **React 19 rompe algo sutil** → deps mínimas; validar `build` + smoke test de todas las rutas.
- **API de `@supabase/ssr` cambió** (cookies) → seguir la skill `supabase` y los docs vigentes; no improvisar desde memoria.
- **Cambios de caché por defecto** (`fetch` ya no cacheado) → hoy no hay `fetch` de datos reales; revisar al cablear Fase 1, dejar nota.
- **Diferencias de build en Turbopack** (postcss/tailwind) → validar; fallback a webpack.
- **Piso de Node más alto en Next 16** → verificar el mínimo y fijar `engines` en package.json; alinear la imagen base en `dev-docker-local`.

## Migration Plan

1. Rama dedicada desde `main`.
2. Ejecutar el codemod oficial de upgrade; revisar el diff.
3. Ajustar a mano lo que el codemod no cubra (cookies async en `lib/supabase/server.ts`, `next.config.mjs`, tipos React 19).
4. Actualizar `@supabase/ssr`/`@supabase/supabase-js` y aplicar el patrón de cookies vigente.
5. `npm run typecheck`, `npm run lint`, `npm run build`, `npm run dev`; smoke test de todas las rutas en modo mock.
6. Merge. **Rollback:** revertir la rama (cambio aislado, sin migraciones de datos).

## Open Questions

- Versión exacta objetivo de Next 16.x al implementar (tomar la estable vigente; verificar con la guía de upgrade).
- Piso de Node de Next 16 (¿20+?), para fijar `engines` y la imagen base de Docker en el cambio siguiente.
- ¿Algún plugin/postcss incompatible con Turbopack que obligue al fallback de webpack?
