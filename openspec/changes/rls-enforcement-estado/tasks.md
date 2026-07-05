## 1. BD: helper y políticas por estado

- [x] 1.1 Migración: función `mi_estado()` (security definer, grants solo a `authenticated`). → `20260704232512_enforcement_estado.sql`
- [x] 1.2 Recrear `prof_read` con `(mostrar_en_directorio AND mi_estado()='validado') OR usuario_id=auth.uid()`.
- [x] 1.3 Recrear `msg_rw` (USING+CHECK) añadiendo `mi_estado()='validado'`.
- [x] 1.4 Recrear `eventos_read` añadiendo `mi_estado()='validado'`.
- [x] 1.5 Recrear `trabajos_read` añadiendo `mi_estado()='validado'`.
- [x] 1.6 Recrear `tenidas_read` añadiendo `mi_estado()='validado'`.
- [x] 1.7 Recrear las ramas del dueño de `pagos_read`/`asis_read` añadiendo `mi_estado()='validado'`.
- [x] 1.8 Recrear `generales_rw` (rama dueño) y `salud_owner` añadiendo `mi_estado() <> 'bloqueado'`.
- [x] 1.9 Aplicar en local sin borrar datos.

## 2. App: revocación de sesión y navegación

- [x] 2.1 Comprobación de estado en el layout servidor de `(app)`: bloqueado → redirige a `/cuenta-bloqueada`.
- [x] 2.2 Pantalla "cuenta bloqueada" (`app/cuenta-bloqueada/page.tsx`) que cierra la sesión.
- [x] 2.3 `nav.ts`: Eventos y Cumplimientos dejan de usar `show:()=>true` (usan `accesoCompleto`).

## 3. Verificación (Supabase + app)

- [x] 3.1 Pendiente: por API no lee directorio/eventos; sí puede Generales propias. (verificado RLS)
- [x] 3.2 Bloqueado: por API no lee eventos ni sus Generales; la app redirige a `/cuenta-bloqueada` (layout). (RLS verificado; expulsión por código)
- [x] 3.3 Validado: acceso normal (directorio/eventos). (verificado)
- [x] 3.4 Regresión: admins (validados) conservan acceso (no afectados por el gate de estado='validado').

## 4. Calidad

- [x] 4.1 `npm run typecheck` y `npm run lint` en verde.
