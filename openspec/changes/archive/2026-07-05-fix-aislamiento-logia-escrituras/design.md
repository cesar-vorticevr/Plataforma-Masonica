## Context

Políticas de escritura actuales (verificadas en BD viva), todas `cmd=ALL` con el mismo predicado en
`USING` y `WITH CHECK`:

- `pagos_write`: `mi_rol() in (tesorero,secretario,master)` — sin logia. (Pero `pagos_read` sí acota:
  `usuario_id=auth.uid() OR master OR (tes/sec AND EXISTS perfil en mi_logia)`.)
- `capita_write`: `mi_rol() in (tesorero,secretario,master)` — sin logia. (`capita_read`:
  `logia_id=mi_logia() OR master`.)
- `tenidas_write`: `es_admin()` — sin logia. (`tenidas_read`: `logia_id=mi_logia() OR es_global()`.)
- `asis_write`: `es_admin()` — sin logia. (`asis_read`: `own OR es_global() OR (es_admin AND tenida
  en mi_logia)`.)

El patrón correcto ya existe en las políticas de lectura; solo hay que replicarlo en escritura.

## Goals / Non-Goals

**Goals:** cerrar la escritura cross-logia en pagos, config_capitas, tenidas y asistencias, alineado
con §4.2. **Non-Goals:** lectura (ya correcta), alcance de lectura del Gran Secretario, tableros.

## Decisions

### Recrear las 4 políticas de escritura con logia (drop + create)
Migración nueva. `master` (mi_rol()='master') escribe cualquier logia; los demás quedan acotados.

```sql
-- pagos: espejo de pagos_read
drop policy if exists pagos_write on pagos;
create policy pagos_write on pagos for all
  using (
    mi_rol() = 'master'
    or (mi_rol() in ('tesorero','secretario')
        and exists (select 1 from perfiles p where p.id = pagos.usuario_id and p.logia_id = mi_logia()))
  )
  with check (
    mi_rol() = 'master'
    or (mi_rol() in ('tesorero','secretario')
        and exists (select 1 from perfiles p where p.id = pagos.usuario_id and p.logia_id = mi_logia()))
  );

-- config_capitas
drop policy if exists capita_write on config_capitas;
create policy capita_write on config_capitas for all
  using (mi_rol() = 'master' or (mi_rol() in ('tesorero','secretario') and logia_id = mi_logia()))
  with check (mi_rol() = 'master' or (mi_rol() in ('tesorero','secretario') and logia_id = mi_logia()));

-- tenidas: solo secretario de su logia + master (matriz: tenidas write = Secretario Logia, Master Sí)
drop policy if exists tenidas_write on tenidas;
create policy tenidas_write on tenidas for all
  using (mi_rol() = 'master' or (mi_rol() = 'secretario' and logia_id = mi_logia()))
  with check (mi_rol() = 'master' or (mi_rol() = 'secretario' and logia_id = mi_logia()));

-- asistencias: la tenida debe pertenecer a mi_logia()
drop policy if exists asis_write on asistencias;
create policy asis_write on asistencias for all
  using (
    mi_rol() = 'master'
    or (mi_rol() = 'secretario'
        and exists (select 1 from tenidas t where t.id = asistencias.tenida_id and t.logia_id = mi_logia()))
  )
  with check (
    mi_rol() = 'master'
    or (mi_rol() = 'secretario'
        and exists (select 1 from tenidas t where t.id = asistencias.tenida_id and t.logia_id = mi_logia()))
  );
```

*Nota:* se usa `mi_rol()='master'` en vez de `es_global()` para NO conceder escritura al Gran
Secretario (Agreg). Alternativa: helper `es_master()`; se puede introducir en la propuesta
`endurecimiento-rls` para reuso. *Nota de rendimiento:* al recrear, considerar envolver `mi_logia()`
en `(select mi_logia())` (initPlan) — se aborda a fondo en la propuesta de endurecimiento; aquí se
prioriza corrección.

*Alternativa considerada:* añadir `WITH CHECK` sin tocar `USING`. Se descarta: `USING` también debe
acotar para que un tesorero no pueda `UPDATE`/`DELETE` filas de otra logia.

## Risks / Trade-offs

- [Master con `logia_id` nulo] → Se cubre con la rama `mi_rol()='master'` (no depende de logia). OK.
- [Subconsultas por fila en `USING`/`WITH CHECK`] → Igual que las lecturas actuales; el rendimiento
  fino se aborda en la propuesta de endurecimiento (índices en `logia_id`, `(select …)`).

## Migration Plan

1. Migración con las 4 `drop/create policy`.
2. `npx supabase migration up --local`; luego push a prod.
Rollback: recrear las políticas previas (`es_admin()` / `mi_rol() in (...)`).

**Seguridad:** cierra escritura cross-logia. **Modelo de datos:** sin cambios. **DESIGN.md:** N/A (sin UI).

## Open Questions

- ¿Introducir `es_master()` aquí o en la propuesta de endurecimiento? (Propuesto: allí, para reuso.)
