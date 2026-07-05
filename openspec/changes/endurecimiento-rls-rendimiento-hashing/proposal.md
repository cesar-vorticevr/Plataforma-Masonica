## Why

Auditoría transversal de seguridad/rendimiento (§8.1, §2.2) detectó endurecimientos pendientes que no
son fugas activas pero elevan riesgo y no escalan bien a 30+ logias y miles de hermanos:

- **Hashing débil**: las palabras clave usan bcrypt con **cost 06** (`$2a$06$…`), por debajo del
  estándar (10–12). `gen_salt('bf')` sin parámetro genera cost bajo.
- **Grant regresivo**: `perfiles_no_autoescalada` (trigger `security definer`) quedó **sin** el
  `revoke ... from public, anon, authenticated` que sí aplican las otras funciones endurecidas.
- **Rendimiento de RLS**: las políticas llaman `mi_logia()`/`mi_rol()`/`mi_grado()`/`es_admin()`
  directamente → se **reevalúan por fila** en vez de una vez (falta el patrón `(select fn())` que las
  vuelve initPlan cacheado). Faltan **índices** en columnas usadas por RLS (`perfiles.logia_id`,
  `eventos.logia_id`, `trabajos.logia_id`/`usuario_id`, `tenidas.logia_id`, `asistencias.tenida_id`,
  `pagos.usuario_id`, `correspondencia.de_logia_id`). Varias políticas usan `TO {public}` en lugar de
  `TO authenticated` → se evalúan también para `anon`.

Pertenece a la Fase transversal de calidad/seguridad; **no cambia comportamiento funcional**, solo
endurece y optimiza. Se apoya en las skills `supabase` y `supabase-postgres-best-practices`.

## What Changes

- **Hashing:** subir el cost de bcrypt (≥10) en `set_palabra_logia`, `crear_logia`, verificación y en
  la semilla; estrategia de **re-hash** (las palabras clave se re-hashean al próximo cambio; documentar
  rotación recomendada).
- **Grants:** `revoke all ... ; grant execute ... to authenticated`-o-ninguno según corresponda para
  `perfiles_no_autoescalada` (es trigger: revocar de todos), alineado con el patrón existente.
- **Rendimiento RLS:** envolver las funciones auxiliares en `(select fn())` dentro de las políticas;
  crear los índices faltantes en columnas de RLS/FK; cambiar políticas de `TO public` a
  `TO authenticated` donde aplique.
- (Opcional) introducir `es_master()` si no se creó antes, para reuso.

## Capabilities

### New Capabilities
- `endurecimiento-seguridad-rendimiento`: hardening de hashing, grants y rendimiento/escalabilidad de
  las políticas RLS.

## Impact

- **Código:** una o varias migraciones (índices, recreación de políticas con `(select …)` y
  `TO authenticated`, cost de bcrypt, grants). Sin cambios de app.
- **Rendimiento:** mejora la evaluación de RLS a escala; índices aceleran los `EXISTS`/joins por logia.
- **Seguridad:** hashes más fuertes; superficie de funciones reducida.

## Non-goals

- No cambia la semántica de ninguna política (mismos resultados, mejor plan).
- No re-hashea retroactivamente las claves existentes sin rotación (se re-hashean al cambiarlas).
- No aborda 2FA (aparcado).
