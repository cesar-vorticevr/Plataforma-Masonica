## Why

El registro público (`/register`) está roto y sobre-diseñado:

1. **La lista de logias no carga.** La migración de endurecimiento de RLS
   (`20260705150535`) restringió la policy `logias_read` a `to authenticated`, pero
   `/register` es público y consulta como rol `anon`: pasa el filtro con **cero filas**
   y el selector de logias queda vacío. Nadie puede registrarse.
2. **Hay dos palabras clave, pero solo una es administrable.** El registro exige
   "palabra clave de la Orden" (`config.palabra_general_hash`, única y global) **y**
   "palabra clave de la logia" (`logias.palabra_clave`). El master puede cambiar la de
   la logia en `/admin`, pero la de la Orden no tiene RPC ni UI: quedó congelada en el
   valor del seed (`BOAZ`) y no hay forma de administrarla. Decisión de producto:
   quedarnos **solo con la palabra clave por logia**.

Es un bug bloqueante de la Fase 1 (Censo + identidad): sin registro no entran hermanos.

## What Changes

- **Arreglar el listado de logias en el registro.** Nuevo RPC `SECURITY DEFINER`
  `listar_logias_registro()` que devuelve únicamente `id, nombre, numero, oriente` de
  logias en estado `activa`, con `grant execute` a `anon` y `authenticated`. No recibe
  ninguna palabra clave, por lo que no abre superficie de fuerza bruta, y nunca expone
  `palabra_clave`. `app/register/page.tsx` pasa a llamar al RPC en vez de
  `.from("logias").select(...)`. La policy `logias_read` se mantiene como está.
- **BREAKING** — **Eliminar la palabra clave de la Orden.** El registro pasa a exigir
  **una sola** palabra clave: la de la logia.
  - Redefinir `verificar_acceso()` con firma `(p_logia uuid, p_clave_logia text)` que
    valida solo la logia (drop de la firma vieja `verificar_acceso(text, uuid, text)`;
    revoke/grant a `service_role` en la nueva).
  - `drop table config` (y su RLS), previa verificación de que ningún trigger/FK
    dependa de ella (el trigger de bitácora referencia `config_capitas`, otra tabla).
  - Quitar el `insert into config` del `seed.sql`.
  - `app/api/registro/route.ts` deja de enviar `palabraGeneral`; el mensaje de error
    pasa a referirse solo a la palabra de la logia.
  - `app/register/RegisterForm.tsx` quita el `Input` de la Orden, el estado
    `palabraGeneral` y ajusta el subtítulo.
  - `lib/auth.tsx` quita `palabraGeneral` del tipo y de la llamada de `registrar()`.

**Non-goals**
- NO se construye administración para una palabra clave de Orden (se elimina, no se
  completa la opción A).
- NO se cambia la policy `logias_read` de la tabla `logias` ni el resto del modelo RLS.
- NO se toca el login, los estados de cuenta, ni la validación por el secretario.
- NO es un rediseño de la pantalla de registro; solo se retira un campo.

## Capabilities

### New Capabilities
_(ninguna)_

### Modified Capabilities
- `identidad-acceso`: el requisito "Registro controlado por doble palabra clave y logia"
  pasa a ser registro por **una sola** palabra clave (la de la logia); además se
  especifica que las logias `activa` deben poder leerse por el registrante público
  (`anon`) a través de una función de servidor acotada, no por acceso directo a la tabla.

## Impact

- **Seguridad / permisos:** sí. Se retira un secreto global (la palabra de la Orden) y
  se añade una función `SECURITY DEFINER` legible por `anon` acotada a columnas no
  sensibles de logias activas. Sin exposición de hashes ni de datos sensibles; sigue
  cumpliendo LFPDPPP 2025 (palabras clave hasheadas, verificación en servidor).
- **UI:** cambia `/register` (se elimina un campo, se ajusta el copy). Cumple `DESIGN.md`
  tal cual, reutilizando los primitivos existentes (`Input`, `Select`); no evoluciona el
  sistema de diseño.
- **Datos sensibles (salud):** no aplica.
- **Migraciones:** nueva migración (crear `listar_logias_registro`, redefinir
  `verificar_acceso`, `drop table config`). Actualizar `supabase/seed.sql`.
- **Código:** `app/register/page.tsx`, `app/register/RegisterForm.tsx`,
  `app/api/registro/route.ts`, `lib/auth.tsx`. Verificar `lib/types.ts` (sin tipo
  derivado de `config`).
- **Fase del roadmap:** Fase 1 (MVP · Censo + identidad). No requiere resolver ninguna
  "decisión abierta" del §11 pendiente: la dirección (una sola palabra clave) ya está
  decidida.
