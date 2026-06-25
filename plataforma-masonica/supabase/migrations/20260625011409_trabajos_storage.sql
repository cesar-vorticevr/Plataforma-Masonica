-- ====================================================================
-- Trabajos por cámara: archivos en Storage (bucket privado, visibilidad
-- jerárquica por grado) + columnas de apoyo (nombre de archivo y autor).
-- ====================================================================

alter table trabajos add column if not exists archivo_nombre text;
alter table trabajos add column if not exists autor_nombre text;

-- Bucket privado (descarga por URL firmada).
insert into storage.buckets (id, name, public)
values ('trabajos', 'trabajos', false)
on conflict (id) do nothing;

-- RLS de storage.objects: el objeto vive bajo `${trabajoId}/...`; el acceso
-- refleja la visibilidad de la fila. La subconsulta respeta la RLS de `trabajos`
-- (políticas no security definer), así que solo "ve" filas accesibles al usuario
-- (misma logia y nivel(camara) <= nivel(mi_grado())).
drop policy if exists trabajos_obj_select on storage.objects;
create policy trabajos_obj_select on storage.objects for select
  using (
    bucket_id = 'trabajos'
    and exists (
      select 1 from trabajos t
      where t.id = (split_part(name, '/', 1))::uuid
    )
  );

drop policy if exists trabajos_obj_insert on storage.objects;
create policy trabajos_obj_insert on storage.objects for insert
  with check (
    bucket_id = 'trabajos'
    and exists (
      select 1 from trabajos t
      where t.id = (split_part(name, '/', 1))::uuid
        and t.usuario_id = auth.uid()
    )
  );
