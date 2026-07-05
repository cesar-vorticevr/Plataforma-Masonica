-- Enforcement del estado de cuenta (pendiente/validado/bloqueado) en el SERVIDOR.
-- Hasta ahora el estado solo se aplicaba en la UI. Se añade mi_estado() y se acota:
--   * módulos "solo validados" (directorio, mensajería, eventos, trabajos, tenidas, cumplimientos)
--     exigen estado='validado';
--   * Generales/Salud del dueño exigen estado <> 'bloqueado' (un pendiente sí puede llenarlas).

create or replace function mi_estado() returns estado_t
  language sql stable security definer set search_path = public as $$
  select estado from perfiles where id = auth.uid()
$$;
revoke all on function mi_estado() from public, anon, authenticated;
grant execute on function mi_estado() to authenticated;

-- Directorio: el directorio de otros exige validado; el dueño siempre ve/edita su propio perfil.
drop policy if exists prof_read on perfiles_profesionales;
create policy prof_read on perfiles_profesionales for select
  using ((mostrar_en_directorio and mi_estado() = 'validado') or usuario_id = auth.uid());

-- Mensajería: solo validados
drop policy if exists msg_rw on mensajes_profesionales;
create policy msg_rw on mensajes_profesionales for all
  using (((de_usuario_id = auth.uid()) or (a_usuario_id = auth.uid())) and mi_estado() = 'validado')
  with check ((de_usuario_id = auth.uid()) and mi_estado() = 'validado');

-- Eventos: solo validados
drop policy if exists eventos_read on eventos;
create policy eventos_read on eventos for select
  using ((alcance = 'global'::alcance_t or logia_id = mi_logia()) and mi_estado() = 'validado');

-- Trabajos: defensa explícita por estado (además de cámara/logia)
drop policy if exists trabajos_read on trabajos;
create policy trabajos_read on trabajos for select
  using (logia_id = mi_logia() and nivel(camara) <= nivel(mi_grado()) and mi_estado() = 'validado');

-- Tenidas: lectura solo validados
drop policy if exists tenidas_read on tenidas;
create policy tenidas_read on tenidas for select
  using ((logia_id = mi_logia() or es_global()) and mi_estado() = 'validado');

-- Cumplimientos: la rama del dueño exige validado (las ramas admin no cambian)
drop policy if exists pagos_read on pagos;
create policy pagos_read on pagos for select
  using (
    (usuario_id = auth.uid() and mi_estado() = 'validado')
    or mi_rol() = 'master'
    or (mi_rol() in ('tesorero','secretario')
        and exists (select 1 from perfiles p where p.id = pagos.usuario_id and p.logia_id = mi_logia()))
  );

drop policy if exists asis_read on asistencias;
create policy asis_read on asistencias for select
  using (
    (usuario_id = auth.uid() and mi_estado() = 'validado')
    or es_global()
    or (es_admin() and exists (select 1 from tenidas t where t.id = asistencias.tenida_id and t.logia_id = mi_logia()))
  );

-- Generales y Salud del dueño: un bloqueado pierde acceso; un pendiente conserva (solo estos módulos).
drop policy if exists generales_rw on generales;
create policy generales_rw on generales for all
  using (
    (usuario_id = auth.uid() and mi_estado() <> 'bloqueado')
    or es_global()
    or (es_admin() and exists (select 1 from perfiles p where p.id = generales.usuario_id and p.logia_id = mi_logia()))
  )
  with check (usuario_id = auth.uid() and mi_estado() <> 'bloqueado');

drop policy if exists salud_owner on evaluaciones_salud;
create policy salud_owner on evaluaciones_salud for all
  using (usuario_id = auth.uid() and mi_estado() <> 'bloqueado')
  with check (usuario_id = auth.uid() and mi_estado() <> 'bloqueado');
