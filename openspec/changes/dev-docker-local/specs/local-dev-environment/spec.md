## ADDED Requirements

### Requirement: Supabase local reproducible

El proyecto SHALL incluir la configuración del Supabase CLI (`supabase/config.toml`) de modo que
`supabase start` levante el stack local (Postgres, Auth, PostgREST, Storage, Realtime, Studio) en
contenedores Docker. El esquema y las políticas RLS MUST poder reconstruirse desde migraciones bajo
`supabase/migrations/` con `supabase db reset`, sin pasos manuales.

#### Scenario: Levantar el stack local
- **WHEN** un desarrollador ejecuta `supabase start` en el repo
- **THEN** el stack local arranca y `supabase status` muestra la URL del API y la `anon key`

#### Scenario: Reconstruir esquema y RLS
- **WHEN** se ejecuta `supabase db reset`
- **THEN** la base local queda con todas las tablas, enums, triggers y políticas RLS del esquema, sin edición manual

### Requirement: App containerizada conectada a Supabase local

El proyecto SHALL incluir un `Dockerfile` (target de desarrollo) y un `docker-compose.yml` que
levanten la app y la conecten al Supabase local. La imagen base de Node MUST corresponder al piso de
Next 16. El contenedor de la app SHALL soportar recarga en caliente (hot reload) en desarrollo.

#### Scenario: App levanta en contenedor y conecta a Supabase local
- **WHEN** se ejecuta el `docker-compose` de desarrollo con el Supabase local arriba
- **THEN** la app sirve en el puerto esperado y puede alcanzar la URL del API de Supabase local

#### Scenario: Hot reload en desarrollo
- **WHEN** se edita un archivo de la app con el contenedor de desarrollo corriendo
- **THEN** el cambio se refleja sin reconstruir la imagen

### Requirement: Variables de entorno cableadas y documentadas

El proyecto SHALL proveer `.env.local.example` con `NEXT_PUBLIC_DATA_MODE`, la URL del Supabase local
y la `anon key`, y documentar el flujo de arranque. NO SHALL versionarse ninguna llave real ni
`.env.local`; el ejemplo MUST usar los valores del Supabase local (no de producción).

#### Scenario: Arranque guiado desde la documentación
- **WHEN** un desarrollador nuevo sigue el flujo documentado (copiar `.env.local.example`, `supabase start`, `supabase db reset`, levantar la app)
- **THEN** obtiene el entorno funcionando sin conocimiento previo del proyecto

#### Scenario: Sin secretos en el repo
- **WHEN** se revisa el repositorio
- **THEN** no hay `.env.local` ni llaves reales versionadas (solo `.env.local.example` con valores locales)
