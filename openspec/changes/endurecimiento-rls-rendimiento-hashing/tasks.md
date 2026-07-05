## 1. Hashing

- [ ] 1.1 Subir cost de bcrypt a ≥10 (`gen_salt('bf',10)`) en `set_palabra_logia`, `crear_logia` y donde se generen hashes; verificación sin cambios (el cost va en el hash).
- [ ] 1.2 Regenerar hashes de `seed.sql`/config con cost ≥10; documentar re-hash/rotación de las claves existentes.

## 2. Grants

- [ ] 2.1 `revoke all on function perfiles_no_autoescalada() from public, anon, authenticated`.
- [ ] 2.2 Repasar que todas las funciones `security definer` tengan grants mínimos (auditar `proacl`).

## 3. Rendimiento RLS

- [ ] 3.1 Recrear políticas envolviendo auxiliares en `(select mi_logia())`/`(select mi_rol())`/etc. (initPlan).
- [ ] 3.2 Añadir `TO authenticated` a las políticas de las tablas de datos.
- [ ] 3.3 Crear índices en columnas de RLS/FK: `perfiles.logia_id`, `eventos.logia_id`, `trabajos.logia_id`, `trabajos.usuario_id`, `tenidas.logia_id`, `asistencias.tenida_id`, `pagos.usuario_id`, `correspondencia.de_logia_id` (y `config_capitas.logia_id` si aplica).
- [ ] 3.4 (Opcional) `es_master()` si no existe.
- [ ] 3.5 Aplicar en local sin borrar datos.

## 4. Verificación (Supabase)

- [ ] 4.1 `explain (analyze)` muestra las auxiliares como initPlan (no por fila) en tablas grandes de prueba.
- [ ] 4.2 Regresión: los resultados de cada política no cambian (mismos datos visibles por rol que antes).
- [ ] 4.3 `proacl` de `perfiles_no_autoescalada` sin public/anon; hashes nuevos con cost ≥10.
- [ ] 4.4 Índices presentes (`\di`).

## 5. Calidad

- [ ] 5.1 `npm run typecheck` y `npm run lint` en verde (sin cambios de app esperados).
- [ ] 5.2 Repasar con las skills `supabase` y `supabase-postgres-best-practices` (verificar contra docs/changelog).
