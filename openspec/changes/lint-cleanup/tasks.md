## 1. Prerrequisito

- [x] 1.1 Confirmar que `upgrade-nextjs-16` está aplicado (ESLint configurado, `npm run lint` corre).
- [x] 1.2 Capturar el listado actual de hallazgos como referencia (`npm run lint`): 20 errores + 7 warnings.

## 2. Bugs potenciales (rules-of-hooks)

- [x] 2.1 `app/(app)/admin/page.tsx` — bug real confirmado: `useState(user.logia_id)` se llamaba tras `if (!user) return null`. Resuelto separando `AdminInner({ user })` que solo monta con `user` garantizado; comportamiento preservado (logiaSel inicia en user.logia_id).
- [x] 2.2 `app/(app)/tesoreria/page.tsx` — mismo patrón (`montoEdit` tras el early return). Resuelto con `TesoreriaInner({ user })`.
- [x] 2.3 Smoke test en modo mock de `admin` y `tesoreria`: 200, sin errores.

## 3. Efecto de auth y export anónimo

- [x] 3.1 `lib/auth.tsx` — el `set-state-in-effect` es intencional (restauración de sesión desde localStorage tras el montaje, para evitar hydration mismatch en SSR). Documentado y acotado con `eslint-disable` justificado; comportamiento sin cambios. (Este auth mock se reemplaza en Fase 1.)
- [x] 3.2 `postcss.config.mjs` — objeto asignado a `const config` antes del `export default`.

## 4. Tipado (no-explicit-any)

- [x] 4.1 Reemplazados los 17 `any`: `catch (err)` con narrowing (`err instanceof Error`) en login/register; `Logia` en admin; casts específicos (`"pdf"|"word"`, `"logia"|"global"`) en buzon/eventos; `Semaforo` en salud; `set` genérico tipado en directorio (eliminado el hack `_kw` con un estado `kw` dedicado).
- [x] 4.2 Modelados los datos dinámicos del cuestionario con `RespuestaSalud`/`RespuestasSalud` en `lib/types.ts`, reutilizados en `lib/health.ts` y `salud`.

## 5. Código sin usar

- [x] 5.1 Eliminados imports/variables sin usar: `Asistencia`/`MensajeProfesional`/`Pago`/`Tenida` en store.ts; prop `puntaje` en BloqueCard (salud). `_password` (auth) se conserva por la firma del interface y se ignora vía convención `^_` en el config de ESLint.

## 6. Validación

- [x] 6.1 `npm run lint` en verde (0 errores, 0 warnings) sin relajar reglas (se endureció `no-unused-vars` a error + convención `^_`).
- [x] 6.2 `npm run typecheck` en verde (incluyó corregir un error de tipos real en el `<select>` de salud).
- [x] 6.3 `npm run build` exitosa (20 rutas) y smoke test de las rutas afectadas en modo mock (todas 200, sin errores).
