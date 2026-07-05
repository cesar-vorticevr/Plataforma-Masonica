## Context

`consentimientos(id, usuario_id, version_aviso, fecha, ip)` con policy `consent_rw` (ALL). La versión
vigente está hoy en `lib/data/salud.ts` (`2025-03-v1`). `evaluaciones_salud` tiene solo `salud_owner`
(ALL, `usuario_id=auth.uid()`), sin comprobar consentimiento. La barrera de lectura de salud (solo el
dueño) es correcta y NO se toca. `registrarConsentimiento` no escribe `ip`. Supabase/PostgREST expone
las cabeceras de la petición vía `current_setting('request.headers', true)`.

## Goals / Non-Goals

**Goals:** consentimiento previo forzado en servidor; capturar ip; ARCO in-app (revocar/exportar/borrar).
**Non-Goals:** texto legal/leyenda médica (externos); cálculo de puntajes; lectura de salud.

## Decisions

### 1. Trigger que exige consentimiento vigente antes de insertar evaluación
```sql
create or replace function exige_consentimiento_salud()
  returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from consentimientos c
    where c.usuario_id = new.usuario_id
      and c.version_aviso = version_aviso_vigente()   -- fuente única en BD
  ) then
    raise exception 'Se requiere consentimiento vigente del aviso de privacidad antes de registrar salud';
  end if;
  return new;
end $$;

create trigger trg_exige_consentimiento_salud
  before insert on evaluaciones_salud
  for each row execute function exige_consentimiento_salud();
```
- `version_aviso_vigente()`: función `immutable`/`stable` que devuelve la versión vigente (fuente única
  en BD); la app importa la misma constante para el gate de UI.

### 2. Captura de `ip` en el servidor
- En el `INSERT` de consentimiento, fijar `ip` desde las cabeceras:
  `ip := split_part(current_setting('request.headers',true)::json->>'x-forwarded-for', ',', 1)`.
  Implementar como `default` de columna o dentro de un `registrar_consentimiento(p_version)` RPC
  `security definer` (preferido: RPC, para no confiar en el cliente y validar versión).

### 3. RPCs ARCO (guard por dueño)
- `revocar_consentimiento()`: borra/expira los consentimientos del `auth.uid()` (revocación). Tras
  revocar, el trigger #1 vuelve a bloquear nuevas evaluaciones.
- `borrar_mi_salud()`: elimina las evaluaciones de salud del `auth.uid()` (derecho de cancelación).
- Exportación: puede resolverse en la app (lecturas propias ya permitidas por RLS) empaquetando en
  JSON/CSV; no requiere RPC nueva.

### 4. App
- `lib/data/salud.ts`: `registrarConsentimiento` pasa a llamar la RPC (con captura de ip server-side);
  `addEvaluacion` no cambia (el trigger la respalda).
- UI: sección ARCO en `/privacidad` o `/salud` (revocar, exportar, borrar) reutilizando primitivos.
- Versión de aviso: constante compartida alineada con `version_aviso_vigente()` en BD.

### 5. (Menor) Semáforo de hábitos
- Añadir un semáforo del bloque hábitos en `lib/health.ts` (hoy solo etiquetas), coherente con §6.3.

*Alternativa considerada para #1:* comprobar consentimiento en `WITH CHECK` de una policy. Se descarta:
requiere subconsulta y no puede referenciar "versión vigente" con claridad; el trigger es explícito y
da un mensaje de error accionable.

## Risks / Trade-offs

- [x-forwarded-for ausente/espoofable] → Es evidencia complementaria; la barrera legal es la existencia
  del consentimiento con fecha/versión, no la ip. Se toma el primer valor de la cadena.
- [Borrado de salud irreversible] → Es el derecho de cancelación; la UI debe confirmar explícitamente.
- [Doble fuente de versión] → Se centraliza en `version_aviso_vigente()` (BD) y una constante espejo en
  la app; documentar que deben cambiarse juntas.

## Migration Plan

1. Migración: `version_aviso_vigente()`, trigger de consentimiento, RPC de registro con ip, RPCs ARCO.
2. App: cablear salud.ts + UI ARCO.
3. Local → prod. Rollback: `drop trigger`/`drop function`; la app vuelve al gate solo-UI.

**Seguridad/Privacidad:** consentimiento previo en servidor; datos sensibles con base legal y ARCO.
**Externo:** texto del aviso (abogado) y leyenda de deslinde (médico) — §11-#9/#10.

## Open Questions

- ¿Revocar consentimiento debe además borrar automáticamente las evaluaciones previas, o solo impedir
  nuevas? (Propuesto: revocar impide nuevas; el borrado es una acción ARCO separada y explícita.)
