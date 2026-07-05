## 1. BD: consentimiento previo y evidencia

- [ ] 1.1 Migración: `version_aviso_vigente()` (fuente única en BD) y trigger `BEFORE INSERT` en `evaluaciones_salud` que exige consentimiento vigente del `usuario_id`.
- [ ] 1.2 RPC `registrar_consentimiento(p_version)` (security definer) que inserta el consentimiento capturando `ip` desde `request.headers` en el servidor; grants solo a `authenticated`.
- [ ] 1.3 Aplicar en local sin borrar datos; verificar que el trigger bloquea insertar salud sin consentimiento.

## 2. BD: derechos ARCO

- [ ] 2.1 RPC `revocar_consentimiento()` (dueño) que revoca el consentimiento vigente; tras revocar, el trigger vuelve a bloquear nuevas evaluaciones.
- [ ] 2.2 RPC `borrar_mi_salud()` (dueño) que elimina las evaluaciones de salud del `auth.uid()`.

## 3. App

- [ ] 3.1 `lib/data/salud.ts`: `registrarConsentimiento` usa la RPC (ip server-side); versión de aviso como constante espejo de `version_aviso_vigente()`.
- [ ] 3.2 Sección ARCO en `/privacidad` o `/salud`: revocar consentimiento, exportar mis datos, borrar mis evaluaciones (con confirmación explícita), reutilizando primitivos de `components/ui`.
- [ ] 3.3 (Menor) `lib/health.ts`: semáforo del bloque de hábitos (§6.3).

## 4. Verificación (Supabase + app)

- [ ] 4.1 Sin consentimiento: insertar evaluación por API → rechazado. Con consentimiento vigente → permitido.
- [ ] 4.2 `registrar_consentimiento` guarda `version_aviso`, `fecha` e `ip`.
- [ ] 4.3 Revocar consentimiento → nueva evaluación rechazada hasta re-consentir.
- [ ] 4.4 `borrar_mi_salud` elimina solo las evaluaciones del propio usuario; un tercero no puede borrar las de otro.
- [ ] 4.5 Confirmar que la lectura de salud sigue restringida al dueño (sin regresión).

## 5. Calidad

- [ ] 5.1 `npm run typecheck` y `npm run lint` en verde.
