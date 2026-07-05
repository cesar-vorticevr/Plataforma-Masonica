## 1. BD: helper y políticas por estado

- [ ] 1.1 Migración: función `mi_estado()` (security definer, grants solo a `authenticated`).
- [ ] 1.2 Recrear `prof_read` con `(mostrar_en_directorio AND mi_estado()='validado') OR usuario_id=auth.uid()`.
- [ ] 1.3 Recrear `msg_rw` (USING+CHECK) añadiendo `mi_estado()='validado'`.
- [ ] 1.4 Recrear `eventos_read` añadiendo `mi_estado()='validado'`.
- [ ] 1.5 Recrear `trabajos_read` añadiendo `mi_estado()='validado'`.
- [ ] 1.6 Recrear `tenidas_read` añadiendo `mi_estado()='validado'`.
- [ ] 1.7 Recrear las ramas del dueño de `pagos_read`/`asis_read` añadiendo `mi_estado()='validado'`.
- [ ] 1.8 Recrear `generales_rw` (rama dueño) y `salud_owner` añadiendo `mi_estado() <> 'bloqueado'`.
- [ ] 1.9 Aplicar en local sin borrar datos.

## 2. App: revocación de sesión y navegación

- [ ] 2.1 Comprobación de estado en middleware o layout servidor de `(app)`: bloqueado → `signOut()` + redirigir a pantalla de cuenta bloqueada; pendiente → restringir a Generales/Salud.
- [ ] 2.2 Pantalla simple "cuenta bloqueada" (reutiliza primitivos de `components/ui`).
- [ ] 2.3 `nav.ts`: Eventos, Cumplimientos, Directorio, Mensajería, Trabajos, Tenidas dejan de usar `show:()=>true`; usan estado/`accesoCompleto`.

## 3. Verificación (Supabase + app)

- [ ] 3.1 Pendiente: por API no lee directorio/mensajería/eventos/trabajos/tenidas; sí puede Generales/Salud propias.
- [ ] 3.2 Bloqueado: por API no lee ni escribe nada (incluidos Generales/Salud); la app lo expulsa a la pantalla de bloqueo.
- [ ] 3.3 Validado: acceso normal según rol/logia/grado.
- [ ] 3.4 Regresión: admins (validados) conservan su acceso.

## 4. Calidad

- [ ] 4.1 `npm run typecheck` y `npm run lint` en verde.
