-- ====================================================================
-- Buzón interlogial: bucket privado de Storage + RLS (solo administradores).
-- ====================================================================

-- Bucket privado (la descarga se hace con URL firmada, no pública).
insert into storage.buckets (id, name, public)
values ('buzon', 'buzon', false)
on conflict (id) do nothing;

-- Políticas de storage.objects para el bucket 'buzon': solo administradores.
drop policy if exists buzon_obj_select on storage.objects;
create policy buzon_obj_select on storage.objects for select
  using (bucket_id = 'buzon' and es_admin());

drop policy if exists buzon_obj_insert on storage.objects;
create policy buzon_obj_insert on storage.objects for insert
  with check (bucket_id = 'buzon' and es_admin());

drop policy if exists buzon_obj_delete on storage.objects;
create policy buzon_obj_delete on storage.objects for delete
  using (bucket_id = 'buzon' and es_admin());
