-- ====================================================================
-- Fase 1 (corte 1): config de palabra general, hash de palabras clave,
-- verificación de acceso para el registro y endurecimiento de RLS de perfiles.
-- ====================================================================

-- pgcrypto ya vive en el esquema `extensions` en Supabase; las llamadas usan extensions.crypt/gen_salt.
create extension if not exists pgcrypto with schema extensions;

-- ----------------------- CONFIG (palabra general) -------------------
-- Una sola fila. Sin políticas RLS => inaccesible por el Data API;
-- solo la leen funciones security definer (o el service_role).
create table config (
  id int primary key default 1,
  palabra_general_hash text not null,
  constraint config_singleton check (id = 1)
);
alter table config enable row level security;

-- ----------------- HASH DE PALABRAS CLAVE DE LOGIA ------------------
-- La columna pasa a guardar un hash (bcrypt vía pgcrypto), no texto plano.
alter table logias alter column palabra_clave drop default;

-- Fijar/rotar la palabra clave de una logia (hash). Solo admin competente.
create or replace function set_palabra_logia(p_logia uuid, p_clave text)
  returns void language plpgsql security definer set search_path = public as $$
begin
  if not (es_global() or (es_admin() and p_logia = mi_logia())) then
    raise exception 'No autorizado para cambiar la palabra clave de esta logia';
  end if;
  -- Normaliza (minúsculas, sin espacios): la comparación es insensible a mayúsculas.
  update logias set palabra_clave = extensions.crypt(lower(trim(p_clave)), extensions.gen_salt('bf')) where id = p_logia;
end $$;

-- ------------------- VERIFICACIÓN DE ACCESO (registro) --------------
-- Comprueba palabra general + palabra de logia sin exponer los hashes.
create or replace function verificar_acceso(p_general text, p_logia uuid, p_clave_logia text)
  returns boolean language sql security definer set search_path = public as $$
  -- Comparación insensible a mayúsculas y espacios (normaliza con lower(trim(...))).
  select
    exists (select 1 from config where palabra_general_hash = extensions.crypt(lower(trim(p_general)), palabra_general_hash))
    and exists (select 1 from logias where id = p_logia and palabra_clave = extensions.crypt(lower(trim(p_clave_logia)), palabra_clave));
$$;

-- --------- ANTI-ESCALADA: bloquear cambios de columnas privilegiadas ---------
-- Un usuario NO puede cambiar su propio rol/estado/grado/logia_id.
-- Solo: service_role (registro server-side), gran secretario/master, o el
-- secretario sobre su propia logia.
create or replace function perfiles_no_escalar() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if (new.rol      is distinct from old.rol
   or new.estado   is distinct from old.estado
   or new.grado    is distinct from old.grado
   or new.logia_id is distinct from old.logia_id) then
    if not (
         auth.role() = 'service_role'
      or es_global()
      or (es_admin() and old.logia_id = mi_logia())
    ) then
      raise exception 'No autorizado para cambiar rol, estado, grado o logia';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists perfiles_no_escalar_trg on perfiles;
create trigger perfiles_no_escalar_trg before update on perfiles
  for each row execute function perfiles_no_escalar();

-- --------- FIX: handle_new_user con search_path explícito ---------
-- El trigger corre como supabase_auth_admin (cuyo search_path no incluye public),
-- por lo que la tabla debe ir calificada y se fija search_path = public.
create or replace function handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, nombre, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'nombre', new.email), new.email);
  return new;
end $$;

-- --------- GRANTS PARA service_role ---------
-- service_role (registro server-side) salta RLS pero igual necesita privilegios de tabla.
-- La migración inicial solo concedió a anon/authenticated; aquí completamos service_role.
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
