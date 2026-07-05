## Context

No hay `mi_estado()` ni checks de `estado` en RLS. Las políticas relevantes hoy (BD viva):
`prof_read = mostrar_en_directorio OR own`; `msg_rw = de/a = auth.uid()`; `eventos_read = alcance
global OR logia=mi_logia`; `trabajos_read = logia=mi_logia AND nivel(camara)<=nivel(mi_grado)`;
`tenidas_read = logia=mi_logia OR es_global`; `generales_rw`/`salud_owner` = own (+admin en
generales). `estado` tiene enum `estado_t (pendiente,validado,bloqueado)`.

## Goals / Non-Goals

**Goals:** aplicar estado en el servidor; no validado → solo Generales/Salud; bloqueado → sin acceso;
revocar sesión al bloquear. **Non-Goals:** cambiar validación/roles; alcance del Gran Secretario.

## Decisions

### 1. Helper `mi_estado()`
```sql
create or replace function mi_estado() returns estado_t
  language sql stable security definer set search_path = public as $$
  select estado from perfiles where id = auth.uid()
$$;
revoke all on function mi_estado() from public, anon, authenticated;
grant execute on function mi_estado() to authenticated;
```

### 2. Añadir `mi_estado()='validado'` a los módulos de solo-validados
Recrear (drop/create) añadiendo el check, conservando el resto del predicado:
- `prof_read`: `(mostrar_en_directorio AND mi_estado()='validado') OR usuario_id = auth.uid()`
  (el dueño siempre ve/edita su propio perfil profesional; el directorio de otros exige validado).
- `msg_rw` (USING y WITH CHECK): `... AND mi_estado()='validado'`.
- `eventos_read`: `(alcance='global' OR logia_id=mi_logia()) AND mi_estado()='validado'`.
- `trabajos_read`: `... AND mi_estado()='validado'` (defensa explícita, no depender de grado null).
- `tenidas_read`: `(logia_id=mi_logia() OR es_global()) AND mi_estado()='validado'`.
- Cumplimientos: `pagos_read`/`asis_read` en la rama del dueño añadir `AND mi_estado()='validado'`
  (el hermano ve sus cumplimientos solo si está validado; las ramas admin no cambian aquí).

### 3. Bloquear al `bloqueado` en Generales/Salud propias
- `generales_rw` (rama dueño) y `salud_owner`: añadir `AND mi_estado() <> 'bloqueado'`. Un pendiente
  conserva acceso; un bloqueado no.

### 4. Revocación de sesión y navegación (app)
- Añadir comprobación en el layout servidor de `(app)` (o `middleware.ts`): tras `getUser()`, cargar
  `perfil.estado`; si `bloqueado` → `signOut()` + redirigir a `/cuenta-bloqueada`; si `pendiente` →
  permitir solo Generales/Salud (redirigir el resto al dashboard/onboarding).
- `nav.ts`: los ítems restringidos (Eventos, Cumplimientos, Directorio, Mensajería, Trabajos,
  Tenidas) usan `accesoCompleto`/estado en lugar de `show:()=>true`.

*Alternativa considerada:* revocar el JWT del lado de Auth al bloquear. Se descarta: Supabase no
invalida access tokens vivos; el enforcement real es la RLS por `mi_estado()`, y el signOut en app es
la limpieza de UX.

## Risks / Trade-offs

- [Costo por fila de `mi_estado()`] → Envolver en `(select mi_estado())` (initPlan); se alinea con la
  propuesta de endurecimiento de rendimiento RLS.
- [Un admin bloqueado] → `mi_estado()='validado'` también aplica a admins; un admin bloqueado pierde
  acceso, lo cual es el comportamiento deseado.
- [Interacción con otras propuestas] → El check se AÑADE con AND; compone con `alcance-gran-secretario`
  y con `fix-aislamiento-logia-escrituras` sin conflicto (aquellas tocan write/otros predicados).

## Migration Plan

1. Migración: `mi_estado()` + recrear políticas de lectura + Generales/Salud dueño.
2. App: middleware/layout + pantalla bloqueado + `nav.ts`.
3. `migration up` local → push prod.
Rollback: quitar el check de las políticas y `drop function mi_estado()`.

**Seguridad:** enforcement de estado en servidor. **Privacidad:** refuerza que el no validado no vea
directorio/mensajería. **DESIGN.md:** la pantalla "cuenta bloqueada" reutiliza primitivos existentes.

## Open Questions

- ¿Pantalla dedicada `/cuenta-bloqueada` o un estado dentro de `/login`? (Propuesto: página simple.)
