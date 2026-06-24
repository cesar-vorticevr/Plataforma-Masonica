## ADDED Requirements

### Requirement: Autenticación siempre vía Supabase

La autenticación SHALL realizarse siempre contra Supabase Auth; NO SHALL existir un proveedor de
autenticación mock ni un selector de usuario de demostración. La pantalla de inicio de sesión NO SHALL
mostrar credenciales de demostración.

#### Scenario: Sin selector demo ni credenciales de demostración
- **WHEN** un usuario abre la app
- **THEN** la sesión se resuelve contra Supabase y no hay selector de usuario demo ni lista de correos de demostración
