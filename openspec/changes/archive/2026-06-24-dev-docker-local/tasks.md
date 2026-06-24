## 1. Prerrequisito

- [x] 1.1 `upgrade-nextjs-16` aplicado y mergeado a `main` (imagen base de Node alineada con Next 16).
- [x] 1.2 Con la skill `supabase`, confirmado el flujo del CLI (instalado como devDependency `supabase` 2.107.0; se usa con `npx supabase`).

## 2. Supabase local (CLI)

- [x] 2.1 `npx supabase init` → `supabase/config.toml` (con `[db.seed] sql_paths = ["./seed.sql"]`).
- [x] 2.2 `supabase/schema.sql` convertido en migración `supabase/migrations/20260624081113_init_schema.sql` (fuente única); `schema.sql` eliminado para evitar deriva.
- [x] 2.3 Validado `supabase start` + `supabase db reset`: migración + seed aplican sin error. **Hallazgo:** faltaban `GRANT` para los roles del Data API (`anon`/`authenticated`) — la REST API daba 42501 pese a la RLS. Añadido bloque de GRANTs a la migración (latente también para producción).
- [x] 2.4 `supabase status` da `API_URL=http://127.0.0.1:54321` y `ANON_KEY`. **Nota:** este Supabase emite además el nuevo formato `sb_publishable_`/`sb_secret_`; la app usa la `ANON_KEY` (JWT) vía `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 3. Contenedor de la app

- [x] 3.1 `Dockerfile` (target dev, `node:22-alpine`); `docker build` validado OK.
- [x] 3.2 `docker-compose.yml` (servicio `app`, conecta al Supabase local por `host.docker.internal`).
- [x] 3.3 `.dockerignore` (excluye `node_modules`, `.next`, `.env.local`, etc.).
- [x] 3.4 Documentado el modo host-run como alternativa recomendada (hot reload directo); caveat de red del contenedor anotado en `docker-compose.yml`.

## 4. Entorno y variables

- [x] 4.1 `.env.local.example` con `NEXT_PUBLIC_DATA_MODE`, URL local y anon key (valores locales, instrucciones para `supabase status`).
- [x] 4.2 `.env.local` ignorado por git (root `**/.env.local` + `plataforma-masonica/.gitignore` + `supabase/.gitignore`); no hay llaves reales versionadas.

## 5. Documentación y gobernanza

- [x] 5.1 README: nueva sección de desarrollo local (supabase start → status → db reset → app) y producción vía `supabase db push` (migraciones). Renumerado; refs a `schema.sql` actualizadas.
- [x] 5.2 AGENTS.md §8.4 (activación de `docker-expert` + flujo local); referenciado en CLAUDE.md y `openspec/config.yaml`.

## 6. Validación

- [x] 6.1 Desde cero: `supabase start` → `db reset` → lectura por REST API (`/rest/v1/logias` con anon) devuelve las 3 logias del seed (valida migración + GRANTs + RLS + seed).
- [x] 6.2 Modo `mock` intacto (no se tocó código de app; `mock` sigue siendo el valor por defecto para trabajar sin backend).
