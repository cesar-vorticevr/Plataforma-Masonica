## Why

No existe **bitácora de auditoría**. La especificación la exige explícitamente: §7 la lista como
entidad (`Auditoría: id, usuario_id, acción, entidad, fecha, detalle`) y §8.1 pide "bitácora de
auditoría de acciones administrativas y de accesos a datos sensibles". Verificado: no hay tabla de
auditoría ni registro de ninguna acción (crear/editar logias, designar/quitar secretarios, cambiar
palabra clave, validar/bloquear/asignar rol, registrar pagos, configurar cápitas) ni de accesos a
datos sensibles (estadísticas de salud).

Sin bitácora no hay trazabilidad ni rendición de cuentas, lo que además es un requisito de
cumplimiento (LFPDPPP 2025) al tratarse de una plataforma con datos personales y sensibles.
Pertenece a la **Fase 1/transversal** y **toca autorización/cumplimiento**.

## What Changes

- **BD (migración nueva):**
  - Tabla `auditoria(id, actor_id, accion, entidad, entidad_id, detalle jsonb, ip, fecha)`,
    **append-only** (sin update/delete), con RLS de solo lectura para el Master (y Gran Secretario
    acotado, a decidir).
  - Función `registrar_auditoria(accion, entidad, entidad_id, detalle)` `security definer` que inserta
    la fila capturando `actor_id = auth.uid()` e `ip` desde `request.headers`.
  - Instrumentar las acciones administrativas existentes para que registren en la bitácora:
    `crear_logia`, `designar_secretario`, `quitar_secretario`, `set_palabra_logia`, y las mutaciones
    de `perfiles` (validación, cambio de rol/estado), `pagos` y `config_capitas` (vía triggers o
    dentro de las RPC).
  - Registrar el **acceso a datos sensibles**: `estadisticas_salud()` deja constancia de cada consulta
    (quién, cuándo, alcance), sin exponer datos individuales.
  - Añadir `perfiles.validado_por` y `perfiles.fecha_validacion` (modelo §7), fijados al validar.
- **App (mínimo):** una vista de solo lectura de la bitácora para el Master (opcional en esta fase).

## Capabilities

### New Capabilities
- `bitacora-auditoria`: registro append-only de acciones administrativas y accesos a datos sensibles,
  con actor, entidad, detalle, ip y fecha; lectura restringida.

## Impact

- **Código:** migración nueva (tabla + función + triggers/instrumentación), posiblemente pequeña UI de
  consulta. Sin cambios en el dominio TS salvo tipos de la nueva entidad.
- **Cumplimiento:** satisface §7/§8.1 (trazabilidad de acciones y accesos sensibles).
- **Rendimiento:** inserciones de auditoría ligeras; índices por `entidad`/`fecha`/`actor_id`.

## Non-goals

- No implementa alertas ni exportación avanzada de la bitácora (posible mejora posterior).
- No audita lecturas ordinarias (solo acciones administrativas y accesos a datos sensibles).
- No define política de retención (se sugiere en Decisiones abiertas; se puede fijar después).
