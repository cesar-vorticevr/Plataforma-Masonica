-- ====================================================================
-- Mensajería profesional: denormalizar nombres del interlocutor y permitir
-- al receptor marcar como leídos sus mensajes recibidos (función segura).
-- ====================================================================

alter table mensajes_profesionales add column if not exists de_nombre text;
alter table mensajes_profesionales add column if not exists a_nombre text;

-- El receptor marca como leídos los mensajes recibidos de un emisor. Necesaria
-- porque msg_rw (with check de_usuario_id = auth.uid()) impide al receptor
-- actualizar la fila. La función se acota por auth.uid() y solo cambia `leido`.
create or replace function marcar_mensajes_leidos(p_de uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update mensajes_profesionales
     set leido = true
   where a_usuario_id = auth.uid()
     and de_usuario_id = p_de
     and not leido
$$;

grant execute on function marcar_mensajes_leidos(uuid) to authenticated;
