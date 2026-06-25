## Context

Estado verificado (Next 16.2.9, junio 2026):

| Capa | Estado actual |
|---|---|
| Páginas `app/**/page.tsx` | 17/18 `"use client"` (solo `/privacidad` es server) |
| Módulos `lib/data/*.ts` | 13/14 `"use client"` → `createBrowserClient` |
| `lib/auth.tsx` | `"use client"`, `AuthProvider` + `getUser()` en cliente |
| `lib/supabase/server.ts` | existe, patrón `getAll/setAll` correcto, **sin importadores** |
| `proxy.ts` / `middleware.ts` | **no existe** |
| Server Actions `"use server"` | 0 |
| Route handlers | 1 (`/api/registro`) |

Patrón uniforme hoy: `page.tsx ("use client") → useAuth() → useEffect(listX()) → lib/data (browser client)`.

Fuentes de verdad consultadas (no memoria):
- **Next.js, bundled docs** `node_modules/next/dist/docs/01-app/...`: Server Components por defecto;
  `proxy.md` confirma *"Starting with Next.js 16, Middleware is now called Proxy"* (archivo `proxy.ts` en
  raíz, export `proxy` named o default, misma funcionalidad) y advierte que **Proxy NO es solución de
  autorización/sesión completa** — solo optimistic checks + refresh.
- **Supabase SSR para Next**: `proxy.ts` refresca token; server client en Server Components/Route
  Handlers; browser client solo en client components; **`getClaims()`/`getUser()` en servidor** para
  proteger páginas — nunca `getSession()` en código de servidor.
- **Next AI agents guide**: la fuente de buenas prácticas para agentes son los docs bundled; se activan con
  el bloque `nextjs-agent-rules` en `AGENTS.md`.

## Goals / Non-Goals

**Goals:** páginas server-first por defecto; lectura de datos en servidor con RLS; refresh de sesión en
`proxy.ts`; gate de auth verificado en servidor; capa de datos agnóstica (cliente inyectado); migración
incremental módulo a módulo sin regresiones; `AGENTS.md` apuntando a los docs bundled de Next.

**Non-Goals:** Server Actions para mutaciones (siguen en islas cliente esta fase); rediseño de UI; upgrade
de Next; cambios de esquema/RLS.

## Decisions

- **Capa de datos: inyectar `SupabaseClient` por parámetro.** `lib/data/*.ts` pierde `"use client"`; cada fn
  pasa a `fn(sb: SupabaseClient, …)`. El Server Component construye el cliente con `lib/supabase/server.ts`
  (`await createClient()`); las islas que muten construyen el de navegador (`lib/supabase/client.ts`) y lo
  pasan. Una sola implementación de cada consulta; la RLS decide igual en ambos entornos. (Decisión del
  usuario, opción "inyectar por parámetro".)
- **Auth: AuthProvider delgado sembrado desde servidor.** `app/(app)/layout.tsx` (server, async) hace
  `getUser()` server, `redirect('/login')` si no hay sesión, carga el perfil con el server client y siembra
  `<AuthProvider initialUser={perfil}>`. `useAuth()` sigue disponible en las islas → reescritura mínima de
  los 17 consumidores. El gate **real** es el server layout + `proxy.ts`; el provider es solo conveniencia
  de UI. (Decisión del usuario.)
- **`proxy.ts` solo refresca.** Implementa el patrón Supabase (lee/renueva cookies de sesión, devuelve la
  respuesta con cookies actualizadas). `matcher` excluye `_next/static`, `_next/image`, assets e `favicon`.
  NO redirige por autorización (eso vive en el server layout/páginas). Conforme a la advertencia del doc.
- **Patrón de página: server page → isla cliente.** `page.tsx` async (server) obtiene datos con el server
  client y los pasa por props a `XxxClient` (`"use client"`) que conserva estado/búsqueda/modales/forms.
  Se elimina el `useEffect` de carga inicial; la búsqueda en cliente y los formularios permanecen.
- **Raíz y auth pages.** `app/page.tsx` redirige en servidor según sesión. `login`/`register` quedan como
  shell server con la isla de formulario cliente (baja prioridad; se migran al final).
- **`AGENTS.md`.** Añadir el bloque delimitado por `<!-- BEGIN:nextjs-agent-rules -->` / `END` que instruye
  leer `node_modules/next/dist/docs/` antes de tocar Next. El contenido del proyecto va **fuera** de los
  marcadores. (Opcional) registrar el Next.js MCP server como nota.
- **Orden de migración.** Cimientos → piloto `directorio` → resto → salud/estadísticas (privacidad) →
  login/register. (Decisión del usuario.)

## Patrón objetivo

```
proxy.ts                      → refresca sesión Supabase (cada request)
  │
app/(app)/layout.tsx (server, async)
  └─ getUser() server → redirect('/login') si no hay sesión
  └─ <AuthProvider initialUser={perfil}><AppShell>{children}</AppShell></AuthProvider>
       │
app/(app)/directorio/page.tsx (server, async)
  └─ const sb = await createClient(); const perfiles = await listDirectorio(sb)   // RLS aplica
  └─ <DirectorioClient user={user} perfiles={perfiles} logias={logias} />          // isla
        └─ búsqueda, modal "mi perfil", "contactar"  → "use client"
```

## Risks / Trade-offs

- **Churn amplio (17 páginas).** Mitigado por: incremental módulo a módulo, AuthProvider sembrado (no se
  reescriben los `useAuth()`), y la capa de datos agnóstica (la misma fn sirve server y cliente).
- **Doble entorno en `lib/data`.** Una fn que reciba el client equivocado falla en runtime. Mitigación:
  tipar el parámetro `SupabaseClient` y, si hace falta, `import 'server-only'` en helpers que solo deban
  correr en servidor. Las fns de lectura son agnósticas por diseño.
- **Salud/estadísticas.** Mayor sensibilidad (consentimiento, agregado/anonimizado). Se migran al final,
  validando que ningún dato individual de salud llegue al cliente que no debía.
- **Búsqueda en cliente.** Se mantiene como hoy (suficiente para el volumen); si crece, mover a SQL.
- **`proxy.ts` mal acotado.** Si el `matcher` incluye estáticos, penaliza. Se valida el matcher.

## Migration Plan

1. **Cimientos:** `proxy.ts` (refresh); convertir `app/(app)/layout.tsx` a server con gate; `AuthProvider`
   con `initialUser`; `app/page.tsx` redirect server; `AGENTS.md` con bloque Next. Verificar login/logout y
   redirecciones server.
2. **Piloto `directorio`:** quitar `"use client"` de `lib/data/directorio.ts`, firmar con `sb`; convertir
   `directorio/page.tsx` a server (fetch server) + `DirectorioClient` isla. Validar paridad funcional.
3. **Resto de módulos** (uno por commit): dashboard, generales, eventos, trabajos, mensajes, buzon,
   correspondencia, tenidas, tesoreria, cumplimientos, admin. Mismo patrón.
4. **Salud y estadísticas** al final, con validación de privacidad explícita.
5. **login/register** como shell server + isla de formulario.
6. **Cierre:** confirmar 0 páginas `"use client"` salvo islas justificadas; `typecheck`/`lint`/`build`.

## Open Questions

- ¿Mover mutaciones a **Server Actions** en una fase posterior? (Propuesta: sí, change aparte tras esta.)
- ¿Registrar el **Next.js MCP server** ahora o esperar a 16.3? (Propuesta: nota en AGENTS.md, activarlo aparte.)
- ¿`login/register` justifican shell server, o se dejan como están al ser puramente interactivas?
