-- ====================================================================
-- Endurecer aislamiento por logia en tenidas/asistencias.
-- Antes: es_admin() sin acotar -> un secretario podía operar sobre otra logia.
-- Ahora: el administrador queda acotado a su logia (master/gran secretario: es_global).
-- ====================================================================

drop policy if exists tenidas_write on tenidas;
create policy tenidas_write on tenidas for all
  using (es_global() or (es_admin() and logia_id = mi_logia()))
  with check (es_global() or (es_admin() and logia_id = mi_logia()));

drop policy if exists asis_read on asistencias;
create policy asis_read on asistencias for select using (
  usuario_id = auth.uid()
  or es_global()
  or (es_admin() and exists (
    select 1 from tenidas t where t.id = asistencias.tenida_id and t.logia_id = mi_logia()
  ))
);

drop policy if exists asis_write on asistencias;
create policy asis_write on asistencias for all
  using (es_global() or (es_admin() and exists (
    select 1 from tenidas t where t.id = asistencias.tenida_id and t.logia_id = mi_logia()
  )))
  with check (es_global() or (es_admin() and exists (
    select 1 from tenidas t where t.id = asistencias.tenida_id and t.logia_id = mi_logia()
  )));
