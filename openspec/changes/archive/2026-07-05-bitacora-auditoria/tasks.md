## 1. BD: tabla y función central

- [x] 1.1 Migración: tabla `auditoria(...)` con índices (fecha desc, entidad+entidad_id, actor_id) y RLS. → `20260705001203_bitacora_auditoria.sql`
- [x] 1.2 Policy `auditoria_read` solo Master; `grant select` a `authenticated` (la RLS aplica tras el privilegio de tabla); sin insert/update/delete (append-only vía security definer).
- [x] 1.3 Función `registrar_auditoria(...)` security definer que captura `actor_id=auth.uid()` e `ip`; revocada de public/anon/authenticated.

## 2. BD: instrumentación

- [x] 2.1 Registro de `crear_logia`, `designar/quitar_secretario` (cambio de rol), `set_palabra_logia` (cambio de palabra clave, sin la clave) — cubierto vía triggers en `logias`/`perfiles` (en vez de editar cada RPC).
- [x] 2.2 Triggers `AFTER` en `perfiles` (validar/bloquear/cambiar rol/estado), `pagos` (alta) y `config_capitas`.
- [x] 2.3 Instrumentar `estadisticas_salud()` para registrar el acceso (actor, alcance, fecha), sin datos individuales.
- [x] 2.4 `perfiles.validado_por`/`fecha_validacion`; fijados por trigger BEFORE al pasar a `validado`.
- [x] 2.5 Aplicar en local sin borrar datos.

## 3. App (mínimo)

- [ ] 3.1 (Opcional, DIFERIDO) Vista de solo lectura de la bitácora para el Master. El requisito duro (registro) está cubierto; la vista se deja para una tanda posterior.

## 4. Verificación (Supabase)

- [x] 4.1 crear_logia / set_palabra_logia registran auditoría (sin clave en claro). (verificado)
- [x] 4.2 validar/cambiar_rol registran auditoría; `validado_por`/`fecha_validacion` fijados al validar. (verificado)
- [x] 4.3 pago registra auditoría. (verificado)
- [x] 4.4 `estadisticas_salud` registra el acceso sin datos individuales. (verificado)
- [x] 4.5 Hermano/secretario no leen `auditoria`; el Master sí. (verificado)

## 5. Calidad

- [x] 5.1 `npm run typecheck` y `npm run lint` en verde.
