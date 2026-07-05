## 1. BD: tabla y función central

- [ ] 1.1 Migración: tabla `auditoria(id, actor_id, accion, entidad, entidad_id, detalle jsonb, ip, fecha)` con índices (fecha desc, entidad+entidad_id, actor_id) y RLS habilitada.
- [ ] 1.2 Policy `auditoria_read` solo para Master; sin policies de insert/update/delete (append-only vía security definer).
- [ ] 1.3 Función `registrar_auditoria(accion, entidad, entidad_id, detalle)` security definer que captura `actor_id=auth.uid()` e `ip` de `request.headers`; revocada de public/anon/authenticated.

## 2. BD: instrumentación

- [ ] 2.1 Añadir `perform registrar_auditoria(...)` en `crear_logia`, `designar_secretario`, `quitar_secretario`, `set_palabra_logia` (sin registrar claves en claro).
- [ ] 2.2 Triggers `AFTER` en `perfiles` (validación, cambio de rol/estado), `pagos` (alta) y `config_capitas` (cambios) que registran auditoría con el diff relevante.
- [ ] 2.3 Instrumentar `estadisticas_salud()` para registrar el acceso (actor, alcance, fecha), sin datos individuales.
- [ ] 2.4 `alter table perfiles add validado_por uuid, fecha_validacion timestamptz`; fijarlos al validar.
- [ ] 2.5 Aplicar en local sin borrar datos.

## 3. App (mínimo)

- [ ] 3.1 (Opcional en esta fase) Vista de solo lectura de la bitácora para el Master (tabla filtrable por entidad/fecha), reutilizando primitivos.

## 4. Verificación (Supabase)

- [ ] 4.1 Tras designar_secretario / crear_logia / set_palabra_logia: existen filas de auditoría correctas (sin claves en claro).
- [ ] 4.2 Tras validar/bloquear/cambiar rol un perfil: se registra auditoría; `validado_por`/`fecha_validacion` fijados al validar.
- [ ] 4.3 Tras registrar un pago / configurar cápita: se registra auditoría.
- [ ] 4.4 Consultar `estadisticas_salud`: se registra el acceso sin datos individuales.
- [ ] 4.5 Un hermano/secretario no puede leer ni modificar `auditoria`; el Master sí puede leer.

## 5. Calidad

- [ ] 5.1 `npm run typecheck` y `npm run lint` en verde.
