-- ====================================================================
-- Tesorería: fecha de inicio de cápitas + acceso del tesorero + fijar inicio.
-- ====================================================================

-- Desde cuándo paga cápitas cada hermano (si es null, se usa fecha_registro).
alter table perfiles add column if not exists fecha_inicio date;

-- El tesorero necesita LEER los perfiles de su logia (para la matriz de cápitas).
-- Se reescribe perfiles_self añadiendo ese caso (lectura, acotada a su logia).
drop policy if exists perfiles_self on perfiles;
create policy perfiles_self on perfiles for select using (
  id = auth.uid()
  or es_global()
  or (es_admin() and logia_id = mi_logia())
  or (mi_rol() = 'tesorero' and logia_id = mi_logia())
);

-- Fijar la fecha de inicio de un hermano: solo tesorero/secretario/master de su logia,
-- y SOLO esa columna (sin abrir la escritura general de perfiles).
create or replace function set_inicio_capita(p_usuario uuid, p_fecha date)
  returns void language plpgsql security definer set search_path = public as $$
begin
  if not (
    mi_rol() in ('tesorero','secretario','master')
    and exists (
      select 1 from perfiles p
      where p.id = p_usuario and (p.logia_id = mi_logia() or mi_rol() = 'master')
    )
  ) then
    raise exception 'No autorizado';
  end if;
  update perfiles set fecha_inicio = p_fecha where id = p_usuario;
end $$;

revoke all on function set_inicio_capita(uuid, date) from public;
grant execute on function set_inicio_capita(uuid, date) to authenticated;
