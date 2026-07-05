-- Aislamiento por logia en las políticas de ESCRITURA de tesorería y tenidas.
-- Las políticas de lectura ya acotan por logia; las de escritura (ALL) no lo hacían:
--   pagos_write/capita_write = mi_rol() in (tesorero,secretario,master)  (sin logia)
--   tenidas_write/asis_write = es_admin()                                (sin logia)
-- Esto permitía escritura cross-logia (regresión de 20260703212617). Se recrean con logia,
-- coherente con la matriz §4.2 (Tesorero=Logia, Secretario=Logia, Master=Sí; tenidas/asistencias
-- solo Secretario de su logia + Master; sin escritura para tesorero ni Gran Secretario).
-- Se usa mi_rol()='master' (no es_global()) para NO conceder escritura al Gran Secretario (Agreg).

-- pagos: espejo de pagos_read (el usuario del pago debe ser de mi logia)
drop policy if exists pagos_write on pagos;
create policy pagos_write on pagos for all
  using (
    mi_rol() = 'master'
    or (mi_rol() in ('tesorero','secretario')
        and exists (select 1 from perfiles p where p.id = pagos.usuario_id and p.logia_id = mi_logia()))
  )
  with check (
    mi_rol() = 'master'
    or (mi_rol() in ('tesorero','secretario')
        and exists (select 1 from perfiles p where p.id = pagos.usuario_id and p.logia_id = mi_logia()))
  );

-- config_capitas: acotada por logia_id
drop policy if exists capita_write on config_capitas;
create policy capita_write on config_capitas for all
  using (mi_rol() = 'master' or (mi_rol() in ('tesorero','secretario') and logia_id = mi_logia()))
  with check (mi_rol() = 'master' or (mi_rol() in ('tesorero','secretario') and logia_id = mi_logia()));

-- tenidas: solo secretario de su logia + master
drop policy if exists tenidas_write on tenidas;
create policy tenidas_write on tenidas for all
  using (mi_rol() = 'master' or (mi_rol() = 'secretario' and logia_id = mi_logia()))
  with check (mi_rol() = 'master' or (mi_rol() = 'secretario' and logia_id = mi_logia()));

-- asistencias: la tenida debe pertenecer a mi logia
drop policy if exists asis_write on asistencias;
create policy asis_write on asistencias for all
  using (
    mi_rol() = 'master'
    or (mi_rol() = 'secretario'
        and exists (select 1 from tenidas t where t.id = asistencias.tenida_id and t.logia_id = mi_logia()))
  )
  with check (
    mi_rol() = 'master'
    or (mi_rol() = 'secretario'
        and exists (select 1 from tenidas t where t.id = asistencias.tenida_id and t.logia_id = mi_logia()))
  );
