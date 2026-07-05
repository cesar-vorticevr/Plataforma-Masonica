## Context

El rol de secretario se representa como `perfiles.rol = 'secretario'` acotado a una logia por
`perfiles.logia_id`; no hay `logias.secretario_id`. Las funciones RLS (`mi_rol()`, `mi_logia()`,
`es_admin()`, `es_global()`) se apoyan en eso. Por tanto "designar secretario" = promover a un
miembro validado de una logia a `rol='secretario'`.

Autorización según la especificación (§4.1, §4.2, §5.13): solo Gran Secretario y Master ("alta de
secretarios"); el propio secretario no. El glosario habla de *"su secretario"* (singular) → un
secretario por logia.

Estado actual del código: `GestionUsuario` (en `/admin`) permite validar+grado, alternar tesorero y
bloquear; `adminSetRol` solo alterna `hermano`↔`tesorero`. No hay designación de secretario.

Hueco de seguridad detectado: la política `perfiles_admin` (UPDATE) tiene `USING` pero **no**
`WITH CHECK`, así que un admin de logia puede fijar el `rol` de un perfil de su logia a cualquier
valor (incluido `secretario`/`master`) por update directo. (Aparte, `perfiles_update_self` permite a
un usuario actualizar su propia fila sin `with_check` — ver Risks.)

## Goals / Non-Goals

**Goals:**
- Que un admin global designe/quite al secretario de una logia desde `/admin`.
- Aplicar la regla "un secretario por logia" (degradar al anterior).
- Aplicar la autorización en el servidor y cerrar la escalada vía `perfiles_admin`.

**Non-Goals:**
- Designar Gran Secretario (cuenta del Master; acción aparte).
- Añadir `logias.secretario_id`.
- Rediseñar por completo la seguridad de auto-edición del perfil (`perfiles_update_self`) — se deja
  como seguimiento.

## Decisions

### 1. Designación vía RPC `security definer`, no update directo
Migración nueva:
```sql
create or replace function designar_secretario(p_usuario uuid)
  returns void language plpgsql security definer set search_path = public as $$
declare v_logia uuid; v_estado estado_usuario_t;
begin
  if not es_global() then
    raise exception 'No autorizado para designar secretarios';
  end if;
  select logia_id, estado into v_logia, v_estado from perfiles where id = p_usuario;
  if v_logia is null then
    raise exception 'El usuario no pertenece a una logia';
  end if;
  if v_estado <> 'validado' then
    raise exception 'Solo se puede designar secretario a un hermano validado';
  end if;
  -- Regla "un secretario por logia": degrada al secretario anterior de esa logia.
  update perfiles set rol = 'hermano'
    where logia_id = v_logia and rol = 'secretario' and id <> p_usuario;
  update perfiles set rol = 'secretario' where id = p_usuario;
end $$;

create or replace function quitar_secretario(p_usuario uuid)
  returns void language plpgsql security definer set search_path = public as $$
begin
  if not es_global() then
    raise exception 'No autorizado';
  end if;
  update perfiles set rol = 'hermano' where id = p_usuario and rol = 'secretario';
end $$;

revoke all on function designar_secretario(uuid) from public, anon, authenticated;
grant execute on function designar_secretario(uuid) to authenticated;
revoke all on function quitar_secretario(uuid) from public, anon, authenticated;
grant execute on function quitar_secretario(uuid) to authenticated;
```
(Se confirmará el nombre real del tipo enum de `estado` — `estado_usuario_t` o similar — contra el
esquema antes de escribir la migración.)

*Alternativa considerada:* update directo desde el cliente con RLS. Se descarta: no permite aplicar
la regla "uno por logia" de forma atómica ni impide de raíz que un no-global lo haga.

### 2. Endurecer `perfiles_admin` con `WITH CHECK`
```sql
drop policy if exists perfiles_admin on perfiles;
create policy perfiles_admin on perfiles for update
  using (es_global() or (es_admin() and logia_id = mi_logia()))
  with check (es_global() or (es_admin() and logia_id = mi_logia() and rol in ('hermano','tesorero')));
```
- Global: control total (bypass efectivo por el primer término).
- Admin de logia: solo puede dejar el `rol` en `hermano`/`tesorero` y no mover el perfil a otra logia.
- No rompe los flujos existentes: `adminValidar` (estado+grado), `adminSetEstado` (estado) y
  `adminSetRol` (tesorero↔hermano) siempre dejan `rol` en `hermano`/`tesorero`.
- La RPC `designar_secretario` es `security definer` → no la afecta el `with_check`.

### 3. UI en `GestionUsuario`, solo admin global
- Botón "Designar secretario" (si `u.rol !== 'secretario'`) / "Quitar secretario" (si lo es),
  visible solo cuando `global`.
- Reutiliza el patrón `accion(fn)` ya existente en el modal (deshabilita mientras guarda, cierra y
  refresca al terminar).

## Risks / Trade-offs

- [Escalada vía `perfiles_update_self`: un usuario puede actualizar su propia fila sin `with_check` y
  cambiar su `rol`] → **Fuera de alcance** de este cambio; se recomienda un cambio de endurecimiento
  dedicado (p. ej. `with_check` que impida auto-cambiar `rol`/`logia_id`/`estado`, o mover esos
  campos a control exclusivo por RPC/trigger). Se documenta aquí para no perderlo.
- [Degradar al secretario anterior podría sorprender] → Es la regla elegida ("uno por logia");
  la UI puede mostrar un aviso al designar si ya hay secretario. Reversible con "Designar" sobre el
  anterior.
- [Comparar `rol in ('hermano','tesorero')` en `with_check`] → El `rol` es enum; la comparación con
  literales de texto castea implícitamente. Se verificará en la migración.

## Migration Plan

1. Confirmar el nombre del enum de `estado`/`rol` contra el esquema y escribir la migración
   (RPCs + `drop/create policy perfiles_admin`).
2. `npx supabase migration up --local` sin borrar datos.
3. Deploy tras `fix-admin-carga-master`.

Rollback: `drop function designar_secretario(uuid); drop function quitar_secretario(uuid);` y
restaurar la política `perfiles_admin` sin `with_check`.

**Seguridad (servidor):** autorización en las RPC (`es_global()`) y en RLS endurecida. La UI no es la
barrera. **Privacidad:** no toca Salud; no expone datos nuevos.

**Modelo de datos:** sin cambios de forma; `rol='secretario'` ya existe en `lib/types.ts`
(`ROL_LABEL.secretario`). No hay divergencia TS/Postgres.

**DESIGN.md:** reutiliza `Button`/`Modal`; sin tokens nuevos.

## Open Questions

- ¿Se aborda el endurecimiento de `perfiles_update_self` en un cambio de seguridad aparte? (Recomendado.)
