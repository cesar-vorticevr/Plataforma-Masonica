## Context

`es_global()` = `mi_rol() in ('gran_secretario','master')`. Se usa en `generales_rw` (da lectura
individual al Gran Secretario) y en `tenidas_read`. La matriz §4.2 distingue Gran Secretario (Agreg)
de Master (Sí) en varias filas de datos. Falta un `es_master()` para expresar "solo Master".
`trabajos_read` = `logia_id=mi_logia() AND nivel(camara)<=nivel(mi_grado())` deja fuera a los roles
globales (logia/grado nulos). El patrón agregado ya existe en `estadisticas_salud()` (SECURITY
DEFINER, k-agregado).

## Goals / Non-Goals

**Goals:** Gran Secretario = agregado (no individual) en generales/tesorería; roles globales ven
trabajos. **Non-Goals:** tableros visuales completos (propuesta de tableros); alcance de Secretario/
Master; salud (correcta).

## Decisions

### 1. Helper `es_master()`
```sql
create or replace function es_master() returns boolean
  language sql stable set search_path = public as $$ select mi_rol() = 'master' $$;
revoke all on function es_master() from public, anon, authenticated;
grant execute on function es_master() to authenticated;
```

### 2. Generales: quitar lectura individual del Gran Secretario
```sql
drop policy if exists generales_rw on generales;
create policy generales_rw on generales for all
  using ( usuario_id = auth.uid()
          or es_master()
          or (es_admin() and exists (select 1 from perfiles p where p.id = generales.usuario_id and p.logia_id = mi_logia())) )
  with check ( usuario_id = auth.uid() or es_master()
          or (es_admin() and exists (select 1 from perfiles p where p.id = generales.usuario_id and p.logia_id = mi_logia())) );
```
`es_admin()` incluye al Gran Secretario, pero al exigir `p.logia_id = mi_logia()` y el Gran Secretario
tener `logia_id` nulo, no casa ninguna fila → sin lectura individual. Solo Secretario (su logia) y
Master (por `es_master()`) leen individual.

### 3. Trabajos: incluir roles globales
```sql
drop policy if exists trabajos_read on trabajos;
create policy trabajos_read on trabajos for select
  using ( mi_rol() in ('master','gran_secretario')
          or (logia_id = mi_logia() and nivel(camara) <= nivel(mi_grado())) );
```
(Se compone con el gate `mi_estado()='validado'` de la propuesta 2 si ya está aplicado.)

### 4. Vista agregada de cápitas
```sql
create or replace function estadisticas_capitas()
  returns table(logia_id uuid, recaudado numeric, cumplimiento numeric, adeudo numeric)
  language sql security definer set search_path = public as $$
  -- gating: solo master (todas) o gran_secretario (todas, agregado)
  select ... group by logia_id
  where es_master() or mi_rol() = 'gran_secretario'
$$;
revoke all on function estadisticas_capitas() from public, anon, authenticated;
grant execute on function estadisticas_capitas() to authenticated;
```
(Detalle del cálculo se comparte con la propuesta de tableros; aquí basta la función + permiso Agreg.)

### 5. App
- `lib/roles.ts`: `verCapitasStats` incluye `gran_secretario` para la vista **agregada** (no
  individual). Cumplimientos del Gran Secretario muestra agregado coherente.

*Alternativa considerada:* introducir `es_master()` y refactorizar todos los usos de `es_global()`. Se
acota a los puntos donde la matriz difiere (generales, trabajos, tesorería); `es_global()` sigue siendo
correcto donde Gran Secretario y Master coinciden (p.ej. alta de logias/secretarios, publicar eventos).

## Risks / Trade-offs

- [Semántica de "Agreg" en generales] → No hay un agregado natural de datos de contacto; se interpreta
  como "sin lectura individual" (y, si se quisiera, conteos). Se documenta.
- [Solape con la propuesta de tableros] → `estadisticas_capitas()` puede definirse aquí y consumirse
  allí; evitar duplicar la función.

## Migration Plan

1. Migración: `es_master()`, recrear `generales_rw` y `trabajos_read`, `estadisticas_capitas()`.
2. App: `roles.ts` + vista agregada.
3. Local → prod (después de `fix-aislamiento-logia-escrituras`).
Rollback: restaurar `generales_rw`/`trabajos_read` previas; `drop function es_master`, `estadisticas_capitas`.

**Seguridad/Privacidad:** reduce exposición de generales individuales al Gran Secretario.
**DESIGN.md:** las vistas reutilizan primitivos existentes.

## Open Questions

- ¿Qué agregados de generales, si alguno, necesita el Gran Secretario (conteos por oriente/logia)?
