## Why

Para la Fase 1 (auth + datos reales) hace falta un **Supabase local** donde probar registro, sesiones,
RLS y Storage sin tocar producción. Y para que cualquier hermano colabore con el mismo entorno, conviene
**reproducibilidad por contenedores**. Este cambio monta el entorno de desarrollo local: el stack de
Supabase (vía su CLI, que ya corre en Docker) más la app, con el cableado de variables entre ambos.

Fase del roadmap: **Fase 0 / habilitador de Fase 1** (infraestructura). **Depende de
`upgrade-nextjs-16`**: el contenedor de la app debe construirse sobre el target final de Node/Next 16,
para no rehacer la imagen. No depende de "decisiones abiertas" (§11), salvo confirmar quién administra
el entorno (relacionado con "hospedaje y responsable técnico").

## What Changes

- Inicializar Supabase local con su CLI (`supabase init` → `supabase/config.toml`), que orquesta su
  **propio stack de contenedores** (Postgres, Auth/GoTrue, PostgREST, Storage, Realtime, Studio, Kong).
- Convertir `supabase/schema.sql` en **migración** bajo `supabase/migrations/` para que `supabase db reset`
  reconstruya el esquema + RLS local. `schema.sql` y las migraciones deben quedar como una sola fuente.
- Añadir **Dockerfile** (target de desarrollo) y **`docker-compose.yml`** para la **app**, conectándola
  al Supabase local; añadir `.dockerignore`.
- Añadir **`.env.local.example`** con `NEXT_PUBLIC_DATA_MODE`, URL del Supabase local y `anon key`.
- Documentar el flujo (`supabase start`, `supabase db reset`, levantar la app) en README y AGENTS.md.
- **Activar la gobernanza de `docker-expert`** (nueva §8.4 en AGENTS.md), ahora que sí hay trabajo de Docker.

## Capabilities

### New Capabilities
- `local-dev-environment`: entorno de desarrollo local reproducible — Supabase local (CLI/Docker) + app containerizada, esquema/RLS reconstruibles desde migraciones, y variables de entorno cableadas entre app y Supabase local.

### Modified Capabilities
<!-- Ninguna a nivel de requisitos funcionales. -->

## Impact

- **Archivos nuevos:** `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `supabase/config.toml`, `supabase/migrations/`, `.env.local.example`.
- **Docs:** `AGENTS.md` (flujo Docker + §8.4 `docker-expert`), `README.md`.
- **Sin impacto** en el código de la app ni en la UI; el modo `mock` sigue disponible para trabajar sin backend.
- **Dependencia:** requiere `upgrade-nextjs-16` completado (imagen base de Node alineada con Next 16).
- **Habilita:** la Fase 1 (cablear `lib/auth.tsx` y `lib/data/store.ts` contra el Supabase local) y el uso real de las skills `supabase` y `docker-expert`.
