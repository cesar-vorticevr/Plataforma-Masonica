## Context

Hallazgos de la auditoría transversal (verificados en BD viva): bcrypt cost 06; `perfiles_no_autoescalada`
sin `revoke`; políticas que llaman `mi_logia()`/`mi_rol()`/`mi_grado()`/`es_admin()` sin `(select …)`;
faltan índices en columnas de RLS/FK; varias políticas `TO public`. Ninguno es fuga activa, pero todos
son deuda de seguridad/rendimiento. El proyecto ya sigue el patrón de hardening (search_path fijo,
grants) en la migración `20260703212617`.

## Goals / Non-Goals

**Goals:** hashes fuertes, grants mínimos, RLS eficiente y `TO authenticated`, índices. **Non-Goals:**
cambiar semántica de políticas; 2FA; re-hash retroactivo forzado.

## Decisions

### 1. Cost de bcrypt ≥ 10
- Usar `gen_salt('bf', 10)` (o 12) en `set_palabra_logia`, `crear_logia`, y en la verificación se
  compara con `crypt(input, stored)` (el cost lo lleva el hash almacenado, así que verificar no cambia).
- Semilla: regenerar los hashes de `seed.sql`/config con cost ≥10.
- **Re-hash**: las claves existentes se re-hashean al próximo `set_palabra_logia`/rotación; documentar
  recomendación de rotar BOAZ. (No se puede re-hashear sin la clave en claro.)

### 2. Grants de `perfiles_no_autoescalada`
```sql
revoke all on function perfiles_no_autoescalada() from public, anon, authenticated;
```
(Es función de trigger; no necesita EXECUTE para clientes.)

### 3. RLS: `(select fn())` + `TO authenticated` + índices
- Recrear las políticas envolviendo auxiliares: `(select mi_logia())`, `(select mi_rol())`,
  `(select es_admin())`, etc. → Postgres las evalúa como initPlan una vez por consulta.
- Añadir `TO authenticated` a las políticas de las tablas de datos (evita evaluación para `anon`).
- Crear índices:
  `create index on perfiles(logia_id);` y equivalentes en `eventos(logia_id)`,
  `trabajos(logia_id)`, `trabajos(usuario_id)`, `tenidas(logia_id)`, `asistencias(tenida_id)`,
  `pagos(usuario_id)`, `correspondencia(de_logia_id)` (y `config_capitas(logia_id)` si aplica).
- (Opcional) `es_master()` si no existe de la propuesta de alcance.

*Nota de coordinación:* varias de estas políticas se recrean también en otras propuestas
(aislamiento, estado, alcance). Para evitar choques, **esta propuesta va al final** y recrea la versión
definitiva (con `(select …)` + `TO authenticated`) de las políticas ya endurecidas funcionalmente.

*Alternativa considerada:* dejar el rendimiento para más adelante. Se descarta: a 30+ logias y miles de
filas, la reevaluación por fila y la falta de índices degradan notablemente; es barato hacerlo ahora.

## Risks / Trade-offs

- [Recrear muchas políticas] → riesgo de divergencia con otras propuestas; se mitiga ejecutando esta al
  final y verificando que la semántica (resultados) no cambia con pruebas de regresión.
- [Cost alto de bcrypt] → 10–12 es el estándar; el login/registro añade unos ms, aceptable.
- [Índices] → costo de escritura mínimo; beneficio de lectura alto.

## Migration Plan

1. Migración(es): cost de bcrypt en funciones + semilla; `revoke` del trigger; recreación de políticas
   con `(select …)` y `TO authenticated`; índices.
2. Local → prod (al final de la serie). Verificar con `explain` que las auxiliares son initPlan y que
   los resultados de las políticas no cambian.
Rollback: revertir índices/recreaciones; el cost mayor persiste en hashes nuevos.

**Seguridad:** hashes más fuertes, superficie reducida. **Rendimiento:** RLS escalable.
**Skills:** `supabase-postgres-best-practices` para el patrón `(select …)` e índices; verificar contra
docs/changelog.

## Open Questions

- ¿Cost 10 o 12? (Propuesto: 10; 12 si el hardware lo permite sin afectar UX de login.)
