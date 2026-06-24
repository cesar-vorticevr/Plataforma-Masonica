## 1. Prerrequisito

- [ ] 1.1 Confirmar que `upgrade-nextjs-16` está completo y mergeado (imagen base de Node = piso de Next 16).
- [ ] 1.2 Con la skill `supabase`, confirmar el flujo y versión vigentes del Supabase CLI (no asumir desde memoria).

## 2. Supabase local (CLI)

- [ ] 2.1 `supabase init` y ajustar `supabase/config.toml` (puertos; auth email, y Google si se decide para local).
- [ ] 2.2 Convertir `supabase/schema.sql` en migración bajo `supabase/migrations/` (fuente única del esquema local).
- [ ] 2.3 Validar `supabase start` y `supabase db reset`: tablas, enums, triggers y RLS quedan correctos.
- [ ] 2.4 Obtener URL del API local y `anon key` (`supabase status`) para el ejemplo de entorno.

## 3. Contenedor de la app

- [ ] 3.1 Crear `Dockerfile` (target de desarrollo) con imagen base de Node alineada a Next 16.
- [ ] 3.2 Crear `docker-compose.yml` para la app, conectada al Supabase local; resolver el host (red de compose / `host.docker.internal`).
- [ ] 3.3 Crear `.dockerignore` (excluir `node_modules`, `.next`, `.env.local`, etc.).
- [ ] 3.4 Verificar hot reload en macOS (bind mounts/polling) o documentar el modo host-run como alternativa.

## 4. Entorno y variables

- [ ] 4.1 Crear `.env.local.example` con `NEXT_PUBLIC_DATA_MODE`, URL del Supabase local y `anon key` (valores locales, nunca de producción).
- [ ] 4.2 Confirmar que `.env.local` está en `.gitignore` y que no hay llaves reales versionadas.

## 5. Documentación y gobernanza

- [ ] 5.1 Documentar el flujo en README y AGENTS.md (`supabase start` → `db reset` → levantar app; contenedor y host-run).
- [ ] 5.2 Añadir §8.4 a AGENTS.md activando la skill `docker-expert` para trabajo de Docker, y referenciarla en CLAUDE.md y `openspec/config.yaml`.

## 6. Validación

- [ ] 6.1 Desde cero (siguiendo solo la documentación): `supabase start`, `db reset`, levantar la app y confirmar que alcanza el API local.
- [ ] 6.2 Confirmar que el modo `mock` sigue funcionando sin Supabase, para trabajo sin backend.
