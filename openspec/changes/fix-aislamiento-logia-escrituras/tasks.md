## 1. Migración: políticas de escritura con logia

- [x] 1.1 Crear migración nueva que recree `pagos_write` (master cualquiera; tesorero/secretario solo si `usuario_id` en `mi_logia()`, espejo de `pagos_read`), en `USING` y `WITH CHECK`. → `20260704231737_aislamiento_logia_escrituras.sql`
- [x] 1.2 Recrear `capita_write` (master cualquiera; tesorero/secretario solo `logia_id = mi_logia()`).
- [x] 1.3 Recrear `tenidas_write` (master cualquiera; secretario solo `logia_id = mi_logia()`; excluye tesorero y Gran Secretario).
- [x] 1.4 Recrear `asis_write` (master cualquiera; secretario solo si la tenida pertenece a `mi_logia()`).
- [x] 1.5 Aplicar en local (`npx supabase migration up --local`) sin borrar datos.

## 2. Verificación (Supabase, transacción con rollback)

- [x] 2.1 Tesorero de logia A: escribir pago de logia B → rechazado; de logia A → permitido.
- [x] 2.2 Secretario de logia A: upsert `config_capitas` de logia B → rechazado; de A → permitido.
- [x] 2.3 Secretario de logia A: crear tenida de logia B → rechazado; de A → permitido. Gran Secretario: crear tenida → rechazado.
- [x] 2.4 Secretario de logia A: marcar asistencia en tenida de logia B → rechazado; de A → permitido.
- [x] 2.5 Master: escribir pago/cápita/tenida/asistencia de cualquier logia → permitido.
- [x] 2.6 Regresión: la lectura (pagos/cápita/tenidas/asistencias) sigue igual (políticas de lectura no modificadas).

## 3. Calidad

- [x] 3.1 `npm run typecheck` y `npm run lint` en verde (sin cambios de app).
