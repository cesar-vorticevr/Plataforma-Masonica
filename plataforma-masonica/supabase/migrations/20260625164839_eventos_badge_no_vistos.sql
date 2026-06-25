-- Badge de eventos no vistos: marca de "último visto" por hermano + conteo de eventos nuevos.

-- Marca temporal de la última visita a la sección Eventos (por hermano).
alter table perfiles add column if not exists eventos_vistos_at timestamptz;

-- Marca todos los eventos como vistos para el usuario actual (al abrir /eventos).
-- security definer: fija SOLO esta columna; no toca rol/estado/grado/logia (no dispara el
-- trigger anti-escalada). Hardcodea id = auth.uid().
create or replace function marcar_eventos_vistos()
  returns void language plpgsql security definer set search_path = public as $$
begin
  update perfiles set eventos_vistos_at = now() where id = auth.uid();
end $$;
revoke all on function marcar_eventos_vistos() from public;
grant execute on function marcar_eventos_vistos() to authenticated;

-- Cuenta los eventos visibles para el hermano publicados después de su último visto.
-- security invoker (default): la RLS de `eventos` (eventos_read = global + de su logia) filtra
-- la visibilidad; el subselect a perfiles usa perfiles_self (fila propia). Si nunca visitó la
-- sección, eventos_vistos_at es null y se cuentan todos los visibles.
create or replace function contar_eventos_nuevos()
  returns integer language sql stable set search_path = public as $$
  select count(*)::int
  from eventos
  where created_at > coalesce(
    (select eventos_vistos_at from perfiles where id = auth.uid()),
    'epoch'::timestamptz
  );
$$;
revoke all on function contar_eventos_nuevos() from public;
grant execute on function contar_eventos_nuevos() to authenticated;
