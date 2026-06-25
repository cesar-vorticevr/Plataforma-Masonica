## 1. Preparación

- [ ] 1.1 Rama desde `main`. Revisar tokens/componentes UI reutilizables (`Card`, `Button`, `PageTitle`)
      y `DESIGN.md`; apoyarse en las skills de diseño (impeccable / ui-ux-pro-max) para 404 y error.

## 2. 404 institucional

- [ ] 2.1 `app/not-found.tsx` (Server Component): página sobria conforme a `DESIGN.md`, con enlace de
      regreso a una ruta válida (inicio/sesión).
- [ ] 2.2 Verificar que una URL inexistente la renderiza (sustituye al 404 por defecto de Next).

## 3. Error boundary

- [ ] 3.1 `app/error.tsx` (Client Component, `"use client"`): captura el error y ofrece `reset()` con
      estética conforme a `DESIGN.md`.
- [ ] 3.2 `app/(app)/error.tsx`: fallback contenido **dentro** del `AppShell` (la navegación sigue
      visible) para errores del área privada.
- [ ] 3.3 Verificar reintento: forzar un error de render y comprobar que el boundary aparece y `reset()`
      reintenta sin recargar toda la app.

## 4. Estado de carga

- [ ] 4.1 `app/(app)/loading.tsx`: fallback sobrio (dentro del `AppShell`) mientras las server pages del
      área hacen `await` de datos.
- [ ] 4.2 Verificar feedback inmediato al navegar entre rutas de `(app)/`.

## 5. Metadata por página

- [ ] 5.1 Añadir `export const metadata: Metadata = { title: "…" }` a cada `page.tsx` de `(app)/`:
      dashboard, salud, generales, cumplimientos, directorio, mensajes, eventos, trabajos, buzon,
      correspondencia, tesoreria, tenidas, estadisticas, admin. (login/register ya hechas.)
- [ ] 5.2 Confirmar que el root mantiene su título y cada página fija el suyo (pestaña por sección).

## 6. Validación

- [ ] 6.1 404: URL inexistente → página institucional.
- [ ] 6.2 Error: error forzado → boundary global y, dentro de `(app)/`, contenido en el `AppShell`; `reset()` reintenta.
- [ ] 6.3 Loading: navegación a rutas de `(app)/` muestra el estado de carga.
- [ ] 6.4 Metadata: el título del documento corresponde a la sección abierta.
- [ ] 6.5 `npm run typecheck`, `npm run lint`, `npm run build` en verde.
