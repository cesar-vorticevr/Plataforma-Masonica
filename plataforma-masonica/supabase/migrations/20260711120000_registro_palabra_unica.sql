-- Registro con una sola palabra clave (la de la logia) + listado público de logias.
--
-- (1) listar_logias_registro(): el formulario público /register consulta como rol `anon`.
--     La policy logias_read está restringida a `authenticated`, así que el listado salía
--     vacío. Se expone una función SECURITY DEFINER acotada (solo columnas no sensibles de
--     logias activas), legible por anon. No recibe palabra clave -> no habilita fuerza bruta
--     y NUNCA devuelve palabra_clave.
-- (2) Se elimina la "palabra clave de la Orden": verificar_acceso pasa a validar solo la
--     logia y se elimina la tabla `config`. Decisión de producto: una sola palabra clave.
--
-- ROLLBACK (manual, si se necesita revertir):
--   - recrear table config (id int pk, palabra_general_hash text not null) + su RLS;
--   - recrear verificar_acceso(text, uuid, text) con el doble check (config + logia)
--     y grant execute a service_role;
--   - drop function verificar_acceso(uuid, text) y drop function listar_logias_registro().

-- ============ 1) Listado público de logias para el registro ============
create or replace function listar_logias_registro()
  returns table (id uuid, nombre text, numero int, oriente text)
  language sql security definer set search_path = public
  stable
as $$
  select id, nombre, numero, oriente
  from logias
  where estado = 'activa'
  order by numero;
$$;

revoke all on function listar_logias_registro() from public;
grant execute on function listar_logias_registro() to anon, authenticated;

-- ============ 2) verificar_acceso: solo palabra clave de la logia ============
-- Nueva firma (2 args). Sigue siendo el único oráculo de contraseñas, solo service_role.
create or replace function verificar_acceso(p_logia uuid, p_clave_logia text)
  returns boolean language sql security definer set search_path = public as $$
  -- Comparación insensible a mayúsculas y espacios (normaliza con lower(trim(...))).
  select exists (
    select 1 from logias
    where id = p_logia
      and palabra_clave = extensions.crypt(lower(trim(p_clave_logia)), palabra_clave)
  );
$$;

-- Retirar la firma vieja (3 args: general + logia) y afinar grants de la nueva.
drop function if exists verificar_acceso(text, uuid, text);
revoke all on function verificar_acceso(uuid, text) from public, anon, authenticated;
grant execute on function verificar_acceso(uuid, text) to service_role;

-- ============ 3) Eliminar la palabra clave de la Orden ============
-- `config` solo la referenciaba verificar_acceso (sin FK/trigger/tipo TS dependientes);
-- se elimina DESPUÉS de redefinir la función para no dejarla apuntando a una tabla inexistente.
drop table if exists config;
