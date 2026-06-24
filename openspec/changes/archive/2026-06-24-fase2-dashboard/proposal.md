## Why

El **dashboard** es la página de inicio: resume al hermano su salud, cápitas y asistencia, y da accesos
rápidos. Hoy usa el `store.ts` mock. Es el módulo que más funciones del store comparte, así que cablearlo
permite **retirar el grueso de los residuos del mock**. Cierra la limpieza de la Fase 2.

Fase del roadmap: **Fase 2, corte 4 (limpieza).** Solo lectura de datos propios + nombre de logia.

## What Changes

- **Cablear el dashboard a Supabase (solo lectura):** estado de salud (última evaluación propia),
  cápitas (cumplimiento del año), asistencia (% propio) y nombre/oriente de la logia, reusando los
  helpers ya existentes (`salud`, `tesoreria`, `tenidas`) y `lib/capitas.ts`.
- **Conteo de hermanos: solo para roles que pueden leer perfiles** (secretario/gran secretario/master/
  tesorero). Para un hermano simple se omite (la RLS no le permite contar a otros).
- **Diferir la tarjeta de "próximos eventos"** a la Fase 3 (eventos aún no cableado): se deja un acceso a
  `/eventos` sin listar datos, para no arrastrar Fase 3.
- **Retirar del `store.ts`** las funciones que quedan sin uso tras este corte: el bloque de estadísticas
  mock (`statsLogia`, `statsTodas`, `consolidar`, `topEtiquetas`, `StatsLogia`) y los agregados que solo
  usaba el dashboard (`getLogia`, `listUsuariosLogia`, `listEvaluaciones`, `cumplimientoCapitas`,
  `asistenciasUsuario`, `listEventos`), verificando que no queden referencias.

## Capabilities

### New Capabilities
- `dashboard`: página de inicio del hermano con su resumen personal (salud, cápitas, asistencia) y accesos rápidos, leyendo de Supabase y respetando lo que cada rol puede ver.

### Modified Capabilities
<!-- Ninguna; sin cambios de esquema ni RLS. -->

## Impact

- **Base de datos:** sin cambios (lecturas ya permitidas por la RLS existente).
- **Código:** `app/(app)/dashboard/page.tsx` (async, reusa helpers); limpieza de `lib/data/store.ts`
  (retirar funciones sin uso). Posible `lib/data/dashboard.ts` o reuso directo de helpers.
- **Seguridad:** el hermano ve solo su resumen; el conteo de logia solo para roles con acceso a perfiles.

## Non-goals

- Cablear el módulo de **Eventos** (Fase 3); la tarjeta de eventos se difiere.
- Borrar por completo `store.ts` (los módulos de Fase 3/4 —eventos, buzón, correspondencia, trabajos,
  directorio, mensajes— aún usan sus funciones).
