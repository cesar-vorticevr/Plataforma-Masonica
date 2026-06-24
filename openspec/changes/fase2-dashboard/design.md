## Context

El dashboard agrega datos de salud, cápitas, asistencia, logia y eventos. Salud/cápitas/asistencia ya
tienen helpers Supabase; el nombre de logia se lee de `logias` (legible por todos). Eventos no está
cableado (Fase 3). El conteo de hermanos requiere leer perfiles de la logia (RLS: solo admin/tesorero).
El dashboard es el mayor consumidor del `store.ts` mock, así que cablearlo libera varios residuos.

## Goals / Non-Goals

**Goals:** dashboard con resumen personal real (solo lectura); retirar del store las funciones que queden
sin uso.
**Non-Goals:** cablear Eventos (Fase 3); borrar todo el store (módulos de Fase 3/4 lo usan).

## Decisions

- **Reuso de helpers:** `listEvaluaciones` (salud), `getCapita`/`listPagos` (tesorería),
  `listTenidas`/`listAsistencias` (tenidas) + `lib/capitas.ts`; nombre de logia desde `logias`.
- **Conteo de logia condicional:** solo si el rol puede leer perfiles (`esAdminLogia(user) || rol==='tesorero'`);
  si no, se omite esa tarjeta (no se intenta, para no mostrar un 1 engañoso).
- **Tarjeta de eventos diferida:** se reemplaza la lista por un acceso a `/eventos` (sin fetch) hasta Fase 3.
- **Carga async** sin `setState` síncrono en efecto.
- **Limpieza de `store.ts`:** tras quitar los imports del dashboard, retirar las funciones sin referencias:
  `statsLogia`/`statsTodas`/`consolidar`/`topEtiquetas`/`StatsLogia` (ya muertas) y `getLogia`/`listUsuariosLogia`/
  `listEvaluaciones`/`cumplimientoCapitas`/`asistenciasUsuario`/`listEventos` (solo el dashboard las usaba).
  Verificar con grep que ninguna queda referenciada por módulos aún en mock; quitar imports/tipos que queden huérfanos.

## Risks / Trade-offs

- **Romper el store al quitar funciones:** algunas se usan entre sí (p. ej. `statsLogia` usa varias). Quitar el
  bloque completo y sus dependientes exclusivos; correr `typecheck`/`lint` para detectar referencias colgando.
- **Helpers que dependen de RLS para acotar al dueño:** el hermano ve solo lo suyo (ya validado en cortes previos).
- **Conteo condicional:** asegurar que el layout se ve bien con 3 o 4 tarjetas.

## Migration Plan

1. Rama; Supabase local; un hermano validado con datos (y un admin para el conteo).
2. Cablear `dashboard/page.tsx` (async, reuso de helpers; conteo condicional; eventos diferido).
3. Retirar del `store.ts` las funciones sin uso; ajustar imports/tipos huérfanos.
4. Validar: resumen propio correcto; conteo solo para admin; pendiente ve aviso; `typecheck`/`lint`/`build` verdes.
5. Rollback: revertir rama.

## Open Questions

- ¿La tarjeta de eventos diferida muestra "próximamente" o solo el enlace? (Propuesta: enlace a /eventos.)
- ¿Conviene un helper `lib/data/dashboard.ts` o reuso directo? (Propuesta: reuso directo; es agregación de lecturas.)
