## ADDED Requirements

### Requirement: Renderizado server-first por defecto

Layouts y páginas SHALL ser Server Components por defecto. La directiva `"use client"` SHALL usarse
únicamente en componentes que requieran estado, manejadores de eventos, ciclo de vida (`useEffect`) o
APIs de navegador ("islas"). La lectura inicial de datos de una página SHALL ocurrir en el servidor y
pasarse por props a las islas cliente; NO SHALL hacerse vía `useEffect` en el cliente cuando pueda
hacerse en servidor.

#### Scenario: Página de área privada renderiza en servidor
- **WHEN** un miembro autenticado abre una ruta de `(app)/` ya migrada
- **THEN** el HTML llega con los datos ya obtenidos en servidor (sin estado de "Cargando…" por carga inicial)

#### Scenario: Solo islas son client components
- **WHEN** se audita una página migrada
- **THEN** la página es Server Component y solo sus partes interactivas (búsqueda, modales, formularios) son `"use client"`

### Requirement: Refresco de sesión vía Proxy

El proyecto SHALL incluir un archivo `proxy.ts` en la raíz de la app (Next 16 renombró *Middleware* a
*Proxy*) que refresque el token de sesión de Supabase en cada request usando `@supabase/ssr`. El Proxy
NO SHALL usarse como solución de autorización ni de gestión de sesión completa (solo refresco y checks
optimistas). Su `matcher` MUST excluir recursos estáticos (`_next/static`, `_next/image`, assets).

#### Scenario: Token de sesión se refresca
- **WHEN** un miembro con sesión próxima a expirar navega entre rutas
- **THEN** el Proxy renueva las cookies de sesión y la navegación continúa sin re-login

#### Scenario: El Proxy no autoriza
- **WHEN** se revisa `proxy.ts`
- **THEN** no contiene lógica de autorización por rol/grado; la autorización vive en Server Components y RLS

### Requirement: Gating de autenticación en servidor

El acceso al área `(app)/` SHALL verificarse en el servidor: el layout del segmento MUST validar la sesión
con `getUser()` (o `getClaims()`) del cliente de servidor y redirigir a `/login` cuando no haya sesión. La
verificación NO SHALL depender únicamente de un efecto en cliente. La ruta raíz `/` MUST resolver su
redirección (a `/dashboard` o `/login`) en el servidor.

#### Scenario: Acceso sin sesión redirige en servidor
- **WHEN** un visitante sin sesión solicita una ruta de `(app)/`
- **THEN** es redirigido a `/login` en el servidor, sin renderizar contenido protegido en el cliente

#### Scenario: Raíz redirige según sesión
- **WHEN** se solicita `/`
- **THEN** el servidor redirige a `/dashboard` si hay sesión válida, o a `/login` en caso contrario

### Requirement: Obtención de datos con cliente Supabase inyectado

Las funciones de acceso a datos en `lib/data/*.ts` SHALL ser agnósticas del entorno y recibir el
`SupabaseClient` por parámetro, en lugar de construir un `createBrowserClient` interno con `"use client"`.
Los Server Components MUST pasar el cliente de servidor; las islas cliente que realicen mutaciones MUST
pasar el cliente de navegador. La autorización SHALL seguir aplicándose por RLS en ambos entornos.

#### Scenario: Lectura en servidor con RLS
- **WHEN** un Server Component llama a una función de datos con el cliente de servidor
- **THEN** la consulta se ejecuta en servidor y la RLS filtra los resultados según la sesión

#### Scenario: Módulos de datos sin "use client"
- **WHEN** se auditan los módulos de `lib/data/`
- **THEN** ninguno declara `"use client"` ni construye un cliente de navegador implícito

### Requirement: Docs de Next como fuente de verdad para agentes

El `AGENTS.md` del repositorio SHALL incluir el bloque gestionado `nextjs-agent-rules` que instruye a los
agentes leer la documentación bundled en `node_modules/next/dist/docs/` (version-matched) antes de escribir
código de Next. El contenido específico del proyecto MUST permanecer fuera de los marcadores
`<!-- BEGIN:nextjs-agent-rules -->` / `<!-- END:nextjs-agent-rules -->`.

#### Scenario: Agente consulta docs version-matched
- **WHEN** un agente va a realizar trabajo de Next.js
- **THEN** `AGENTS.md` lo dirige a `node_modules/next/dist/docs/` como fuente de verdad por delante de su entrenamiento
