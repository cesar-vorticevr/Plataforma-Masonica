-- ====================================================================
-- Endurecer la publicación de eventos por rol/logia.
-- Antes: es_admin() sin acotar -> un secretario podía publicar global o en otra logia.
-- Ahora: secretario solo su logia (alcance 'logia'); gran secretario/master (es_global): cualquiera/global.
-- (eventos_read ya está acotado: alcance='global' or logia_id=mi_logia().)
-- ====================================================================

drop policy if exists eventos_write on eventos;
create policy eventos_write on eventos for all
  using (es_global() or (es_admin() and logia_id = mi_logia()))
  with check (
    es_global()
    or (mi_rol() = 'secretario' and alcance = 'logia' and logia_id = mi_logia())
  );
