-- Endurecimiento: impedir que el DUEÑO de un perfil cambie campos privilegiados de su propia fila.
-- La política perfiles_update_self (UPDATE using id=auth.uid()) no tiene WITH CHECK, y RLS no puede
-- comparar OLD vs NEW; por eso se usa un trigger BEFORE UPDATE. Solo aplica cuando el que edita es el
-- propio dueño (auth.uid() = old.id): service_role/postgres (auth.uid() nulo) y los administradores
-- editando a OTROS no se ven afectados; esos casos los rigen perfiles_admin / bypass de service-role.

create or replace function perfiles_no_autoescalada()
  returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() = old.id
     and not es_global()
     and ( new.rol      is distinct from old.rol
        or new.logia_id is distinct from old.logia_id
        or new.estado   is distinct from old.estado
        or new.grado    is distinct from old.grado ) then
    raise exception 'No puedes modificar tu rol, logia, estado o grado';
  end if;
  return new;
end $$;

drop trigger if exists trg_perfiles_no_autoescalada on perfiles;
create trigger trg_perfiles_no_autoescalada
  before update on perfiles
  for each row execute function perfiles_no_autoescalada();
