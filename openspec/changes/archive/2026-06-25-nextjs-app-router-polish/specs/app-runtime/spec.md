## ADDED Requirements

### Requirement: Página 404 institucional

La aplicación SHALL mostrar una página "no encontrado" propia (`app/not-found.tsx`) conforme a
`DESIGN.md` cuando se solicite una ruta inexistente, en lugar del 404 por defecto de Next. La página
MUST ofrecer una vía de regreso (enlace a inicio/sesión).

#### Scenario: Ruta inexistente
- **WHEN** un usuario navega a una URL que no corresponde a ninguna ruta
- **THEN** ve la página 404 institucional con un enlace para volver a una ruta válida

### Requirement: Error boundary con reintento

La aplicación SHALL incluir un error boundary global (`app/error.tsx`) que capture errores de render
no controlados y ofrezca una acción de **reintento** (`reset()`), con estética conforme a `DESIGN.md`.
El área privada `(app)/` SHALL contener sus errores dentro del `AppShell` (un fallo en una página no
debe tumbar la navegación), mediante un `error.tsx` de segmento.

#### Scenario: Error de render no controlado
- **WHEN** una página lanza un error no controlado durante el render
- **THEN** se muestra el error boundary con un botón de reintento, sin pantalla en blanco

#### Scenario: Error dentro del área privada
- **WHEN** el error ocurre en una ruta de `(app)/`
- **THEN** el fallback se muestra dentro del `AppShell` (la navegación lateral sigue visible)

### Requirement: Estado de carga del área privada

El área `(app)/` SHALL mostrar un estado de carga (`loading.tsx`) mientras sus Server Components
obtienen datos, de modo que la navegación dé feedback inmediato en vez de quedar bloqueada sin señal.

#### Scenario: Navegación a una página que obtiene datos en el servidor
- **WHEN** el usuario navega a una ruta de `(app)/` que hace `await` de datos
- **THEN** ve un estado de carga hasta que el contenido está listo

### Requirement: Metadata por página en el área privada

Cada página del área `(app)/` SHALL definir su propia `metadata` (al menos el título) además del título
raíz, de modo que la pestaña del navegador y los metadatos reflejen la sección actual.

#### Scenario: Título por sección
- **WHEN** el usuario abre una ruta de `(app)/` (p. ej. Salud o Tesorería)
- **THEN** el título del documento corresponde a esa sección, no solo al título raíz
