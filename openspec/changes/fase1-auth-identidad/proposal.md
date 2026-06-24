## Why

La app sigue siendo una demo: `lib/auth.tsx` resuelve la sesión contra el store mock y no hay auth
real. La **Fase 1 (MVP "Censo + identidad")** del roadmap pide registro/login real y validación por
secretario. Con el Supabase local ya montado (`dev-docker-local`), este es el primer corte: **identidad
y acceso reales**. Es el cimiento de todo lo demás (sin identidad real, nada de salud/tesorería/etc. tiene sentido).

Fase del roadmap: **Fase 1 (MVP), corte 1 de N.** Toca **autenticación y permisos** y prepara el manejo
de **datos personales** (aún no los sensibles de salud, que llegan en otro corte).

Decisiones abiertas relevantes (§11 del .docx): catálogo de logias y secretarios, y "campos editables
por el admin de logia". Para desarrollo bastan las logias del seed; el catálogo oficial puede llegar después.

## What Changes

- **BREAKING (interno):** `lib/auth.tsx` deja de usar el store mock y se cablea a **Supabase Auth**
  (`signUp`, `signInWithPassword`, `signOut`, `getUser`). Se conserva la **interfaz** que consume la UI
  (`login`, `registrar`, `logout`, `user`). El **login con Google queda fuera de alcance**: el botón se
  muestra **desactivado** (diferido a un corte posterior).
- **Registro:** doble palabra clave (general de la Orden + de la logia) y selección de logia, validadas
  **en el servidor** (no en el cliente); creación de cuenta en estado `pendiente`.
- **Validación por secretario:** asignar grado y pasar a `validado` / `bloqueado` (pantalla admin).
- **Sesión SSR:** `middleware.ts` para refrescar las cookies de sesión de Supabase en cada request;
  protección de rutas del área `(app)/` en el servidor.
- **Server Components:** convertir las superficies de auth/identidad y la protección de rutas a
  Server Components donde aplique (fin del all-client en esta superficie).
- **Endurecer RLS de `perfiles`** (ver design): hoy un hermano podría auto-asignarse `rol`/`estado`/`grado`.
- **Modo de datos:** este corte funciona con `NEXT_PUBLIC_DATA_MODE=supabase`; el modo `mock` se conserva.

## Capabilities

### New Capabilities
- `identidad-acceso`: registro controlado (doble palabra clave + logia), autenticación con email/contraseña, estados de cuenta (`pendiente`/`validado`/`bloqueado`), validación y asignación de grado por el secretario, y gestión de sesión SSR. **Sin** login con Google (botón desactivado), Generales ni Salud.

### Modified Capabilities
<!-- Ninguna existente en openspec/specs/ cambia su comportamiento en este corte. -->

## Impact

- **Código:** `lib/auth.tsx` (cableado real), `lib/supabase/server.ts`/`client.ts`, **nuevo** `middleware.ts`,
  `app/login`, `app/register`, `app/(app)/layout.tsx` y `app/(app)/admin` (validación). Posibles Server Actions/route handlers.
- **Base de datos:** **nueva migración** que endurece la política de auto-actualización de `perfiles`
  (impedir auto-escalada de `rol`/`estado`/`grado`/`logia_id`) y ajusta el trigger `handle_new_user` para
  asignar la `logia_id` elegida en el registro. Mantener sincronía con `lib/types.ts` (§8) y rendimiento RLS (§8.3).
- **Seguridad/privacidad:** RBAC en el servidor (RLS por logia/grado); autorización basada en la **tabla
  `perfiles`**, no en claims editables por el usuario; LFPDPPP 2025. **Toca datos personales y permisos.**
- **Dependencias:** ya presentes (`@supabase/ssr` 0.12, `supabase-js` 2.108).

## Non-goals

- **Login con Google (OAuth).** El botón se deja **desactivado**; se cablea en un corte posterior.
- **Generales y Salud** (incl. consentimiento y datos sensibles) — cortes siguientes de Fase 1.
- Tesorería, tenidas, eventos, directorio, trabajos, correspondencia — Fases 2–4.
- Catálogo oficial de logias/secretarios (se usa el seed local).
- Pasarela de pagos, 2FA (recomendado a futuro), notificaciones por correo.
