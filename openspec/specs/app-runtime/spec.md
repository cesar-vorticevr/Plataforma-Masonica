# app-runtime Specification

## Purpose
TBD - created by archiving change upgrade-nextjs-16. Update Purpose after archive.
## Requirements
### Requirement: Runtime sobre Next.js 16

La aplicación SHALL ejecutarse sobre Next.js 16.x con App Router y React 19.x. La build de
producción y el servidor de desarrollo MUST completarse sin errores con la configuración por
defecto del proyecto (Turbopack), o documentar explícitamente el fallback a webpack si se usa.

#### Scenario: Build de producción exitosa
- **WHEN** se ejecuta `npm run build` en `plataforma-masonica/`
- **THEN** la build termina sin errores y reporta Next.js 16.x

#### Scenario: Servidor de desarrollo arranca
- **WHEN** se ejecuta `npm run dev`
- **THEN** la app sirve en `http://localhost:3000` sin errores de arranque

### Requirement: Comportamiento funcional preservado en modo mock

El upgrade NO SHALL cambiar el comportamiento funcional observable. Con
`NEXT_PUBLIC_DATA_MODE=mock`, todas las rutas existentes (login, register, privacidad y el área
`(app)/`: dashboard, salud, generales, directorio, mensajes, eventos, trabajos, buzon,
correspondencia, tesoreria, tenidas, cumplimientos, estadisticas, admin) MUST renderizar y operar
igual que antes del upgrade.

#### Scenario: Las rutas del área privada renderizan
- **WHEN** un usuario de demo navega por cada ruta del área `(app)/` en modo mock
- **THEN** cada página renderiza sin errores de runtime ni de hidratación

#### Scenario: El selector de usuario de demo sigue funcionando
- **WHEN** se cambia de usuario con el selector de demostración
- **THEN** la navegación y los permisos por rol se actualizan como antes

### Requirement: Contrato de APIs de request asíncronas

El código que use las APIs de request de Next (cookies, headers, params, searchParams) MUST
tratarlas como asíncronas con await, conforme al contrato de Next 15+. El cliente de servidor de
Supabase en lib/supabase/server.ts MUST adoptar el patrón de cookies vigente getAll/setAll.

#### Scenario: Cliente de servidor de Supabase compatible
- **WHEN** se construye el cliente de servidor de Supabase en un Server Component o Route Handler
- **THEN** lee/escribe cookies con el API asíncrono vigente sin warnings de deprecación

### Requirement: Calidad estática

El proyecto SHALL pasar verificación de tipos (`tsc --noEmit`) tras el upgrade. Dado que Next 16
eliminó el comando `next lint`, el proyecto SHALL tener ESLint configurado (flat config con
`eslint-config-next`) y ejecutable vía `npm run lint`. La corrección de hallazgos preexistentes de
lint queda FUERA DE ALCANCE de este cambio (se aborda en el cambio `lint-cleanup`); el upgrade NO
SHALL introducir hallazgos de lint nuevos.

#### Scenario: Typecheck pasa
- **WHEN** se ejecuta `npm run typecheck`
- **THEN** termina sin errores

#### Scenario: Lint configurado y ejecutable
- **WHEN** se ejecuta `npm run lint`
- **THEN** ESLint corre con la configuración flat de Next y reporta los hallazgos del proyecto, sin errores introducidos por el upgrade

### Requirement: Backend único Supabase (sin modo mock)

La aplicación SHALL usar Supabase como único backend de datos y autenticación, sin un modo mock
conmutable. El proyecto NO SHALL exponer un toggle de modo de datos en el código ni en el entorno.
La configuración de Supabase (URL y clave publishable/anon) MUST estar presente para que la app opere.

#### Scenario: Sin toggle de modo
- **WHEN** se revisa el código y la configuración
- **THEN** no existe `NEXT_PUBLIC_DATA_MODE` ni un proveedor de autenticación mock

#### Scenario: La app opera contra Supabase
- **WHEN** la app arranca con la configuración de Supabase presente
- **THEN** autenticación y datos cableados usan Supabase (local o producción según el entorno)

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

