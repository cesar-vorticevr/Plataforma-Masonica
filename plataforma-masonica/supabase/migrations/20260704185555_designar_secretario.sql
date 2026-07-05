-- Designación de secretario de logia por el admin global (Gran Secretario / Master), conforme a la
-- especificación §4.1/§4.2/§5.13 ("alta de secretarios"). El secretario se representa con
-- perfiles.rol='secretario' + logia_id (no hay logias.secretario_id). Regla: un secretario por logia.
-- La autorización vive DENTRO de la función (es_global()); las RPC son security definer.

create or replace function designar_secretario(p_usuario uuid)
  returns void language plpgsql security definer set search_path = public as $$
declare
  v_logia uuid;
  v_estado estado_t;
begin
  if not es_global() then
    raise exception 'No autorizado para designar secretarios';
  end if;
  select logia_id, estado into v_logia, v_estado from perfiles where id = p_usuario;
  if v_logia is null then
    raise exception 'El usuario no pertenece a una logia';
  end if;
  if v_estado <> 'validado' then
    raise exception 'Solo se puede designar secretario a un hermano validado';
  end if;
  -- Un secretario por logia: degradar al secretario anterior de esa logia.
  update perfiles set rol = 'hermano'
    where logia_id = v_logia and rol = 'secretario' and id <> p_usuario;
  update perfiles set rol = 'secretario' where id = p_usuario;
end $$;

create or replace function quitar_secretario(p_usuario uuid)
  returns void language plpgsql security definer set search_path = public as $$
begin
  if not es_global() then
    raise exception 'No autorizado';
  end if;
  update perfiles set rol = 'hermano' where id = p_usuario and rol = 'secretario';
end $$;

revoke all on function designar_secretario(uuid) from public, anon, authenticated;
grant execute on function designar_secretario(uuid) to authenticated;
revoke all on function quitar_secretario(uuid) from public, anon, authenticated;
grant execute on function quitar_secretario(uuid) to authenticated;

-- Endurecer perfiles_admin: hasta ahora tenía USING pero no WITH CHECK, lo que permitía a un admin
-- de logia (no global) fijar el rol de un perfil de su logia a cualquier valor (escalada). Ahora un
-- admin de logia solo puede dejar el rol en hermano/tesorero y no mover el perfil a otra logia.
drop policy if exists perfiles_admin on perfiles;
create policy perfiles_admin on perfiles for update
  using (es_global() or (es_admin() and logia_id = mi_logia()))
  with check (es_global() or (es_admin() and logia_id = mi_logia() and rol in ('hermano','tesorero')));
