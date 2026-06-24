## 1. Prerrequisito

- [ ] 1.1 Confirmar que `upgrade-nextjs-16` está aplicado (ESLint configurado, `npm run lint` corre).
- [ ] 1.2 Capturar el listado actual de hallazgos como referencia (`npm run lint`).

## 2. Bugs potenciales (rules-of-hooks)

- [ ] 2.1 `app/(app)/admin/page.tsx:18` — mover `useState` arriba del early return; investigar si escondía un bug de estado y documentarlo.
- [ ] 2.2 `app/(app)/tesoreria/page.tsx:20` — ídem; reordenar hooks para orden estable.
- [ ] 2.3 Smoke test en modo mock de `admin` y `tesoreria` tras el cambio (comportamiento preservado).

## 3. Efecto de auth y export anónimo

- [ ] 3.1 `lib/auth.tsx:33` — corregir `react-hooks/set-state-in-effect` sin cambiar el comportamiento de carga de sesión mock.
- [ ] 3.2 `postcss.config.mjs` — asignar el objeto a una variable antes del `export default`.

## 4. Tipado (no-explicit-any)

- [ ] 4.1 Reemplazar los 17 `any` por tipos concretos (apoyándose en `lib/types.ts`) o `unknown` con estrechamiento; priorizar `lib/types.ts`, `lib/health.ts` y los handlers de las páginas.
- [ ] 4.2 Modelar con un tipo propio los datos genuinamente dinámicos (p. ej. `respuestas` del cuestionario) si aplica.

## 5. Código sin usar

- [ ] 5.1 Eliminar los 6 imports/variables sin usar (`lib/data/store.ts`, `app/register`, etc.).

## 6. Validación

- [ ] 6.1 `npm run lint` en verde (0 errores, 0 warnings) sin relajar reglas.
- [ ] 6.2 `npm run typecheck` en verde tras el retipado.
- [ ] 6.3 `npm run build` exitosa y smoke test de las rutas afectadas en modo mock.
