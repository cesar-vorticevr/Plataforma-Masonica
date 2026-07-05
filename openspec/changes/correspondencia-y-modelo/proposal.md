## Why

Dos brechas funcionales/de modelo respecto a la especificación:

- **Correspondencia `leído_por` no funcional (§5.8):** la correspondencia debe ser "fechada y
  trazable". La columna `leido_por` existe, pero solo se fija al **autor** en el envío; **no hay
  policy UPDATE ni RPC/UI** para que los destinatarios marquen leído (`corr_write` es solo INSERT). La
  trazabilidad de lectura no opera.
- **Campos del modelo §7 ausentes:** `Evento.adjuntos[]` (los eventos no admiten adjuntos) y
  `DocumentoBuzon.alcance` (el buzón no distingue alcance logia/global). Son campos que el modelo
  conceptual §7 contempla.

Pertenece a Fase 3 (Comunicación). Toca app y esquema; sin cambios en el modelo de seguridad base
(las lecturas/escrituras ya están acotadas por rol/logia). **No** incluye el anti-abuso de mensajería
(§5.5), que quedó aparcado.

## What Changes

- **Correspondencia:**
  - Policy/mecanismo para que un **destinatario** marque una correspondencia como leída: RPC
    `security definer` `marcar_correspondencia_leida(p_id)` que valida que `mi_logia()` está en
    `destinatarios_logia_ids` y añade `mi_logia()`/`auth.uid()` a `leido_por` (append idempotente).
  - UI para marcar/mostrar leído por en `CorrespondenciaClient`.
- **Modelo (migración):**
  - `eventos.adjuntos` (p.ej. `text[]`/`jsonb`) + Storage/UI para adjuntar en eventos.
  - `buzon_documentos.alcance` (`logia`/`global`) + ajuste de RLS/UI para respetar el alcance.

## Capabilities

### New Capabilities
- `correspondencia-trazabilidad`: marcado de lectura por destinatarios en correspondencia.
- `modelo-eventos-buzon`: adjuntos en eventos y alcance en documentos de buzón.

## Impact

- **Código:** migración (columnas + policy/RPC), `lib/data/correspondencia.ts`/`eventos.ts`/`buzon.ts`,
  UI correspondiente; posibles policies de Storage para adjuntos de eventos.
- **Seguridad:** el marcado de leído se hace por RPC acotada a destinatarios; `alcance` de buzón se
  respeta en RLS.

## Non-goals

- No incluye anti-abuso de mensajería profesional (§5.5) — aparcado.
- No rediseña los módulos; solo completa trazabilidad y campos de modelo.
