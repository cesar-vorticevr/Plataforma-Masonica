-- ====================================================================
-- Estadísticas de salud AGREGADAS y ANONIMIZADAS para administradores.
-- security definer: lee evaluaciones_salud (RLS solo-dueño) y devuelve SOLO agregados.
-- Gating por rol/logia DENTRO de la función; nunca devuelve usuario_id ni filas individuales.
-- k-anonimato: suprime el desglose si el cohorte de evaluados < MIN_COHORTE.
-- ====================================================================
create or replace function estadisticas_salud(p_logia uuid default null)
  returns jsonb language plpgsql security definer set search_path = public as $$
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
    v_scope_logia := mi_logia();   -- secretario: forzado a su logia (ignora p_logia)
  else
    raise exception 'No autorizado';
  end if;

  -- 2) Cohorte = hermanos con evaluación en el alcance (última por hermano).
  with ult as (
    select distinct on (e.usuario_id) e.*
    from evaluaciones_salud e
    join perfiles p on p.id = e.usuario_id
    where v_all or p.logia_id = v_scope_logia
    order by e.usuario_id, e.fecha desc
  )
  select count(*) into v_cohorte from ult;

  -- 3) k-anonimato: suprimir el desglose en cohortes pequeños.
  if v_cohorte < v_min_cohorte then
    return jsonb_build_object('cohorte', v_cohorte, 'suprimido', true);
  end if;

  -- 4) Agregados (sin identificadores).
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
end $$;

-- El gating por rol vive dentro de la función; se concede ejecución a authenticated (no a anon).
revoke all on function estadisticas_salud(uuid) from public;
grant execute on function estadisticas_salud(uuid) to authenticated;
