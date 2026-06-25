## 1. Cimientos (módulo 0)

- [x] 1.1 Rama `migrar-server-components` desde `main`. (Smoke test interactivo de login/logout queda para
      validación con Supabase local arriba — ver 1.7.)
- [x] 1.2 `proxy.ts` reescrito: refresco de sesión vía `@supabase/ssr` con `getClaims()` (→ `getSession`,
      refresca si expiró) y patrón de cookies vigente (recrea respuesta en `setAll`). Sin autorización.
      **Hallazgo:** el `proxy.ts` previo estaba muerto (guarda `NEXT_PUBLIC_DATA_MODE`, var eliminada con el
      mock) → nunca refrescaba; además metía redirect de authz. Corregido.
- [x] 1.3 `lib/auth.tsx`: `AuthProvider` acepta `initialUser?: Usuario | null`; si viene sembrado, arranca
      sin `loading` y sin `getUser()` de cliente. Conserva `onAuthStateChange`. Mapper de perfil extraído a
      `lib/data/perfil.ts` (agnóstico, cliente inyectado) y reutilizado.
- [x] 1.4 Gate en servidor: `app/(app)/layout.tsx` → Server Component async (`getUser()` +
      `redirect('/login')` + `AppShell`). **Decisión al implementar:** el `AuthProvider` se siembra una sola
      vez en el **root layout** (`app/layout.tsx`, ahora server async con `initialUser={perfil}`), no en
      `(app)`, para evitar providers anidados y un `getUser()` cliente en arranque.
- [x] 1.5 `app/page.tsx` → Server Component: `getUser()` server y `redirect` a `/dashboard` o `/login`.
- [x] 1.6 `AGENTS.md` (raíz): añadido bloque `nextjs-agent-rules` apuntando a
      `plataforma-masonica/node_modules/next/dist/docs/`; contenido del proyecto fuera de los marcadores.
- [x] 1.7 Gates estáticos en verde: `typecheck`, `lint`, `build` (todas las rutas pasan a `ƒ Dynamic`,
      Proxy reconocido). **Pendiente (manual, requiere `npx supabase start` + `npm run dev`):** verificar en
      navegador que login redirige a dashboard, acceso sin sesión a `(app)/*` redirige a login sin flash, y
      logout funciona.

## 2. Piloto: directorio

- [x] 2.1 `lib/data/directorio.ts`: sin `"use client"`; cada fn firma `(sb: SupabaseClient, …)`; helper
      `sb()` interno eliminado.
- [x] 2.2 `app/(app)/directorio/page.tsx` → Server Component async: `createClient()` server,
      `listDirectorio(sb)` + `listLogias(sb)` en paralelo; pasa props a `DirectorioClient`.
- [x] 2.3 `DirectorioClient` ("use client"): recibe `perfiles`/`logias` por props, `user` de `useAuth()`
      (provider sembrado); conserva búsqueda, modal "mi perfil" (mutación con browser client inyectado) y
      "contactar". Sin `useEffect` de carga inicial; tras editar usa `router.refresh()`.
- [x] 2.4 Gates estáticos en verde (`typecheck`/`lint`/`build`; `/directorio` = `ƒ Dynamic`). **Pendiente
      (manual):** paridad funcional en navegador — listado interlogial opt-in, búsqueda, editar/opt-out del
      propio, "contactar".

## 3. Resto de módulos (uno por commit, mismo patrón page→isla)

> Migrados en orden de dependencias (hojas → agregadores), no numérico, por los módulos de datos
> compartidos. Todos los `lib/data/*` involucrados pasan a agnósticos (sb inyectado).
> Gates estáticos (typecheck/lint/build) en verde; validación funcional en navegador pendiente.

- [x] 3.1 `dashboard` (server component puro, sin isla)
- [x] 3.2 `generales`
- [x] 3.3 `eventos`
- [x] 3.4 `trabajos`
- [x] 3.5 `mensajes`
- [x] 3.6 `buzon`
- [x] 3.7 `correspondencia`
- [x] 3.8 `tenidas`
- [x] 3.9 `tesoreria`
- [x] 3.10 `cumplimientos` (server component puro, sin isla)
- [x] 3.11 `admin`

## 4. Salud y estadísticas (privacidad — al final)

- [ ] 4.1 `salud`: migrar a server page con cuidado; verificar que ningún dato individual de salud llegue al
      cliente sin corresponder (consentimiento + RLS individual privada).
- [ ] 4.2 `estadisticas` / `salud-estadisticas`: confirmar que solo viaja agregado/anonimizado al cliente.

## 5. Auth pages

- [ ] 5.1 `login` y `register`: shell server + isla de formulario cliente (o documentar por qué se dejan
      como están al ser puramente interactivas).

## 6. Cierre

- [ ] 6.1 Auditar: `grep -l '"use client"' app/**/page.tsx` → solo las islas justificadas; `lib/data/*.ts`
      sin `"use client"`.
- [ ] 6.2 `lib/supabase/server.ts` ya con importadores reales (server pages); `proxy.ts` con matcher correcto.
- [ ] 6.3 `npm run typecheck`, `npm run lint`, `npm run build` en verde; smoke test de cada ruta.
