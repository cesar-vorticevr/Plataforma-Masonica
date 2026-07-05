## 1. BD: consentimiento previo y evidencia

- [x] 1.1 Migración: `version_aviso_vigente()` y trigger `BEFORE INSERT` en `evaluaciones_salud` que exige consentimiento vigente. → `20260704233508_consentimiento_salud.sql`
- [x] 1.2 RPC `registrar_consentimiento(p_version)` (security definer) que inserta capturando `ip` desde `request.headers`; grants solo a `authenticated`.
- [x] 1.3 Aplicar en local; verificado que el trigger bloquea insertar salud sin consentimiento.

## 2. BD: derechos ARCO

- [x] 2.1 RPC `revocar_consentimiento()` (dueño); tras revocar, el trigger vuelve a bloquear.
- [x] 2.2 RPC `borrar_mi_salud()` (dueño) que elimina las evaluaciones del `auth.uid()`.

## 3. App

- [x] 3.1 `lib/data/salud.ts`: `registrarConsentimiento` usa la RPC; `revocarConsentimiento`/`borrarMiSalud` añadidas.
- [x] 3.2 Sección ARCO en `/salud` (exportar, revocar, borrar) con confirmación, reutilizando primitivos.
- [ ] 3.3 (Menor, DIFERIDO) `lib/health.ts`: semáforo del bloque de hábitos (§6.3) — requiere columna nueva y tocar el insert; se deja fuera de la tanda de críticos.

## 4. Verificación (Supabase + app)

- [x] 4.1 Sin consentimiento: insertar evaluación → rechazado; con consentimiento vigente → permitido. (verificado)
- [~] 4.2 `registrar_consentimiento` inserta con `version_aviso`/`fecha`; `ip` se captura de `request.headers` (nula en psql sin cabeceras; se poblará por la ruta de app). Mecanismo verificado, ip real pendiente de prueba e2e.
- [x] 4.3 Revocar → nueva evaluación rechazada hasta re-consentir. (verificado)
- [x] 4.4 `borrar_mi_salud` elimina solo las del propio usuario (la RPC opera sobre `auth.uid()`). (verificado)
- [x] 4.5 Lectura de salud sigue restringida al dueño (sin regresión).

## 5. Calidad

- [x] 5.1 `npm run typecheck` y `npm run lint` en verde.
