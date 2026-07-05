-- Bitácora de auditoría (§7/§8.1): registro append-only de acciones administrativas y accesos a
-- datos sensibles. Se instrumenta con triggers AFTER en las tablas mutadas por acciones admin
-- (logias, perfiles, pagos, config_capitas) — cubre crear_logia, set_palabra_logia,
-- designar/quitar_secretario, validar/bloquear/cambiar rol, pagos y cápitas sin reescribir las RPC —
-- más la instrumentación de estadisticas_salud (acceso a datos sensibles agregados).

create table if not exists auditoria (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  accion text not null,
  entidad text not null,
  entidad_id uuid,
  detalle jsonb not null default '{}'::jsonb,
  ip text,
  fecha timestamptz not null default now()
);
create index if not exists auditoria_fecha_idx on auditoria (fecha desc);
create index if not exists auditoria_entidad_idx on auditoria (entidad, entidad_id);
create index if not exists auditoria_actor_idx on auditoria (actor_id);

alter table auditoria enable row level security;
-- La RLS aplica DESPUÉS del privilegio de tabla: hay que conceder SELECT a authenticated para que
-- la policy (solo master) pueda evaluarse; sin grant, ni el master puede leer. Sin insert/update/delete.
grant select on auditoria to authenticated;
drop policy if exists auditoria_read on auditoria;
create policy auditoria_read on auditoria for select using (mi_rol() = 'master');
-- Sin políticas de insert/update/delete: solo se escribe vía SECURITY DEFINER (append-only).

-- Función central: captura actor (auth.uid) e ip; owner=postgres => salta RLS para insertar.
create or replace function registrar_auditoria(p_accion text, p_entidad text, p_entidad_id uuid, p_detalle jsonb default '{}'::jsonb)
  returns void language plpgsql security definer set search_path = public as $$
begin
  insert into auditoria(actor_id, accion, entidad, entidad_id, detalle, ip)
  values (
    auth.uid(), p_accion, p_entidad, p_entidad_id, coalesce(p_detalle, '{}'::jsonb),
    nullif(split_part(coalesce(current_setting('request.headers', true), '{}')::json->>'x-forwarded-for', ',', 1), '')
  );
end $$;
revoke all on function registrar_auditoria(text,text,uuid,jsonb) from public, anon, authenticated;

-- Trazabilidad de la validación en el propio perfil.
alter table perfiles add column if not exists validado_por uuid;
alter table perfiles add column if not exists fecha_validacion timestamptz;

-- BEFORE: al pasar a 'validado', registrar quién y cuándo.
create or replace function set_validacion_perfil()
  returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.estado = 'validado' and old.estado is distinct from 'validado' then
    new.validado_por := auth.uid();
    new.fecha_validacion := now();
  end if;
  return new;
end $$;
drop trigger if exists trg_set_validacion_perfil on perfiles;
create trigger trg_set_validacion_perfil before update on perfiles
  for each row execute function set_validacion_perfil();

-- AFTER: auditoría por tabla (sin registrar secretos).
create or replace function audit_logias()
  returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    perform registrar_auditoria('crear_logia', 'logia', new.id,
      jsonb_build_object('nombre', new.nombre, 'numero', new.numero, 'oriente', new.oriente));
  elsif tg_op = 'UPDATE' then
    if new.palabra_clave is distinct from old.palabra_clave then
      perform registrar_auditoria('cambiar_palabra_logia', 'logia', new.id, '{}'::jsonb);  -- nunca la clave
    else
      perform registrar_auditoria('actualizar_logia', 'logia', new.id,
        jsonb_build_object('nombre', new.nombre, 'numero', new.numero, 'oriente', new.oriente));
    end if;
  end if;
  return null;
end $$;
drop trigger if exists trg_audit_logias on logias;
create trigger trg_audit_logias after insert or update on logias
  for each row execute function audit_logias();

create or replace function audit_perfiles()
  returns trigger language plpgsql security definer set search_path = public as $$
declare v_accion text;
begin
  if new.estado = 'validado' and old.estado is distinct from 'validado' then v_accion := 'validar';
  elsif new.estado = 'bloqueado' and old.estado is distinct from 'bloqueado' then v_accion := 'bloquear';
  elsif new.rol is distinct from old.rol then v_accion := 'cambiar_rol';
  elsif new.estado is distinct from old.estado then v_accion := 'cambiar_estado';
  else v_accion := null;  -- cambios no administrativos (p.ej. foto) no se auditan
  end if;
  if v_accion is not null then
    perform registrar_auditoria(v_accion, 'perfil', new.id,
      jsonb_build_object('rol', new.rol, 'estado', new.estado, 'grado', new.grado));
  end if;
  return null;
end $$;
drop trigger if exists trg_audit_perfiles on perfiles;
create trigger trg_audit_perfiles after update on perfiles
  for each row execute function audit_perfiles();

create or replace function audit_pagos()
  returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform registrar_auditoria('pago_registrado', 'pago', new.id,
    jsonb_build_object('usuario_id', new.usuario_id, 'anio', new.anio, 'mes', new.mes, 'pagado', new.pagado));
  return null;
end $$;
drop trigger if exists trg_audit_pagos on pagos;
create trigger trg_audit_pagos after insert or update on pagos
  for each row execute function audit_pagos();

create or replace function audit_config_capitas()
  returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform registrar_auditoria('config_capita', 'config_capita', new.logia_id,
    jsonb_build_object('logia_id', new.logia_id, 'monto', new.monto, 'periodicidad', new.periodicidad));
  return null;
end $$;
drop trigger if exists trg_audit_config_capitas on config_capitas;
create trigger trg_audit_config_capitas after insert or update on config_capitas
  for each row execute function audit_config_capitas();

-- Instrumentar el acceso a datos sensibles agregados de salud.
create or replace function estadisticas_salud(p_logia uuid default null::uuid)
  returns jsonb language plpgsql security definer set search_path to 'public' as $function$
declare
  v_min_cohorte constant int := 5;
  v_scope_logia uuid;
  v_all boolean := false;
  v_cohorte int;
  result jsonb;
begin
  -- 1) Acceso y alcance (no se confía en la UI).
  if es_global() then
    if p_logia is null then v_all := true; else v_scope_logia := p_logia; end if;
  elsif es_admin() then
    v_scope_logia := mi_logia();
  else
    raise exception 'No autorizado';
  end if;

  -- Auditar el acceso a datos sensibles (sin datos individuales).
  perform registrar_auditoria('consulta', 'estadisticas_salud', null,
    jsonb_build_object('alcance', case when v_all then 'todas' else v_scope_logia::text end));

  -- 2) Cohorte = hermanos con evaluación en el alcance (última por hermano).
  with ult as (
    select distinct on (e.usuario_id) e.*
    from evaluaciones_salud e
    join perfiles p on p.id = e.usuario_id
    where v_all or p.logia_id = v_scope_logia
    order by e.usuario_id, e.fecha desc
  )
  select count(*) into v_cohorte from ult;

  if v_cohorte < v_min_cohorte then
    return jsonb_build_object('cohorte', v_cohorte, 'suprimido', true);
  end if;

  with ult as (
    select distinct on (e.usuario_id) e.*
    from evaluaciones_salud e
    join perfiles p on p.id = e.usuario_id
    where v_all or p.logia_id = v_scope_logia
    order by e.usuario_id, e.fecha desc
  )
  select jsonb_build_object(
    'cohorte', v_cohorte,
    'suprimido', false,
    'semaforo_metabolico', jsonb_build_object(
      'verde',    count(*) filter (where semaforo_metabolico = 'verde'),
      'amarillo', count(*) filter (where semaforo_metabolico = 'amarillo'),
      'rojo',     count(*) filter (where semaforo_metabolico = 'rojo')
    ),
    'semaforo_oncologico', jsonb_build_object(
      'verde',    count(*) filter (where semaforo_oncologico = 'verde'),
      'amarillo', count(*) filter (where semaforo_oncologico = 'amarillo'),
      'rojo',     count(*) filter (where semaforo_oncologico = 'rojo')
    ),
    'etiquetas', coalesce((
      select jsonb_agg(jsonb_build_object('k', k, 'n', n) order by n desc)
      from (select et as k, count(*) as n from ult, unnest(etiquetas) et group by et) te
    ), '[]'::jsonb),
    'condiciones', coalesce((
      select jsonb_agg(jsonb_build_object('k', k, 'n', n) order by n desc)
      from (select c as k, count(*) as n from ult, unnest(condiciones) c group by c) tc
    ), '[]'::jsonb)
  ) into result
  from ult;

  return result;
end $function$;
