## Context

`correspondencia(..., destinatarios_logia_ids, leido_por, ...)` con `corr_read` (emisor/destinatario/
global) y `corr_write` (INSERT). No hay policy UPDATE → los destinatarios no pueden marcar leído; hoy
`leido_por` solo contiene al autor (fijado en el envío). `eventos` no tiene `adjuntos`.
`buzon_documentos(id, titulo, tipo, archivo_url, autor_id, fecha)` — **sin** `alcance` ni `logia_id`;
`buzon_admin = es_admin()` (todos los admins ven todo).

## Goals / Non-Goals

**Goals:** marcado de lectura por destinatarios (trazabilidad §5.8); `Evento.adjuntos[]`;
`DocumentoBuzon.alcance` respetado. **Non-Goals:** anti-abuso de mensajería (§5.5, aparcado);
rediseño de módulos.

## Decisions

### 1. Marcar correspondencia leída vía RPC (no UPDATE abierto)
```sql
create or replace function marcar_correspondencia_leida(p_id uuid)
  returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from correspondencia c
    where c.id = p_id and (c.de_logia_id = mi_logia() or mi_logia() = any(c.destinatarios_logia_ids) or es_global())
  ) then
    raise exception 'No autorizado';
  end if;
  update correspondencia
     set leido_por = (select array(select distinct e from unnest(coalesce(leido_por,'{}') || auth.uid()) e))
   where id = p_id;
end $$;
revoke all on function marcar_correspondencia_leida(uuid) from public, anon, authenticated;
grant execute on function marcar_correspondencia_leida(uuid) to authenticated;
```
Se prefiere RPC a una policy UPDATE amplia para no permitir editar otros campos de la correspondencia.

### 2. Eventos con adjuntos
- `alter table eventos add column adjuntos jsonb not null default '[]'` (o `text[]`).
- Storage: bucket/prefijo para adjuntos de eventos con policy que herede la visibilidad de `eventos`
  (mismo patrón `EXISTS(select 1 from eventos ...)` que ya se usa en trabajos/correspondencia y que —
  verificado— hereda la RLS de la tabla). UI para adjuntar/descargar.

### 3. Buzón con alcance
- `alter table buzon_documentos add column alcance text not null default 'global' check (alcance in ('logia','global'))`.
- Para acotar "logia", se necesita la logia del documento: derivarla del `autor_id` (su `logia_id`) o
  añadir `logia_id`. Recrear `buzon_admin`/lectura para respetar: global → todos los admin; logia →
  solo admins de esa logia. UI: selector de alcance al subir.

*Alternativa considerada para leído:* policy UPDATE acotada. Se descarta: expondría todas las columnas
al update; la RPC limita la mutación a `leido_por`.

## Risks / Trade-offs

- [Concurrencia en `leido_por`] → la RPC hace append idempotente con `distinct`; suficiente para el
  volumen esperado.
- [Buzón sin logia_id] → derivar de `autor_id` implica un join; alternativamente añadir `logia_id`
  denormalizado. Decisión en implementación (preferible `logia_id` para índice/simplicidad).
- [Adjuntos de eventos y Storage] → reutilizar el patrón de policy con `EXISTS` que hereda RLS.

## Migration Plan

1. Migración: `marcar_correspondencia_leida`, `eventos.adjuntos`, `buzon_documentos.alcance`
   (+`logia_id` si se elige), policies/Storage.
2. App: UI de marcar leído, adjuntos en eventos, selector de alcance en buzón.
3. Local → prod. Rollback: `drop function`, `drop column`, restaurar policies.

**Seguridad:** marcado de leído acotado a destinatarios; alcance de buzón respetado en RLS.
**DESIGN.md:** UI reutiliza primitivos; adjuntos con los mismos tipos permitidos (PDF/Word/PNG/JPG).

## Open Questions

- Buzón: ¿añadir `logia_id` denormalizado o derivar de `autor_id`? (Propuesto: `logia_id`.)
