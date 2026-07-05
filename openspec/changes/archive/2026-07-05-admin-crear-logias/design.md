## Context

La tabla `logias` tiene `palabra_clave text not null` y su `default` fue eliminado en la migración
`fase1_auth_identidad`; la columna guarda un **hash bcrypt** (pgcrypto), no texto plano. El
registro (`/register` → `api/registro` → `verificar_acceso`) exige que la logia exista y su hash
coincida. Ya existe el patrón `set_palabra_logia(p_logia, p_clave)` `security definer` que hashea
con `extensions.crypt(lower(trim(p_clave)), extensions.gen_salt('bf'))` y autoriza con
`es_global() or (es_admin() and p_logia = mi_logia())`, con grants restringidos a `authenticated`.

RLS `logias_admin` (`ALL` con `es_global()`) ya permitiría el `INSERT` a un admin global, pero un
`INSERT` directo desde el cliente tendría que enviar la palabra clave (y no puede hashearla de
forma confiable ni cumplir el `not null` en dos pasos). Por eso se opta por una RPC.

## Goals / Non-Goals

**Goals:**
- Permitir al admin global crear una logia con su palabra clave, hasheada en el servidor.
- Reutilizar el patrón de seguridad existente (`security definer` + `es_global()` + grants).
- Integrar la creación en `/admin` reutilizando primitivos de `DESIGN.md`.

**Non-Goals:**
- Editar/borrar logias, alta de hermanos, o cambiar `verificar_acceso`.

## Decisions

### 1. Crear la logia vía RPC `crear_logia`, no `INSERT` directo
La tabla `logias` tiene `oriente text not null` (sin default), además de `nombre`, `numero` y
`palabra_clave`; `estado` tiene default `'activa'`. La RPC debe recibir el oriente. Migración
nueva con:
```sql
create or replace function crear_logia(p_nombre text, p_numero int, p_oriente text, p_clave text)
  returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not es_global() then
    raise exception 'No autorizado para crear logias';
  end if;
  insert into logias (nombre, numero, oriente, palabra_clave)
    values (trim(p_nombre), p_numero, trim(p_oriente),
            extensions.crypt(lower(trim(p_clave)), extensions.gen_salt('bf')))
    returning id into v_id;
  return v_id;
end $$;

revoke all on function crear_logia(text, int, text, text) from public, anon, authenticated;
grant execute on function crear_logia(text, int, text, text) to authenticated;
```
Esto garantiza: hash en el servidor, `not null` satisfecho en un solo paso, autorización
consistente con `set_palabra_logia`, y no exponer la clave en claro.

*Alternativa considerada:* `INSERT` por RLS + luego `set_palabra_logia`. Se descarta: `palabra_clave`
es `not null` sin default, así que el primer `INSERT` ya necesita un hash; hacerlo en dos pasos es
más frágil y deja una ventana con clave inválida.

### 2. Función de datos `adminCrearLogia`
En `lib/data/identidad.ts`, junto a las demás:
```ts
export async function adminCrearLogia(
  sb: SupabaseClient,
  args: { nombre: string; numero: number; oriente: string; clave: string }
): Promise<string | undefined> {
  const { data } = await sb.rpc("crear_logia", {
    p_nombre: args.nombre, p_numero: args.numero,
    p_oriente: args.oriente, p_clave: args.clave,
  });
  return data ?? undefined; // id de la nueva logia
}
```
Conserva el estilo del archivo (RPC vía `sb.rpc`, sin lanzar; el llamador maneja el resultado).

### 3. UI: tarjeta "Crear logia" en `AdminClient`
- Visible solo si `global` (respaldada por `can.altaLogias`; la seguridad real es la RPC).
- Campos: nombre (`Input`), número (`Input` numérico), oriente (`Input`), palabra clave (`Input`).
- Validación en cliente (nombre/oriente/clave no vacíos, número entero) antes de llamar; el
  servidor revalida.
- Al crear con éxito, refrescar el listado de logias y seleccionar la nueva (`refrescar(nuevoId)`).
- Ubicación: junto a las tarjetas superiores (grid `lg:grid-cols-3`), coherente con "Logia
  seleccionada" y "Palabra clave".

## Risks / Trade-offs

- [Número de logia duplicado] → No hay unicidad garantizada en el esquema actual; el MVP no la
  fuerza. Riesgo bajo (admin global controlado). Se puede añadir `unique(numero)` en un cambio
  posterior si se decide.
- [La UI muestra el botón a un rol sin permiso por bug] → Mitigado: la RPC rechaza con
  `es_global()`; la UI es solo conveniencia.
- [Palabra clave débil] → Fuera de alcance validar fortaleza; se normaliza (lower/trim) igual que
  el resto del sistema para consistencia con `verificar_acceso`.

## Migration Plan

1. Añadir la migración `crear_logia` en `supabase/migrations/` (nueva marca de tiempo).
2. Aplicar en local con `npx supabase migration up` (o `db reset` si procede en dev — **no** en
   datos que se quieran conservar).
3. Deploy de la app (Vercel) tras la corrección `fix-admin-carga-master`.

Rollback: `drop function crear_logia(text, int, text);` y revertir los cambios de app. Las logias
ya creadas permanecen (datos válidos).

**Seguridad (servidor):** autorización en la RPC (`es_global()`) + RLS `logias_admin`; hash bcrypt
en el servidor. La UI (`can.altaLogias`) no es la barrera.

**Privacidad:** no toca Salud. La palabra clave nunca se persiste ni retorna en claro.

**Modelo de datos:** sin cambios de forma en `Logia` (`lib/types.ts` intacto); solo se añade una
función SQL. No hay divergencia TS/Postgres.

**DESIGN.md:** reutiliza `Card`, `Input`, `Button`, `Select`; sin tokens/primitivos nuevos.

## Open Questions

- ¿Se desea forzar `unique(numero)` para las logias? (Se propone diferirlo; no bloquea este cambio.)
