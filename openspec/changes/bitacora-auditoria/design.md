## Context

No existe tabla de auditoría. Las acciones administrativas ya pasan por puntos centralizados: RPCs
`security definer` (`crear_logia`, `designar_secretario`, `quitar_secretario`, `set_palabra_logia`) y
funciones de datos que hacen `update`/`insert` sobre `perfiles`, `pagos`, `config_capitas`. La lectura
de datos sensibles agregados pasa por `estadisticas_salud()`. Esto facilita instrumentar la bitácora
en pocos lugares.

## Goals / Non-Goals

**Goals:** bitácora append-only de acciones admin y accesos sensibles, con actor/entidad/detalle/ip/
fecha; lectura restringida; `validado_por`/`fecha_validacion`. **Non-Goals:** alertas, exportación
avanzada, retención (se decide luego), auditar lecturas ordinarias.

## Decisions

### 1. Tabla `auditoria` append-only
```sql
create table auditoria (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,                 -- auth.uid() del que ejecuta (null si sistema)
  accion text not null,          -- p.ej. 'designar_secretario','crear_logia','validar','pago_registrado'
  entidad text not null,         -- p.ej. 'logia','perfil','pago','estadisticas_salud'
  entidad_id uuid,               -- id afectado (si aplica)
  detalle jsonb not null default '{}'::jsonb,
  ip text,
  fecha timestamptz not null default now()
);
create index on auditoria (fecha desc);
create index on auditoria (entidad, entidad_id);
create index on auditoria (actor_id);
alter table auditoria enable row level security;
-- Lectura solo Master; sin insert/update/delete para usuarios (se escribe vía SECURITY DEFINER).
create policy auditoria_read on auditoria for select using (mi_rol() = 'master');
```
No se crea policy de INSERT/UPDATE/DELETE: los usuarios no pueden escribirla directamente. Las
funciones `security definer` (owner = postgres) insertan saltando RLS.

### 2. Función central `registrar_auditoria(...)`
```sql
create or replace function registrar_auditoria(p_accion text, p_entidad text, p_entidad_id uuid, p_detalle jsonb default '{}')
  returns void language plpgsql security definer set search_path = public as $$
begin
  insert into auditoria(actor_id, accion, entidad, entidad_id, detalle, ip)
  values (auth.uid(), p_accion, p_entidad, p_entidad_id, coalesce(p_detalle,'{}'::jsonb),
          split_part(current_setting('request.headers',true)::json->>'x-forwarded-for', ',', 1));
end $$;
revoke all on function registrar_auditoria(text,text,uuid,jsonb) from public, anon, authenticated;
-- se llama solo desde otras funciones security definer / triggers (no expuesta a clientes).
```

### 3. Instrumentación
- **RPCs existentes**: añadir `perform registrar_auditoria(...)` al final de `crear_logia`,
  `designar_secretario`, `quitar_secretario`, `set_palabra_logia` (nunca registrar la clave en claro).
- **Mutaciones de `perfiles`/`pagos`/`config_capitas`**: triggers `AFTER INSERT/UPDATE` que llaman
  `registrar_auditoria` con el diff relevante (p.ej. validación, cambio de rol/estado, alta de pago).
  Alternativa: registrar dentro de las funciones de datos; se prefiere trigger para cubrir también
  updates directos permitidos por RLS.
- **Acceso sensible**: `estadisticas_salud()` llama `registrar_auditoria('consulta','estadisticas_salud', null, {alcance})`.

### 4. `validado_por` / `fecha_validacion`
```sql
alter table perfiles add column validado_por uuid, add column fecha_validacion timestamptz;
```
Fijarlos en `adminValidar` (o en el trigger de auditoría de perfiles cuando `estado` pasa a
`validado`). También quedan en la bitácora.

### 5. App (mínimo)
- Vista de solo lectura de la bitácora para el Master (tabla filtrable por entidad/fecha). Opcional en
  esta fase; el requisito duro es el registro.

*Alternativa considerada:* auditar todo vía triggers genéricos en todas las tablas. Se descarta por
ruido y coste; se auditan acciones administrativas y accesos sensibles, como pide §8.1.

## Risks / Trade-offs

- [La bitácora podría crecer mucho] → índices por fecha/entidad; política de retención se define luego
  (Open Question). Volumen esperado moderado (solo acciones admin).
- [Registrar dentro de RPC vs trigger] → Para RPCs propias, registrar dentro es simple; para updates
  directos por RLS (validar/bloquear/tesorero) el trigger garantiza cobertura aunque cambie la app.
- [Fugas en `detalle`] → No incluir secretos (palabras clave) ni datos sensibles individuales de salud.

## Migration Plan

1. Migración: tabla + índices + RLS; `registrar_auditoria`; instrumentar RPCs; triggers de perfiles/
   pagos/config_capitas; instrumentar `estadisticas_salud`; columnas `validado_por`/`fecha_validacion`.
2. Local → prod. Rollback: `drop table auditoria cascade`, revertir instrumentación y columnas.

**Seguridad/Cumplimiento:** trazabilidad §7/§8.1. **Privacidad:** la bitácora no guarda datos
sensibles individuales ni claves. **DESIGN.md:** la vista (si se incluye) reutiliza `Card`/tabla.

## Open Questions

- Política de retención de la bitácora (¿12/24 meses? ¿archivado?).
- ¿El Gran Secretario puede leer la bitácora de su ámbito, o solo el Master? (Propuesto: solo Master en esta fase.)
