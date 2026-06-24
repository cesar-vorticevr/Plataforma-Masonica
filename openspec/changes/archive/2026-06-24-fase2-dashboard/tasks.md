## 1. Preparación

- [x] 1.1 Rama desde `main`; Supabase local; un hermano validado con datos (salud/cápitas/asistencia) y un admin (para el conteo).

## 2. Cableado

- [x] 2.1 `app/(app)/dashboard/page.tsx` async: salud (última evaluación), cápitas (cumplimiento), asistencia (% propio) y nombre/oriente de logia, reusando helpers de salud/tesorería/tenidas + `lib/capitas.ts`. Mantener el aviso de cuenta pendiente y los accesos rápidos.
- [x] 2.2 Conteo de hermanos solo para roles con acceso a perfiles (admin/tesorero); omitir para hermano simple.
- [x] 2.3 Diferir la tarjeta de "próximos eventos": acceso a `/eventos` sin listar datos (hasta Fase 3).

## 3. Limpieza del store

- [x] 3.1 Quitar los imports del store en el dashboard.
- [x] 3.2 Retirar del `store.ts` el bloque de stats muerto (`statsLogia`, `statsTodas`, `consolidar`, `topEtiquetas`, `StatsLogia`) y las funciones que quedaron libres (`listUsuariosLogia`, `listEvaluaciones`, `asistenciasUsuario`, `cumplimientoCapitas`). Se conservan `getLogia` (usada por `cambiarPalabraClaveLogia`) y `listEventos` (usada por `nuevosEventos` del nav); su retiro va con sus cortes (Fase 3 / cleanup final).

## 4. Validación

- [x] 4.1 El hermano ve su resumen (salud/cápitas/asistencia) y el nombre de su logia.
- [x] 4.2 El conteo de hermanos aparece para admin/tesorero y se omite para hermano simple.
- [x] 4.3 Un usuario `pendiente` ve el aviso de validación.
- [x] 4.4 `npm run typecheck`, `npm run lint`, `npm run build` en verde (sin referencias colgando del store).
