-- Gestión de logias por el admin global: número único, edición de datos básicos y ciclo de vida
-- (activar/desactivar). Sigue el patrón de crear_logia: autorización DENTRO de la función
-- (es_global()) respaldada por RLS logias_admin; RPC security definer con search_path fijo.
--
-- NOTA (verificación previa, tarea 1.1): la restricción única de `numero` falla si el entorno ya
-- tiene números repetidos. La semilla (supabase/seed.sql) usa 12/27/5, sin duplicados. En entornos
-- con datos previos, ejecutar antes:
--   select numero, count(*) from logias group by numero having count(*) > 1;
-- y resolver los duplicados manualmente.

-- ============ 1) Número de logia único ============
-- La restricción crea su índice único implícito; no se añade índice adicional.
alter table logias add constraint logias_numero_unico unique (numero);

-- ============ 2) crear_logia: valida número único (además de los campos obligatorios) ============
create or replace function crear_logia(p_nombre text, p_numero integer, p_oriente text, p_clave text)
  returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not es_global() then raise exception 'No autorizado para crear logias'; end if;
  if coalesce(btrim(p_nombre), '') = '' or coalesce(btrim(p_oriente), '') = ''
     or coalesce(btrim(p_clave), '') = '' or p_numero is null then
    raise exception 'Datos de logia incompletos';
  end if;
  if exists (select 1 from logias where numero = p_numero) then
    raise exception 'El número de logia % ya está en uso', p_numero using errcode = 'unique_violation';
  end if;
  insert into logias (nombre, numero, oriente, palabra_clave)
    values (btrim(p_nombre), p_numero, btrim(p_oriente),
            extensions.crypt(lower(btrim(p_clave)), extensions.gen_salt('bf', 10)))
    returning id into v_id;
  return v_id;
end $$;

-- ============ 3) editar_logia: datos básicos (NO toca palabra_clave) ============
create or replace function editar_logia(p_id uuid, p_nombre text, p_numero integer, p_oriente text)
  returns void language plpgsql security definer set search_path = public as $$
begin
  if not es_global() then raise exception 'No autorizado para editar logias'; end if;
  if coalesce(btrim(p_nombre), '') = '' or coalesce(btrim(p_oriente), '') = '' or p_numero is null then
    raise exception 'Datos de logia incompletos';
  end if;
  -- Número único: permitido conservar el propio; rechazado si lo usa OTRA logia.
  if exists (select 1 from logias where numero = p_numero and id <> p_id) then
    raise exception 'El número de logia % ya está en uso', p_numero using errcode = 'unique_violation';
  end if;
  update logias set nombre = btrim(p_nombre), numero = p_numero, oriente = btrim(p_oriente)
    where id = p_id;
end $$;

-- ============ 4) set_estado_logia: ciclo de vida (activa/inactiva) ============
create or replace function set_estado_logia(p_id uuid, p_estado text)
  returns void language plpgsql security definer set search_path = public as $$
begin
  if not es_global() then raise exception 'No autorizado para cambiar el estado de una logia'; end if;
  if p_estado not in ('activa', 'inactiva') then
    raise exception 'Estado de logia inválido: %', p_estado;
  end if;
  update logias set estado = p_estado where id = p_id;
end $$;

-- ============ 5) Grants: solo authenticated; el guard es_global() controla el acceso ============
revoke all on function editar_logia(uuid, text, integer, text) from public, anon, authenticated;
grant execute on function editar_logia(uuid, text, integer, text) to authenticated;
revoke all on function set_estado_logia(uuid, text) from public, anon, authenticated;
grant execute on function set_estado_logia(uuid, text) to authenticated;
