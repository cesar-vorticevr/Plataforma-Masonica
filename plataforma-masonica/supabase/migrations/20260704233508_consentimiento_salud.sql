-- Cumplimiento (LFPDPPP): consentimiento PREVIO forzado en el servidor para datos de salud,
-- captura de evidencia (ip) y mecanismos ARCO (revocar / borrar mis datos).
-- La barrera de lectura (solo el dueño) NO se toca aquí.

-- Fuente única de la versión de aviso vigente (espejo de AVISO_PRIVACIDAD_VERSION en la app).
create or replace function version_aviso_vigente() returns text
  language sql immutable set search_path = public as $$ select '2025-03-v1'::text $$;

-- Trigger: no se puede insertar una evaluación de salud sin consentimiento vigente.
create or replace function exige_consentimiento_salud()
  returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from consentimientos c
    where c.usuario_id = new.usuario_id and c.version_aviso = version_aviso_vigente()
  ) then
    raise exception 'Se requiere consentimiento vigente del aviso de privacidad antes de registrar salud';
  end if;
  return new;
end $$;

drop trigger if exists trg_exige_consentimiento_salud on evaluaciones_salud;
create trigger trg_exige_consentimiento_salud
  before insert on evaluaciones_salud
  for each row execute function exige_consentimiento_salud();

-- Registrar consentimiento capturando la ip en el servidor (no se confía al cliente).
create or replace function registrar_consentimiento(p_version text)
  returns void language plpgsql security definer set search_path = public as $$
begin
  insert into consentimientos(usuario_id, version_aviso, ip)
  values (
    auth.uid(),
    p_version,
    nullif(split_part(coalesce(current_setting('request.headers', true), '{}')::json->>'x-forwarded-for', ',', 1), '')
  );
end $$;

-- ARCO: revocar consentimiento (impide nuevas evaluaciones) y borrar mis evaluaciones de salud.
create or replace function revocar_consentimiento()
  returns void language plpgsql security definer set search_path = public as $$
begin
  delete from consentimientos where usuario_id = auth.uid();
end $$;

create or replace function borrar_mi_salud()
  returns void language plpgsql security definer set search_path = public as $$
begin
  delete from evaluaciones_salud where usuario_id = auth.uid();
end $$;

revoke all on function registrar_consentimiento(text) from public, anon, authenticated;
grant execute on function registrar_consentimiento(text) to authenticated;
revoke all on function revocar_consentimiento() from public, anon, authenticated;
grant execute on function revocar_consentimiento() to authenticated;
revoke all on function borrar_mi_salud() from public, anon, authenticated;
grant execute on function borrar_mi_salud() to authenticated;
