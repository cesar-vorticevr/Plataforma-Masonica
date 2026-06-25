-- ====================================================================
-- Correspondencia: adjuntos en Storage (bucket privado, visibilidad dirigida)
-- + endurecimiento de la RLS de inserción de la tabla.
-- ====================================================================

-- Bucket privado (descarga por URL firmada).
insert into storage.buckets (id, name, public)
values ('correspondencia', 'correspondencia', false)
on conflict (id) do nothing;

-- RLS de storage.objects: el objeto vive bajo `${corrId}/...`; el acceso refleja
-- la visibilidad de la fila correspondiente. La subconsulta respeta la RLS de
-- `correspondencia` (políticas no security definer), así que solo "ve" filas
-- accesibles al usuario (emisor / destinatario / global).
drop policy if exists corr_obj_select on storage.objects;
create policy corr_obj_select on storage.objects for select
  using (
    bucket_id = 'correspondencia' and es_admin()
    and exists (
      select 1 from correspondencia c
      where c.id = (split_part(name, '/', 1))::uuid
    )
  );

drop policy if exists corr_obj_insert on storage.objects;
create policy corr_obj_insert on storage.objects for insert
  with check (
    bucket_id = 'correspondencia' and es_admin()
    and exists (
      select 1 from correspondencia c
      where c.id = (split_part(name, '/', 1))::uuid
        and c.de_logia_id = mi_logia()
    )
  );

-- Endurecer inserción en la tabla: no falsear autor ni logia emisora.
drop policy if exists corr_write on correspondencia;
create policy corr_write on correspondencia for insert
  with check (es_admin() and de_logia_id = mi_logia() and autor_id = auth.uid());
