-- #7 correspondencia-y-modelo: (1) marcar correspondencia leída por destinatarios,
-- (2) adjuntos en eventos (+ bucket/policies), (3) alcance en buzón (visibilidad por logia).

-- ---------- 1) Correspondencia: marcar leído ----------
-- RPC (no UPDATE abierto): solo destinatario/emisor/global; append idempotente de auth.uid().
create or replace function marcar_correspondencia_leida(p_id uuid)
  returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from correspondencia c
    where c.id = p_id
      and (c.de_logia_id = mi_logia() or mi_logia() = any(c.destinatarios_logia_ids) or es_global())
  ) then
    raise exception 'No autorizado';
  end if;
  update correspondencia
     set leido_por = (select array(select distinct e from unnest(coalesce(leido_por, '{}') || auth.uid()) e))
   where id = p_id;
end $$;
revoke all on function marcar_correspondencia_leida(uuid) from public, anon, authenticated;
grant execute on function marcar_correspondencia_leida(uuid) to authenticated;

-- ---------- 2) Eventos: adjuntos ----------
alter table eventos add column if not exists adjuntos jsonb not null default '[]'::jsonb;

insert into storage.buckets (id, name, public)
  values ('eventos', 'eventos', false)
  on conflict (id) do nothing;

-- Lectura: hereda la visibilidad de eventos (EXISTS respeta la RLS de la tabla eventos).
drop policy if exists eventos_obj_select on storage.objects;
create policy eventos_obj_select on storage.objects for select
  using (bucket_id = 'eventos'
         and exists (select 1 from eventos e where e.id = (split_part(objects.name, '/', 1))::uuid));
-- Alta: solo administradores (quienes publican eventos).
drop policy if exists eventos_obj_insert on storage.objects;
create policy eventos_obj_insert on storage.objects for insert
  with check (bucket_id = 'eventos' and es_admin());

-- ---------- 3) Buzón: alcance por logia ----------
alter table buzon_documentos add column if not exists alcance text not null default 'global'
  check (alcance in ('logia','global'));
alter table buzon_documentos add column if not exists logia_id uuid references logias(id) on delete cascade;

-- Reemplazar la política ALL por lectura (alcance-aware) + escritura por comando (solo admin).
drop policy if exists buzon_admin on buzon_documentos;

create policy buzon_read on buzon_documentos for select
  using (es_admin() and (alcance = 'global' or es_global() or logia_id = mi_logia()));
create policy buzon_ins on buzon_documentos for insert
  with check (es_admin() and (es_global() or logia_id = mi_logia() or logia_id is null));
create policy buzon_upd on buzon_documentos for update
  using (es_admin() and (es_global() or logia_id = mi_logia()))
  with check (es_admin() and (es_global() or logia_id = mi_logia() or logia_id is null));
create policy buzon_del on buzon_documentos for delete
  using (es_admin() and (es_global() or logia_id = mi_logia()));
