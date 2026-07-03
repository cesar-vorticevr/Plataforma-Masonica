-- ====================================================================
-- Endurecimiento de seguridad tras auditoría con `supabase db advisors`.
-- Cubre tres clases de hallazgos:
--   1) Políticas RLS de escritura con `WITH CHECK (true)` -> restringir INSERT.
--   2) Funciones con `search_path` mutable (lint 0011) -> fijar search_path.
--   3) Funciones SECURITY DEFINER ejecutables por anon/authenticated vía RPC
--      (lints 0028/0029) -> revocar EXECUTE explícitamente a anon/authenticated.
--
-- NOTA CLAVE sobre grants: Supabase configura DEFAULT PRIVILEGES que otorgan
-- EXECUTE en funciones nuevas del esquema public DIRECTAMENTE a `anon` y
-- `authenticated` (no solo vía PUBLIC). Por eso un `revoke ... from public`
-- por sí solo NO retira el acceso: hay que nombrar a anon/authenticated.
-- ====================================================================

-- --------------------------------------------------------------------
-- 1) POLÍTICAS RLS: cerrar el hueco de INSERT con `WITH CHECK (true)`.
--    Con FOR ALL, el INSERT solo evalúa WITH CHECK; al ser `true`, cualquier
--    usuario autenticado podía insertar. Se alinea WITH CHECK con el USING.
-- --------------------------------------------------------------------

-- Tesorería: config de cápitas (solo tesorero/secretario/master)
drop policy if exists capita_write on config_capitas;
create policy capita_write on config_capitas for all
  using (mi_rol() in ('tesorero','secretario','master'))
  with check (mi_rol() in ('tesorero','secretario','master'));

-- Tesorería: pagos (solo tesorero/secretario/master)
drop policy if exists pagos_write on pagos;
create policy pagos_write on pagos for all
  using (mi_rol() in ('tesorero','secretario','master'))
  with check (mi_rol() in ('tesorero','secretario','master'));

-- Tenidas: solo administradores
drop policy if exists tenidas_write on tenidas;
create policy tenidas_write on tenidas for all
  using (es_admin())
  with check (es_admin());

-- Asistencias: solo administradores
drop policy if exists asis_write on asistencias;
create policy asis_write on asistencias for all
  using (es_admin())
  with check (es_admin());

-- --------------------------------------------------------------------
-- 2) FUNCIONES AUXILIARES DE RLS: fijar search_path (lint 0011).
--    Se recrean idénticas + `set search_path = public`. mi_logia/mi_rol/
--    mi_grado son SECURITY DEFINER (evitan recursión de RLS sobre perfiles).
-- --------------------------------------------------------------------
create or replace function mi_logia() returns uuid
  language sql stable security definer set search_path = public as $$
  select logia_id from perfiles where id = auth.uid()
$$;

create or replace function mi_rol() returns rol_t
  language sql stable security definer set search_path = public as $$
  select rol from perfiles where id = auth.uid()
$$;

create or replace function mi_grado() returns grado_t
  language sql stable security definer set search_path = public as $$
  select grado from perfiles where id = auth.uid()
$$;

create or replace function es_admin() returns boolean
  language sql stable set search_path = public as $$
  select mi_rol() in ('secretario','gran_secretario','master')
$$;

create or replace function es_global() returns boolean
  language sql stable set search_path = public as $$
  select mi_rol() in ('gran_secretario','master')
$$;

create or replace function nivel(g grado_t) returns int
  language sql immutable set search_path = public as $$
  select case g when 'aprendiz' then 1 when 'companero' then 2 when 'maestro' then 3 else 0 end
$$;

-- --------------------------------------------------------------------
-- 3) EXECUTE de funciones SECURITY DEFINER: revocar explícitamente y
--    conceder solo al rol que corresponde.
-- --------------------------------------------------------------------

-- 3a) Funciones-trigger: NO deben ser invocables por API (se disparan solas).
revoke all on function handle_new_user() from public, anon, authenticated;
revoke all on function perfiles_no_escalar() from public, anon, authenticated;

-- 3b) verificar_acceso: oráculo de contraseñas (general + logia), SIN guard
--     interno. Solo se llama server-side con service_role (alta de registro).
--     Exponerlo a anon permitiría fuerza bruta de palabras clave.
revoke all on function verificar_acceso(text, uuid, text) from public, anon, authenticated;
grant execute on function verificar_acceso(text, uuid, text) to service_role;

-- 3c) RPCs de negocio: guard por rol/uid DENTRO de la función; las llama la app
--     con sesión autenticada. Se retira anon; se mantiene solo authenticated.
revoke all on function set_palabra_logia(uuid, text) from public, anon, authenticated;
grant execute on function set_palabra_logia(uuid, text) to authenticated;

revoke all on function estadisticas_salud(uuid) from public, anon, authenticated;
grant execute on function estadisticas_salud(uuid) to authenticated;

revoke all on function set_inicio_capita(uuid, date) from public, anon, authenticated;
grant execute on function set_inicio_capita(uuid, date) to authenticated;

revoke all on function marcar_mensajes_leidos(uuid) from public, anon, authenticated;
grant execute on function marcar_mensajes_leidos(uuid) to authenticated;

revoke all on function marcar_eventos_vistos() from public, anon, authenticated;
grant execute on function marcar_eventos_vistos() to authenticated;

revoke all on function contar_eventos_nuevos() from public, anon, authenticated;
grant execute on function contar_eventos_nuevos() to authenticated;

-- 3d) Helpers de RLS (mi_logia/mi_rol/mi_grado): la RLS los evalúa como el rol
--     que consulta. El acceso real de datos ocurre autenticado; ninguna consulta
--     en contexto anónimo evalúa políticas que los invoquen (register lee
--     `logias` con política `using(true)`). Se retira anon; se mantiene
--     authenticated (imprescindible para la RLS).
revoke all on function mi_logia() from public, anon, authenticated;
grant execute on function mi_logia() to authenticated;

revoke all on function mi_rol() from public, anon, authenticated;
grant execute on function mi_rol() to authenticated;

revoke all on function mi_grado() from public, anon, authenticated;
grant execute on function mi_grado() to authenticated;

-- es_admin/es_global/nivel son SECURITY INVOKER y las evalúa la RLS como el rol
-- que consulta; se retira anon por coherencia y se mantiene authenticated.
revoke all on function es_admin() from public, anon, authenticated;
grant execute on function es_admin() to authenticated;

revoke all on function es_global() from public, anon, authenticated;
grant execute on function es_global() to authenticated;

revoke all on function nivel(grado_t) from public, anon, authenticated;
grant execute on function nivel(grado_t) to authenticated;
