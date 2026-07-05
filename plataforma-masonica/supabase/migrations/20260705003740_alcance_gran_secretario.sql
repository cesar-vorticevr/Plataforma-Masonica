-- Alcance del Gran Secretario según §4.2: agregado (Agreg), no individual.
-- 1) es_master() para distinguir del es_global() (= gran_secretario OR master).
-- 2) generales: el Gran Secretario deja de leer generales INDIVIDUALES (queda dueño + master +
--    secretario de su logia). Conserva el gate de estado de la migración de enforcement.
-- 3) trabajos: los roles globales (master/gran_secretario) ven trabajos de TODAS las logias.
-- 4) estadisticas_capitas(): vista AGREGADA de cápitas por logia para master/gran_secretario.

create or replace function es_master() returns boolean
  language sql stable set search_path = public as $$ select mi_rol() = 'master' $$;
revoke all on function es_master() from public, anon, authenticated;
grant execute on function es_master() to authenticated;

-- Generales: sustituir es_global() por es_master() (el Gran Secretario pierde lectura individual).
drop policy if exists generales_rw on generales;
create policy generales_rw on generales for all
  using (
    (usuario_id = auth.uid() and mi_estado() <> 'bloqueado')
    or es_master()
    or (es_admin() and exists (select 1 from perfiles p where p.id = generales.usuario_id and p.logia_id = mi_logia()))
  )
  with check (usuario_id = auth.uid() and mi_estado() <> 'bloqueado');

-- Trabajos: roles globales ven todo; el hermano sigue limitado por logia/cámara/estado.
drop policy if exists trabajos_read on trabajos;
create policy trabajos_read on trabajos for select
  using (
    mi_rol() in ('master','gran_secretario')
    or (logia_id = mi_logia() and nivel(camara) <= nivel(mi_grado()) and mi_estado() = 'validado')
  );

-- Vista agregada de cápitas por logia (sin filas individuales). Solo master/gran_secretario.
create or replace function estadisticas_capitas()
  returns jsonb language plpgsql security definer set search_path = public as $$
declare result jsonb;
begin
  if not (es_master() or mi_rol() = 'gran_secretario') then
    raise exception 'No autorizado';
  end if;
  select coalesce(jsonb_agg(row_to_json(t)::jsonb order by numero), '[]'::jsonb) into result
  from (
    select l.id as logia_id, l.nombre, l.numero,
           coalesce(sum(p.monto) filter (where p.pagado), 0) as recaudado,
           count(p.*) filter (where p.pagado) as pagos_cubiertos,
           count(p.*) as pagos_registrados,
           case when count(p.*) = 0 then 0
                else round(100.0 * count(p.*) filter (where p.pagado) / count(p.*)) end as cumplimiento_pct
    from logias l
    left join perfiles pf on pf.logia_id = l.id
    left join pagos p on p.usuario_id = pf.id
    group by l.id, l.nombre, l.numero
  ) t;
  return result;
end $$;
revoke all on function estadisticas_capitas() from public, anon, authenticated;
grant execute on function estadisticas_capitas() to authenticated;
