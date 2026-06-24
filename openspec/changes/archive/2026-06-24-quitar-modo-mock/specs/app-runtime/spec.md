## ADDED Requirements

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
