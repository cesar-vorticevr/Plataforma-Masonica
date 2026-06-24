## Context

`upgrade-nextjs-16` cableó ESLint (flat config con `eslint-config-next`) porque Next 16 eliminó
`next lint`. Al correr por primera vez, el lint reportó 27 hallazgos preexistentes:

- 17 `@typescript-eslint/no-explicit-any`
- 6 `@typescript-eslint/no-unused-vars`
- 2 `react-hooks/rules-of-hooks` (en `admin/page.tsx:18` y `tesoreria/page.tsx:20`)
- 1 `react-hooks/set-state-in-effect` (`lib/auth.tsx:33`)
- 1 `import/no-anonymous-default-export` (`postcss.config.mjs`)

Ninguno fue introducido por el upgrade; son deuda histórica. Dos (`rules-of-hooks`) pueden ser bugs
reales: `useState` llamado tras un early return rompe la regla de orden de hooks de React y puede
corromper estado entre renders.

## Goals / Non-Goals

**Goals:**
- `npm run lint` en verde (0/0) sin relajar reglas.
- Corregir los 2 `rules-of-hooks` preservando el comportamiento de las pantallas.
- Tipar los `any` y eliminar el código sin usar; mantener `tsc --noEmit` en verde.

**Non-Goals:**
- Cambiar comportamiento funcional o UI.
- Refactors más allá de lo que exige el lint.
- Endurecer la config de ESLint con reglas nuevas (eso sería otro cambio).

## Decisions

- **`rules-of-hooks`: reordenar, no silenciar.** Mover los `useState` arriba del early return para que
  se llamen siempre. Investigar si el early return escondía un bug de estado; documentar el hallazgo.
  Alternativa (deshabilitar la regla): descartada, oculta un riesgo real.
- **`any` → tipos concretos preferentemente.** Usar los tipos de `lib/types.ts` (p. ej. `EvaluacionSalud.respuestas` y los handlers que hoy usan `any`). Donde el dato sea genuinamente dinámico, usar `unknown` + estrechamiento, no `any`.
- **`set-state-in-effect` (auth.tsx).** Ajustar el efecto de carga de sesión para no llamar `setState`
  de forma que dispare renders en cascada (p. ej. inicializar estado desde el lazy initializer o
  consolidar en un solo set). Preservar el comportamiento de hidratación de sesión mock.
- **`postcss.config.mjs`.** Asignar el objeto a una variable antes del `export default`.
- **Validación de no-regresión:** smoke test de las rutas afectadas en modo mock tras los cambios.

## Risks / Trade-offs

- **Reordenar hooks cambia el orden de ejecución** → validar render y comportamiento (admin, tesoreria) en mock.
- **Tipar `any` aflora errores de tipo legítimos** → resolverlos como parte del cambio; puede tocar firmas internas (no las de `lib/data/store.ts`, que se conservan por §4 de AGENTS).
- **Ajustar el efecto de auth** podría cambiar el timing de carga de sesión → verificar que el login/logout mock sigue igual.

## Open Questions

- ¿Los 2 `rules-of-hooks` esconden un bug de estado real, o solo era un early return inocuo? (Investigar al corregir.)
- ¿Algún `any` corresponde a datos realmente dinámicos (respuestas del cuestionario) que convenga modelar con un tipo propio en `lib/types.ts`?
