## Context

`/admin` es una isla cliente (`AdminClient.tsx`) que renderiza desde props resueltos en el servidor
(`app/(app)/admin/page.tsx`). Hoy solo cubre la **logia activa**: recibe `{ global, logiaId, logia,
usuarios }` y ofrece tarjetas "Palabra clave" y "Crear logia" más la tabla de hermanos de esa logia.

`resolverLogiaActiva` (`lib/data/logia-activa.ts`) ya calcula y **devuelve el arreglo `logias`** de
todas las logias accesibles (para poblar el selector del header), pero `page.tsx` solo destructura
`{ logiaId, global }` y descarta la lista. Es decir, la lista completa ya está disponible en el
servidor sin fetch adicional.

Estado actual relevante:
- `logias.estado` (`activa`/`inactiva`, default `activa`) existe en el esquema y en el tipo `Logia`,
  pero **ningún flujo lo consulta** (dato muerto).
- `logias.numero` **no** tiene restricción de unicidad; dos logias podrían compartir número.
- Mutaciones de logia existentes: `crear_logia` y `set_palabra_logia` (ambas RPC `security definer`
  con guard `es_global()`). No hay RPC para editar datos ni estado.
- El registro (`app/register/page.tsx`) lista logias con `select("id,nombre,numero,oriente")` sin
  filtrar por estado.
- El trigger `trg_audit_logias` (migración `20260705001203`) ya audita `insert or update` sobre
  `logias`.

Restricción no negociable aplicable: **RBAC en el servidor**. Todas las mutaciones de logia deben
autorizarse en la base (RPC `security definer` + guard `es_global()` + RLS `logias_admin`), no solo
ocultando UI. Este cambio **no** toca datos de salud.

## Goals / Non-Goals

**Goals:**
- Que un admin global vea todas las logias y corrija nombre/número/oriente desde `/admin`.
- Que `estado` pase a ser funcional: `inactiva` = archivada, no admite registros nuevos.
- Que `numero` sea único, garantizado en la base y validado en crear/editar.
- Reutilizar patrones existentes (props del servidor → isla; modal tipo `GestionUsuario`;
  RPC `security definer` como `crear_logia`) sin introducir arquitectura nueva.

**Non-Goals:**
- Borrado físico de logias, fusión o reasignación de hermanos entre logias.
- Cambiar la palabra clave desde este modal (ya lo cubre la tarjeta existente).
- Bloquear/expulsar hermanos de una logia inactiva, u ocultarla a administradores.
- Evolucionar el sistema de diseño: se usa DESIGN.md tal cual.

## Decisions

### D1. Ubicación: tabla nueva en `/admin`, no ruta aparte
La gestión de logias vive como una **tabla adicional en `/admin`** (solo `global`), junto a "Crear
logia". Reutiliza el patrón de la tabla de hermanos y el modal de gestión, evita una ruta/navegación
nueva y mantiene toda la administración en un solo lugar.
- *Alternativa descartada*: página `/admin/logias`. Más limpia conceptualmente, pero añade
  navegación y superficie para poca ganancia dado el patrón ya existente.

### D2. Dos RPC nuevas `security definer` con guard `es_global()`
Se añaden `editar_logia(p_id, p_nombre, p_numero, p_oriente)` y `set_estado_logia(p_id, p_estado)`,
siguiendo exactamente el patrón de `crear_logia`: guard `es_global()` dentro de la función,
`set search_path = public`, y `revoke all … / grant execute … to authenticated`. RLS `logias_admin`
(`for all` con `es_global()`) respalda la autorización.
- *Por qué RPC y no `update` directo vía RLS*: el proyecto ya estandarizó mutaciones de logia por
  RPC (`crear_logia`, `set_palabra_logia`); mantiene la validación (número único, campos no vacíos)
  y la autorización en un solo lugar del servidor.
- *Por qué dos funciones y no una*: editar datos y cambiar ciclo de vida son acciones distintas con
  validaciones distintas (número único aplica a editar, no a estado). Mantenerlas separadas evita
  parámetros opcionales confusos.

### D3. Número único garantizado en la base
Migración que añade `alter table logias add constraint logias_numero_unico unique (numero)`. La
semilla actual (12, 27, 5) no tiene duplicados, por lo que la restricción se aplica sin fallo.
`crear_logia` y `editar_logia` validan explícitamente (mensaje de error claro) y la restricción de
BD es la red de seguridad final. `editar_logia` permite conservar el número propio de la logia
editada (`where numero = p_numero and id <> p_id`).
- *Alternativa descartada*: dejar el número libre (comportamiento actual). Se descartó porque el
  número de logia es un identificador institucional que no debe repetirse.

### D4. Semántica de `inactiva`: solo bloquea registro nuevo
`inactiva` es un archivado suave. El **único** flujo que la respeta es `/register`, que filtra a
`estado = 'activa'`. El selector del header, el directorio y correspondencia **no** filtran (los
admins deben poder gestionar y ver logias inactivas). El acceso de hermanos validados no depende del
estado de la logia.
- *Por qué el alcance mínimo*: evita efectos colaterales sorpresivos (perder acceso, desaparecer del
  selector) y mantiene la reversibilidad (reactivar restaura el registro sin más).

### D5. Pasar `logias` a `AdminClient` desde `page.tsx`
`page.tsx` empezará a destructurar también `logias` de `resolverLogiaActiva` y lo pasará como prop.
La tabla se renderiza solo cuando `global` es verdadero. Cero fetch nuevo. Tras una mutación,
`router.refresh()` recarga desde el servidor (mismo patrón que las acciones de usuario existentes).

### D6. Editar/desactivar la logia activa
`resolverLogiaActiva` ya valida la cookie de logia activa contra las logias accesibles y cae a la
primera si no es válida. Como una logia inactiva **sigue siendo accesible**, desactivar la logia
activa no la invalida: sigue activa en el selector. Tras cualquier mutación se hace
`router.refresh()`; no se requiere lógica especial de cookie.

### Modelo de datos (delta)
- **Postgres** (`supabase/migrations/`): sin cambios de columnas; solo `unique (numero)` y dos RPC
  nuevas. `logias.estado` ya existe.
- **TypeScript** (`lib/types.ts`): `Logia.estado: "activa" | "inactiva"` ya existe. Sin cambios de
  tipo.

### UI / DESIGN.md
Se reutilizan primitivos existentes de `components/ui`: `Card`, `Button`, `Input`, `Badge`, `Modal`,
y la misma estructura de `<table>` que "Hermanos". El estado se muestra con `Badge` (verde `activa`
/ gris `inactiva`) **con texto**, cumpliendo la regla de redundancia color+texto. No se introducen
tokens, colores, fuentes ni radios nuevos. Skills de UI aplicables: **impeccable** + **ui-ux-pro-max**
(superficie de producto/dashboard).

## Risks / Trade-offs

- **La restricción única podría fallar en entornos con datos previos duplicados** → La semilla del
  repo está verificada (12/27/5, sin duplicados). En entornos con datos ya cargados, la migración
  fallaría si hay números repetidos; se documenta que debe resolverse antes de migrar (consulta de
  detección incluida en tasks).
- **Confusión "inactiva" vs. bloquear acceso** → Se documenta explícitamente en spec y UI que
  inactiva solo afecta el registro; el copy del modal lo aclara.
- **Condición de carrera al validar número único en la RPC** → La validación en la función es por
  usabilidad (mensaje claro); la **restricción de BD** es la garantía real ante escrituras
  concurrentes. Se captura el error de violación de unicidad y se traduce a mensaje de UI.
- **Privacidad**: este cambio no expone datos personales ni de salud; solo metadatos de logia
  (nombre, número, oriente, estado) visibles ya a cualquier usuario autenticado vía `logias_read`.
  La novedad es solo poder **editarlos**, restringido a admin global en el servidor.

## Migration Plan

1. Verificar ausencia de números de logia duplicados en el entorno destino (ver tasks); resolver si
   los hubiera.
2. Migración: `unique (numero)` + `crear_logia` (con validación de número único) + `editar_logia` +
   `set_estado_logia`, con `revoke/grant` a `authenticated`.
3. Cablear datos (`adminEditarLogia`, `adminSetEstadoLogia`) y UI (tabla + modal), pasar `logias` a
   `AdminClient`, filtrar `/register` a `activa`.
4. **Rollback**: `drop function editar_logia`, `drop function set_estado_logia`, revertir
   `crear_logia` a su versión previa y `drop constraint logias_numero_unico`; revertir el filtro de
   `/register`. Ninguna columna se elimina (los datos permanecen intactos).

## Open Questions

- Ninguna bloqueante. (El alcance de "inactiva", la ubicación y la unicidad de número quedaron
  decididos en la fase de exploración.)
