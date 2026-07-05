## Context

`/admin` es un Server Component (`page.tsx`) que carga el estado inicial y delega la interacción
a una isla cliente (`AdminClient.tsx`). Hoy el server calcula `logiaId = perfil.logia_id` y llama
`adminGetLogia(supabase, logiaId)`. Para un admin global (`master`/`gran_secretario`),
`perfil.logia_id` es `NULL` por diseño (no pertenecen a una logia). Con id nulo,
`adminGetLogia` (`.eq("id", null).single()`) no devuelve fila y `initialLogia` queda `undefined`.
En la isla, el guard `if (!logia) return "Cargando…"` bloquea toda la pantalla —incluido el
`<Select>` de logias que aparece más abajo en el JSX—, dejando al admin global sin acceso.

Los datos y la seguridad ya están bien: hay logias en la BD, `adminListLogias` las trae, y RLS
(`logias_read`, `perfiles_admin`, etc.) autoriza correctamente la lectura para estos roles. El
fallo es puramente de **selección de estado por defecto en la UI**.

## Goals / Non-Goals

**Goals:**
- Que un admin global vea el panel y el selector con la primera logia cargada por defecto.
- Que un admin de logia siga viendo su propia logia sin selector.
- Que, sin ninguna logia creada, el admin global vea un estado vacío claro, no "Cargando…".

**Non-Goals:**
- No cambiar RLS, RPC ni el modelo de autorización del servidor.
- No añadir creación de logias / alta de hermanos (cambio aparte `admin-crear-logias`).
- No introducir una vista agregada "todas las logias".

## Decisions

### 1. Resolver la logia por defecto en el servidor, según rol
En `page.tsx`, calcular `defaultLogiaId` así:
- Admin global (`esGlobal(perfil.rol)`): `logias[0]?.id ?? ""` (primera logia disponible).
- Admin de logia: `perfil.logia_id` (comportamiento actual).

Luego cargar `initialLogia`/`initialUsuarios` a partir de ese `defaultLogiaId` resuelto (no del
`perfil.logia_id` crudo). Si `defaultLogiaId` es `""` (no hay logias), no llamar a
`adminGetLogia`/`adminListUsuarios` con id vacío: pasar `initialLogia = undefined` y
`initialUsuarios = []`.

*Alternativa considerada:* resolver la primera logia dentro de la isla cliente. Se descarta:
duplicaría lógica de rol en cliente y provocaría un parpadeo (render server → corrección cliente).
Resolverlo en el servidor entrega el estado correcto en el primer render.

### 2. El guard de "Cargando…" no debe bloquear al admin global
En `AdminClient.tsx`, cambiar `if (!logia) return "Cargando…"` para que:
- Si `global === true` y no hay logia seleccionada porque **no existen logias**, renderizar un
  **estado vacío** ("Aún no hay logias creadas.") reutilizando el patrón de vacío ya usado en la
  tabla de hermanos (`<div className="p-6 text-center text-slate-400 text-sm">…</div>`).
- Si hay logia, render normal (con selector para global).
- El "Cargando…" transitorio solo aplica al refresco cliente al cambiar de logia, no al estado
  inicial de un global sin logia propia.

*Alternativa considerada:* mantener el guard y confiar en que siempre haya logia. Se descarta:
no cubre el arranque desde cero (BD sin logias) y volvería a bloquear tras `admin-crear-logias`.

## Risks / Trade-offs

- [El admin global "aterriza" en una logia arbitraria (la primera por número)] → Es solo el valor
  por defecto; el selector permite cambiarla de inmediato. Aceptable para el MVP.
- [Estado vacío nuevo podría no cumplir DESIGN.md] → Se reutiliza el mismo primitivo y tokens del
  estado vacío ya presente en la tabla (`text-slate-400`, `text-sm`), sin colores/fuentes nuevos.

## Migration Plan

Cambio solo de frontend, sin migraciones de BD ni datos. Deploy estándar (Vercel). Rollback =
revertir el commit; no hay estado persistente afectado.

**Seguridad (servidor):** sin cambios. La autorización sigue en RLS; la UI solo elige qué logia
mostrar por defecto. `esGlobal`/`esAdminLogia` (`lib/roles.ts`) siguen siendo asesores de UI, no
la barrera de seguridad.

**Privacidad:** sin impacto. No se exponen datos nuevos; el admin global ya podía leer logias y
perfiles vía RLS. No toca el módulo de Salud.

**DESIGN.md:** sin tokens nuevos. Se reutilizan `Select`, `Card`, `PageTitle` de `components/ui`
y el patrón de estado vacío existente.

## Open Questions

Ninguna.
