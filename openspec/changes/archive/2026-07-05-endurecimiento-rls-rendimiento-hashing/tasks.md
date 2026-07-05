## 1. Hashing

- [x] 1.1 Cost de bcrypt ≥10 (`gen_salt('bf',10)`) en `set_palabra_logia` y `crear_logia`; verificación sin cambios (el cost va en el hash). → `20260705150535_...sql`
- [x] 1.2 Los hashes nuevos usan cost 10 (`$2a$10$`); las claves existentes se re-hashean al próximo cambio (rotación recomendada de BOAZ).

## 2. Grants

- [x] 2.1 `revoke all on function perfiles_no_autoescalada()` de public/anon/authenticated (proacl = solo owner).

## 3. Rendimiento RLS

- [x] 3.1 Las 30 políticas recreadas envolviendo auxiliares en `(select mi_logia())`/`(select mi_rol())`/etc. (initPlan), preservando los predicados verbatim.
- [x] 3.2 Todas las políticas de datos pasan a `TO authenticated` (0 quedan en `{public}`; 30 en `{authenticated}`).
- [x] 3.3 Índices creados: `perfiles.logia_id`, `eventos.logia_id`, `trabajos.logia_id`, `trabajos.usuario_id`, `tenidas.logia_id`, `correspondencia.de_logia_id`, `mensajes_profesionales.de/a_usuario_id`, `buzon_documentos.logia_id` (9).
- [x] 3.4 Aplicar en local sin borrar datos.

## 4. Verificación (Supabase)

- [x] 4.1 Estructura: 0 policies `{public}`, 30 `{authenticated}`; 9 índices; `perfiles_no_autoescalada` sin grants a public/anon; hashes nuevos `$2a$10$`.
- [x] 4.2 Regresión (semántica intacta): salud individual solo dueño; trabajos por cámara (aprendiz no ve maestro, roles globales sí); generales sin lectura individual para Gran Secretario; aislamiento de escritura de pagos por logia; anti-escalada de rol; buzón por alcance. Todo verificado por rol/logia/grado/estado.
- [x] 4.3 App: las 14 rutas responden 200 como master.

## 5. Calidad

- [x] 5.1 `npm run typecheck` y `npm run lint` en verde (sin cambios de app).
- [x] 5.2 Repaso con criterios de `supabase-postgres-best-practices` (patrón `(select …)` + índices + `TO authenticated`).
