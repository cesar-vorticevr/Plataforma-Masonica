## Context

`perfiles_update_self` permite `UPDATE` sobre la propia fila (`id = auth.uid()`) sin `WITH CHECK`.
En Postgres, una política sin `WITH CHECK` usa su `USING` como check, así que el dueño puede escribir
cualquier columna, incluidos `rol`/`estado`/`logia_id`/`grado`. La app no hace self-update de
`perfiles` (verificado por grep), pero la API queda expuesta.

RLS no puede comparar OLD vs NEW, así que un `with_check` no distingue "no cambiaste el rol". La
herramienta correcta es un trigger `BEFORE UPDATE`.

## Goals / Non-Goals

**Goals:**
- Bloquear que el dueño cambie campos sensibles de su propio perfil.
- No romper: registro (service-role), semilla (postgres), gestión por administradores, ni futuras
  auto-ediciones de campos no sensibles.

**Non-Goals:**
- Eliminar `perfiles_update_self`.
- Rediseñar la gestión administrativa de perfiles (ya endurecida en `admin-designar-secretario`).

## Decisions

### Trigger acotado al "dueño editándose"
```sql
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

create trigger trg_perfiles_no_autoescalada
  before update on perfiles
  for each row execute function perfiles_no_autoescalada();
```
- `auth.uid() = old.id`: solo cuando el dueño edita su propia fila. `service_role`/`postgres` tienen
  `auth.uid()` nulo → no entran (no rompe registro ni semilla).
- `not es_global()`: un Master/Gran Secretario que se edite a sí mismo no se bloquea.
- Admin editando a otro (`auth.uid() ≠ old.id`) → no entra; lo gobierna `perfiles_admin`.
- Campos no sensibles (p. ej. `foto`) → no disparan la excepción.

*Alternativa considerada:* eliminar `perfiles_update_self`. Se descarta para conservar la posibilidad
de editar campos no sensibles del propio perfil más adelante; el trigger es más preciso y explícito.

## Risks / Trade-offs

- [Un futuro flujo legítimo necesitara que el dueño cambie alguno de esos campos] → Poco probable
  (rol/estado/logia/grado son atribuciones administrativas por diseño). Si surgiera, se haría vía RPC
  `security definer` con la regla adecuada.
- [Doble control con `perfiles_admin`] → Es intencional (defensa en profundidad); no hay conflicto:
  ambos deben permitir para que la operación pase.

## Migration Plan

1. Crear la migración con la función + trigger.
2. `npx supabase migration up --local` sin borrar datos.
3. Deploy.

Rollback: `drop trigger trg_perfiles_no_autoescalada on perfiles; drop function perfiles_no_autoescalada();`

**Seguridad:** cierra la auto-escalada; complementa el `with_check` de `perfiles_admin`.
**Modelo de datos:** sin cambios de forma. **DESIGN.md:** no aplica (sin UI).

## Open Questions

Ninguna.
