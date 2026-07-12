## Context

`/register` es la puerta de entrada de la Fase 1. Hoy tiene dos defectos acoplados al
mismo flujo:

- **Listado vacío.** `app/register/page.tsx` (Server Component) lee las logias con
  `supabase.from("logias").select(...)` usando el cliente de servidor. En una página
  pública el visitante no tiene sesión → rol `anon`. La policy vigente
  `logias_read ... for select to authenticated using (true)` (migración
  `20260705150535`) niega la lectura a `anon`, así que la consulta devuelve `[]` sin
  error y el `<Select>` sale vacío.
- **Doble palabra clave, media administración.** El registro llama a
  `verificar_acceso(p_general, p_logia, p_clave_logia)` (RPC `SECURITY DEFINER`,
  ejecutable solo por `service_role` desde `app/api/registro/route.ts`), que valida la
  palabra global (`config.palabra_general_hash`, fila única) **y** la de la logia
  (`logias.palabra_clave`). La global no tiene RPC ni UI de administración: quedó fija
  en el valor del seed. Producto decide eliminarla.

Estado verificado de `config`: solo la referencia `verificar_acceso`. No hay FK, trigger,
policy nombrada ni tipo en `lib/types.ts` que dependa de ella; el trigger de bitácora
(`20260705001203`) referencia `config_capitas`, que es otra tabla. Es seguro eliminarla
tras redefinir `verificar_acceso`.

## Goals / Non-Goals

**Goals:**
- Que el selector de logias cargue en `/register` para visitantes sin sesión.
- Registro con **una sola** palabra clave (la de la logia), verificada en el servidor.
- No exponer datos sensibles de logias (nunca `palabra_clave`) al público.
- Mantener intacto el resto del modelo RLS.

**Non-Goals:**
- No se construye administración de una palabra clave de Orden (se elimina).
- No se relaja la policy `logias_read` de la tabla `logias`.
- No se rediseña la pantalla; solo se retira un campo y se ajusta el copy.

## Decisions

### 1. RPC `SECURITY DEFINER` para el listado, en vez de abrir la tabla al `anon`

Nueva función:

```sql
create or replace function listar_logias_registro()
  returns table (id uuid, nombre text, numero int, oriente text)
  language sql security definer set search_path = public
  stable
as $$
  select id, nombre, numero, oriente
  from logias
  where estado = 'activa'
  order by numero;
$$;

revoke all on function listar_logias_registro() from public;
grant execute on function listar_logias_registro() to anon, authenticated;
```

`app/register/page.tsx` pasa a `supabase.rpc("listar_logias_registro")`.

**Por qué sobre las alternativas:**
- *vs. añadir una policy `anon` en `logias`*: `select *` seguiría trayendo `palabra_clave`
  a nivel de fila (aunque hasheada) y exigiría una vista o columnas explícitas para
  ocultarla; además ampliaría la superficie de lectura pública de la tabla completa. El
  RPC devuelve exactamente 4 columnas no sensibles y encapsula el filtro `activa`.
- *vs. leer con `service_role` en el server*: `/register` no tiene endpoint intermedio
  para el listado (es un Server Component); meter la service key en el render de página
  es innecesario cuando basta un `SECURITY DEFINER` acotado.
- **Seguridad:** la función no recibe ninguna palabra clave, por lo que exponerla a
  `anon` no habilita fuerza bruta (a diferencia de `verificar_acceso`, que sigue siendo
  solo `service_role`). `security definer` + `set search_path = public` evita secuestro
  de resolución de nombres. `stable` porque solo lee.

### 2. Eliminar la palabra clave de la Orden colapsando `verificar_acceso`

```sql
-- Firma nueva: solo logia
create or replace function verificar_acceso(p_logia uuid, p_clave_logia text)
  returns boolean language sql security definer set search_path = public
as $$
  select exists (
    select 1 from logias
    where id = p_logia
      and palabra_clave = extensions.crypt(lower(trim(p_clave_logia)), palabra_clave)
  );
$$;

-- Retirar la firma vieja (3 args) y sus grants
drop function if exists verificar_acceso(text, uuid, text);
revoke all on function verificar_acceso(uuid, text) from public, anon, authenticated;
grant execute on function verificar_acceso(uuid, text) to service_role;

drop table if exists config;
```

La firma cambia (2 args en vez de 3), así que hay que hacer `drop` explícito de la vieja
`verificar_acceso(text, uuid, text)` — `create or replace` no reemplaza firmas distintas.
`app/api/registro/route.ts` llama `rpc("verificar_acceso", { p_logia, p_clave_logia })` y
ajusta el mensaje de error a solo "palabra clave de la logia".

**Seguridad en el servidor:** `verificar_acceso` sigue siendo el único oráculo de
contraseñas, ejecutable solo por `service_role` (nunca `anon`/`authenticated`), llamado
server-side en el alta. La palabra de la logia se compara contra su hash bcrypt; nunca se
almacena ni viaja en claro. Al eliminar `config` desaparece el hash global.

### 3. Delta de datos (Postgres) — no toca `lib/types.ts`

`config` no tiene contraparte en `lib/types.ts`, así que la eliminación no genera delta de
tipos TS. El único delta de esquema es: `-config` (tabla), `~verificar_acceso` (firma),
`+listar_logias_registro` (función). `supabase/seed.sql` pierde el `insert into config`.

### 4. UI (cumple DESIGN.md tal cual)

`RegisterForm.tsx` elimina el primer `Input` ("Palabra clave de la Orden") y el estado
`palabraGeneral`; el subtítulo pasa de "Necesitas la palabra clave de la Orden y la de tu
logia." a algo como "Necesitas la palabra clave de tu logia.". Se reutilizan los
primitivos existentes `Input` y `Select` de `components/ui`; no se introducen tokens,
colores ni tamaños nuevos → no hay delta de `DESIGN.md` ni de `tailwind.config.ts`.

## Privacidad — quién ve qué

- `listar_logias_registro()` expone al público solo `id, nombre, numero, oriente` de
  logias activas: datos institucionales no personales, ya visibles en el flujo de
  registro. **Nunca** `palabra_clave`.
- No se tocan datos de salud (agregado/anonimizado permanece igual) ni Generales.
- Se retira un secreto global; la superficie de verificación de contraseñas se reduce.

## Risks / Trade-offs

- **[Se pierde el "portón" global de la Orden]** → Aceptado como decisión de producto:
  el control de acceso al registro queda íntegramente en la palabra clave por logia, que
  sí es administrable por el master en `/admin`.
- **[Migración destructiva: `drop table config`]** → Se verificó que ninguna otra
  función, trigger, FK o tipo depende de `config`. La migración redefine
  `verificar_acceso` **antes** del `drop` para no dejar la función referenciando una
  tabla inexistente. Rollback: revertir la migración recrea `config` y la firma de 3
  argumentos (documentado en el archivo de migración).
- **[Instalaciones existentes con `config` poblada]** → El `drop table if exists` es
  idempotente; en producción aún no cableada el impacto es nulo. En entornos de demo,
  `supabase db reset` reconstruye desde migraciones + seed ya sin `config`.
- **[Función legible por `anon`]** → Mitigado: no recibe secretos y solo devuelve
  columnas no sensibles; el resto de RPCs sensibles siguen restringidos a
  `service_role`/`authenticated`.

## Migration Plan

1. Nueva migración `supabase/migrations/<ts>_registro_palabra_unica.sql`:
   1. `create or replace function listar_logias_registro()` + grants a `anon`,
      `authenticated`.
   2. `create or replace function verificar_acceso(uuid, text)` (solo logia).
   3. `drop function if exists verificar_acceso(text, uuid, text)` + grants a
      `service_role` sobre la firma nueva.
   4. `drop table if exists config`.
2. `supabase/seed.sql`: quitar el `insert into config`.
3. App: `page.tsx` (usa el RPC), `RegisterForm.tsx` (quita campo/estado/copy),
   `route.ts` (quita `palabraGeneral`, ajusta error), `lib/auth.tsx` (quita
   `palabraGeneral` del tipo y la llamada).
4. `npx supabase db reset` local para validar migración + seed.
5. `npm run typecheck`, `npm run lint`, `npm run check:encoding`.
6. **Rollback:** revertir el commit / migración; recrea `config`, la firma de 3
   argumentos y el campo del formulario.

## Open Questions

- Copy exacto del subtítulo del formulario y del placeholder (pista demo) — se ajusta en
  implementación siguiendo el tono de `PRODUCT.md`; no bloquea el diseño.
