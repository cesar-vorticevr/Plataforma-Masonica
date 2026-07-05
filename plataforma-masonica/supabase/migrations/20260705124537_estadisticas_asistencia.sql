-- Vista AGREGADA de asistencia por logia para roles globales (master/gran_secretario), análoga a
-- estadisticas_capitas(). No expone asistencias individuales.
create or replace function estadisticas_asistencia()
  returns jsonb language plpgsql security definer set search_path = public as $$
declare result jsonb;
begin
  if not (es_master() or mi_rol() = 'gran_secretario') then
    raise exception 'No autorizado';
  end if;
  select coalesce(jsonb_agg(row_to_json(t)::jsonb order by numero), '[]'::jsonb) into result
  from (
    select l.id as logia_id, l.nombre, l.numero,
           count(distinct te.id) as tenidas,
           count(a.*) filter (where a.presente) as presentes,
           count(a.*) as registros,
           case when count(a.*) = 0 then 0
                else round(100.0 * count(a.*) filter (where a.presente) / count(a.*)) end as asistencia_pct
    from logias l
    left join tenidas te on te.logia_id = l.id
    left join asistencias a on a.tenida_id = te.id
    group by l.id, l.nombre, l.numero
  ) t;
  return result;
end $$;
revoke all on function estadisticas_asistencia() from public, anon, authenticated;
grant execute on function estadisticas_asistencia() to authenticated;
