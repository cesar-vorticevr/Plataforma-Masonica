-- #8 Endurecimiento: hashing (bcrypt cost>=10), grants, e RLS a escala.
-- Recrea las 30 políticas de public con `to authenticated` y envolviendo las funciones auxiliares
-- en (select fn()) para que se evalúen una vez por consulta (initPlan), preservando los predicados
-- VERBATIM (misma semántica). Añade índices en columnas de RLS/FK.

-- ============ 1) Hashing con cost >= 10 ============
create or replace function set_palabra_logia(p_logia uuid, p_clave text)
  returns void language plpgsql security definer set search_path = public as $$
begin
  if not (es_global() or (es_admin() and p_logia = mi_logia())) then
    raise exception 'No autorizado para cambiar la palabra clave de esta logia';
  end if;
  update logias set palabra_clave = extensions.crypt(lower(trim(p_clave)), extensions.gen_salt('bf', 10)) where id = p_logia;
end $$;

create or replace function crear_logia(p_nombre text, p_numero integer, p_oriente text, p_clave text)
  returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not es_global() then raise exception 'No autorizado para crear logias'; end if;
  if coalesce(btrim(p_nombre), '') = '' or coalesce(btrim(p_oriente), '') = ''
     or coalesce(btrim(p_clave), '') = '' or p_numero is null then
    raise exception 'Datos de logia incompletos';
  end if;
  insert into logias (nombre, numero, oriente, palabra_clave)
    values (btrim(p_nombre), p_numero, btrim(p_oriente),
            extensions.crypt(lower(btrim(p_clave)), extensions.gen_salt('bf', 10)))
    returning id into v_id;
  return v_id;
end $$;

-- ============ 2) Grant mínimo del trigger anti-autoescalada ============
revoke all on function perfiles_no_autoescalada() from public, anon, authenticated;

-- ============ 3) Índices en columnas de RLS / FK ============
create index if not exists idx_perfiles_logia on perfiles(logia_id);
create index if not exists idx_eventos_logia on eventos(logia_id);
create index if not exists idx_trabajos_logia on trabajos(logia_id);
create index if not exists idx_trabajos_usuario on trabajos(usuario_id);
create index if not exists idx_tenidas_logia on tenidas(logia_id);
create index if not exists idx_correspondencia_delogia on correspondencia(de_logia_id);
create index if not exists idx_msg_de on mensajes_profesionales(de_usuario_id);
create index if not exists idx_msg_a on mensajes_profesionales(a_usuario_id);
create index if not exists idx_buzon_logia on buzon_documentos(logia_id);

-- ============ 4) Recrear las 30 políticas: to authenticated + (select fn()) ============

-- asistencias
drop policy if exists asis_read on asistencias;
create policy asis_read on asistencias for select to authenticated using (
  ((usuario_id = (select auth.uid())) and ((select mi_estado()) = 'validado'::estado_t))
  or (select es_global())
  or ((select es_admin()) and exists (select 1 from tenidas t where t.id = asistencias.tenida_id and t.logia_id = (select mi_logia())))
);
drop policy if exists asis_write on asistencias;
create policy asis_write on asistencias for all to authenticated
  using ((select mi_rol()) = 'master'::rol_t or (((select mi_rol()) = 'secretario'::rol_t) and exists (select 1 from tenidas t where t.id = asistencias.tenida_id and t.logia_id = (select mi_logia()))))
  with check ((select mi_rol()) = 'master'::rol_t or (((select mi_rol()) = 'secretario'::rol_t) and exists (select 1 from tenidas t where t.id = asistencias.tenida_id and t.logia_id = (select mi_logia()))));

-- auditoria
drop policy if exists auditoria_read on auditoria;
create policy auditoria_read on auditoria for select to authenticated using ((select mi_rol()) = 'master'::rol_t);

-- buzon_documentos
drop policy if exists buzon_del on buzon_documentos;
create policy buzon_del on buzon_documentos for delete to authenticated
  using ((select es_admin()) and ((select es_global()) or logia_id = (select mi_logia())));
drop policy if exists buzon_ins on buzon_documentos;
create policy buzon_ins on buzon_documentos for insert to authenticated
  with check ((select es_admin()) and ((select es_global()) or logia_id = (select mi_logia()) or logia_id is null));
drop policy if exists buzon_read on buzon_documentos;
create policy buzon_read on buzon_documentos for select to authenticated
  using ((select es_admin()) and (alcance = 'global'::text or (select es_global()) or logia_id = (select mi_logia())));
drop policy if exists buzon_upd on buzon_documentos;
create policy buzon_upd on buzon_documentos for update to authenticated
  using ((select es_admin()) and ((select es_global()) or logia_id = (select mi_logia())))
  with check ((select es_admin()) and ((select es_global()) or logia_id = (select mi_logia()) or logia_id is null));

-- config_capitas
drop policy if exists capita_read on config_capitas;
create policy capita_read on config_capitas for select to authenticated
  using (logia_id = (select mi_logia()) or (select mi_rol()) = 'master'::rol_t);
drop policy if exists capita_write on config_capitas;
create policy capita_write on config_capitas for all to authenticated
  using ((select mi_rol()) = 'master'::rol_t or ((select mi_rol()) = any(array['tesorero'::rol_t,'secretario'::rol_t]) and logia_id = (select mi_logia())))
  with check ((select mi_rol()) = 'master'::rol_t or ((select mi_rol()) = any(array['tesorero'::rol_t,'secretario'::rol_t]) and logia_id = (select mi_logia())));

-- consentimientos
drop policy if exists consent_rw on consentimientos;
create policy consent_rw on consentimientos for all to authenticated
  using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));

-- correspondencia
drop policy if exists corr_read on correspondencia;
create policy corr_read on correspondencia for select to authenticated
  using ((select es_admin()) and (de_logia_id = (select mi_logia()) or (select mi_logia()) = any(destinatarios_logia_ids) or (select es_global())));
drop policy if exists corr_write on correspondencia;
create policy corr_write on correspondencia for insert to authenticated
  with check ((select es_admin()) and de_logia_id = (select mi_logia()) and autor_id = (select auth.uid()));

-- evaluaciones_salud
drop policy if exists salud_owner on evaluaciones_salud;
create policy salud_owner on evaluaciones_salud for all to authenticated
  using (usuario_id = (select auth.uid()) and (select mi_estado()) <> 'bloqueado'::estado_t)
  with check (usuario_id = (select auth.uid()) and (select mi_estado()) <> 'bloqueado'::estado_t);

-- eventos
drop policy if exists eventos_read on eventos;
create policy eventos_read on eventos for select to authenticated
  using (((alcance = 'global'::alcance_t) or (logia_id = (select mi_logia()))) and (select mi_estado()) = 'validado'::estado_t);
drop policy if exists eventos_write on eventos;
create policy eventos_write on eventos for all to authenticated
  using ((select es_global()) or ((select es_admin()) and logia_id = (select mi_logia())))
  with check ((select es_global()) or (((select mi_rol()) = 'secretario'::rol_t) and alcance = 'logia'::alcance_t and logia_id = (select mi_logia())));

-- generales
drop policy if exists generales_rw on generales;
create policy generales_rw on generales for all to authenticated
  using (((usuario_id = (select auth.uid())) and (select mi_estado()) <> 'bloqueado'::estado_t)
         or (select es_master())
         or ((select es_admin()) and exists (select 1 from perfiles p where p.id = generales.usuario_id and p.logia_id = (select mi_logia()))))
  with check ((usuario_id = (select auth.uid())) and (select mi_estado()) <> 'bloqueado'::estado_t);

-- logias
drop policy if exists logias_admin on logias;
create policy logias_admin on logias for all to authenticated using ((select es_global())) with check ((select es_global()));
drop policy if exists logias_read on logias;
create policy logias_read on logias for select to authenticated using (true);

-- mensajes_profesionales
drop policy if exists msg_rw on mensajes_profesionales;
create policy msg_rw on mensajes_profesionales for all to authenticated
  using (((de_usuario_id = (select auth.uid())) or (a_usuario_id = (select auth.uid()))) and (select mi_estado()) = 'validado'::estado_t)
  with check ((de_usuario_id = (select auth.uid())) and (select mi_estado()) = 'validado'::estado_t);

-- pagos
drop policy if exists pagos_read on pagos;
create policy pagos_read on pagos for select to authenticated
  using (((usuario_id = (select auth.uid())) and (select mi_estado()) = 'validado'::estado_t)
         or (select mi_rol()) = 'master'::rol_t
         or ((select mi_rol()) = any(array['tesorero'::rol_t,'secretario'::rol_t]) and exists (select 1 from perfiles p where p.id = pagos.usuario_id and p.logia_id = (select mi_logia()))));
drop policy if exists pagos_write on pagos;
create policy pagos_write on pagos for all to authenticated
  using ((select mi_rol()) = 'master'::rol_t or ((select mi_rol()) = any(array['tesorero'::rol_t,'secretario'::rol_t]) and exists (select 1 from perfiles p where p.id = pagos.usuario_id and p.logia_id = (select mi_logia()))))
  with check ((select mi_rol()) = 'master'::rol_t or ((select mi_rol()) = any(array['tesorero'::rol_t,'secretario'::rol_t]) and exists (select 1 from perfiles p where p.id = pagos.usuario_id and p.logia_id = (select mi_logia()))));

-- perfiles
drop policy if exists perfiles_admin on perfiles;
create policy perfiles_admin on perfiles for update to authenticated
  using ((select es_global()) or ((select es_admin()) and logia_id = (select mi_logia())))
  with check ((select es_global()) or ((select es_admin()) and logia_id = (select mi_logia()) and rol = any(array['hermano'::rol_t,'tesorero'::rol_t])));
drop policy if exists perfiles_self on perfiles;
create policy perfiles_self on perfiles for select to authenticated
  using ((id = (select auth.uid())) or (select es_global()) or ((select es_admin()) and logia_id = (select mi_logia())) or (((select mi_rol()) = 'tesorero'::rol_t) and logia_id = (select mi_logia())));
drop policy if exists perfiles_update_self on perfiles;
create policy perfiles_update_self on perfiles for update to authenticated using (id = (select auth.uid()));

-- perfiles_profesionales
drop policy if exists prof_read on perfiles_profesionales;
create policy prof_read on perfiles_profesionales for select to authenticated
  using ((mostrar_en_directorio and (select mi_estado()) = 'validado'::estado_t) or (usuario_id = (select auth.uid())));
drop policy if exists prof_write on perfiles_profesionales;
create policy prof_write on perfiles_profesionales for all to authenticated
  using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));

-- tenidas
drop policy if exists tenidas_read on tenidas;
create policy tenidas_read on tenidas for select to authenticated
  using (((logia_id = (select mi_logia())) or (select es_global())) and (select mi_estado()) = 'validado'::estado_t);
drop policy if exists tenidas_write on tenidas;
create policy tenidas_write on tenidas for all to authenticated
  using ((select mi_rol()) = 'master'::rol_t or (((select mi_rol()) = 'secretario'::rol_t) and logia_id = (select mi_logia())))
  with check ((select mi_rol()) = 'master'::rol_t or (((select mi_rol()) = 'secretario'::rol_t) and logia_id = (select mi_logia())));

-- trabajos
drop policy if exists trabajos_read on trabajos;
create policy trabajos_read on trabajos for select to authenticated
  using (((select mi_rol()) = any(array['master'::rol_t,'gran_secretario'::rol_t]))
         or (logia_id = (select mi_logia()) and nivel(camara) <= nivel((select mi_grado())) and (select mi_estado()) = 'validado'::estado_t));
drop policy if exists trabajos_write on trabajos;
create policy trabajos_write on trabajos for insert to authenticated
  with check ((usuario_id = (select auth.uid())) and nivel(camara) <= nivel((select mi_grado())));
