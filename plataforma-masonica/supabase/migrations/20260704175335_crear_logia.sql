-- Alta de logias por el admin global (master / gran secretario).
-- La palabra clave se guarda como hash bcrypt (pgcrypto), igual que set_palabra_logia; nunca en
-- texto plano. La columna oriente es NOT NULL (sin default), por eso se recibe explícitamente.
-- La autorización vive DENTRO de la función (es_global()) y además RLS logias_admin la respalda.

create or replace function crear_logia(p_nombre text, p_numero int, p_oriente text, p_clave text)
  returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
begin
  if not es_global() then
    raise exception 'No autorizado para crear logias';
  end if;
  if coalesce(btrim(p_nombre), '') = '' or coalesce(btrim(p_oriente), '') = ''
     or coalesce(btrim(p_clave), '') = '' or p_numero is null then
    raise exception 'Datos de logia incompletos';
  end if;
  -- Normaliza la palabra clave (minúsculas, sin espacios) para ser consistente con verificar_acceso.
  insert into logias (nombre, numero, oriente, palabra_clave)
    values (btrim(p_nombre), p_numero, btrim(p_oriente),
            extensions.crypt(lower(btrim(p_clave)), extensions.gen_salt('bf')))
    returning id into v_id;
  return v_id;
end $$;

-- La llama la app con sesión autenticada; el guard es_global() controla el acceso. Sin anon.
revoke all on function crear_logia(text, int, text, text) from public, anon, authenticated;
grant execute on function crear_logia(text, int, text, text) to authenticated;
