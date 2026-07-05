## Why

El `estado` de la cuenta (pendiente / validado / bloqueado) **no se aplica en el servidor**. No existe
`mi_estado()` ni ninguna política RLS que consulte `estado`; la distinción "no validado vs validado"
y el "bloqueado" se aplican **solo en la UI** (`lib/roles.ts`, `nav.ts`). Consecuencias:

- Un hermano **pendiente** puede leer/usar Directorio, Mensajería y Eventos por API directa, pese a
  que §4.2 y §5.1 restringen al no validado a solo Generales y Salud.
- Un hermano **bloqueado** con un token de sesión vigente conserva acceso a los datos hasta que el
  JWT expira: bloquear **no revoca la sesión** ni se comprueba en RLS (solo se verifica en el próximo
  login, `lib/auth.tsx`). §5.1 dice "pierde acceso".
- Trabajos se salva por casualidad (usa `mi_grado()`, que es `null` sin validar), no por diseño.

Pertenece a la **Fase 1 (identidad)** y **toca autorización**. Es la contraparte, del lado del
estado, del endurecimiento por rol ya hecho.

## What Changes

- **BD (migración nueva):**
  - Función `mi_estado()` (`security definer`, lee `perfiles.estado` por `auth.uid()`), con grants
    restringidos a `authenticated` (patrón de `mi_rol()`/`mi_logia()`).
  - Añadir `mi_estado() = 'validado'` a las políticas de lectura de los módulos "solo validados":
    Directorio (`prof_read`, para perfiles de OTROS), Mensajería (`msg_rw`), Eventos
    (`eventos_read`), Trabajos (`trabajos_read`), Tenidas (`tenidas_read`) y las lecturas de
    Cumplimientos (pagos/asistencias propios).
  - Bloquear al **bloqueado** en todo: las políticas de Generales y Salud del propio dueño pasan a
    exigir `mi_estado() <> 'bloqueado'` (un pendiente sí puede llenarlas; un bloqueado no).
- **App:**
  - Comprobación de estado en cada request (middleware o layout servidor de `(app)`): si el usuario
    está `bloqueado`, cerrar sesión y redirigir a una pantalla de "cuenta bloqueada"; si está
    `pendiente`, restringir la navegación a Generales/Salud.
  - Alinear `nav.ts` para no mostrar a no validados los módulos restringidos (hoy Eventos y
    Cumplimientos usan `show:()=>true`).

## Capabilities

### New Capabilities
- `enforcement-estado`: aplicación en el servidor del estado de cuenta (pendiente/validado/bloqueado)
  sobre el acceso a módulos, incluyendo la revocación efectiva del acceso al bloquear.

## Impact

- **Código:** migración nueva; middleware/layout de `(app)`; `nav.ts`. Posible pantalla "cuenta
  bloqueada".
- **Seguridad:** cierra el acceso por API de no validados y de bloqueados con token vivo.
- **Interacción:** se compone con `alcance-gran-secretario` (ambas condiciones se aplican con AND en
  las lecturas de tenidas/generales).

## Non-goals

- No cambia el flujo de validación (asignar grado ya existe).
- No borra datos del bloqueado (solo revoca acceso, §5.1).
- No aborda el alcance agregado del Gran Secretario (propuesta aparte).
