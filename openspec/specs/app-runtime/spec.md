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

