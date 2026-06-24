## Context

El stack es Next + Supabase con despliegue a Vercel (Opción A). Para desarrollo local hace falta un
Supabase real (no mock) donde validar auth/RLS/Storage de la Fase 1. El malentendido común es "crear un
contenedor donde se instale Supabase": en realidad el **Supabase CLI ya orquesta ~10 contenedores**
(Postgres, GoTrue, PostgREST, Storage, Realtime, Studio, Kong). No se escribe ese Docker a mano; se
configura el CLI. Lo que el equipo sí decide es si la **app** corre en contenedor propio o en el host.

Este cambio depende de `upgrade-nextjs-16` (la imagen base de Node y el target de build deben ser los de
Next 16, para no construir la imagen dos veces).

## Goals / Non-Goals

**Goals:**
- `supabase start` levanta el stack local; `supabase db reset` reconstruye esquema + RLS desde migraciones.
- App levantable en contenedor (con hot reload) y conectada al Supabase local vía variables de entorno.
- Flujo documentado y reproducible para cualquier hermano; sin secretos versionados.

**Non-Goals:**
- Containerizar para **producción** (producción es Vercel; fuera de alcance).
- Cablear auth/datos reales en el código (eso es Fase 1; aquí solo se monta el entorno).
- Orquestación tipo Kubernetes.

## Decisions

- **Usar el Supabase CLI, no un Postgres a mano.** El CLI da auth, storage y studio equivalentes a
  producción y mantiene paridad. Alternativa (contenedor Postgres propio): pierde Auth/Storage/RLS
  realistas y duplica trabajo. Descartada.
- **`schema.sql` → migración en `supabase/migrations/`.** Hace que `supabase db reset` siembre todo y
  evita la deriva entre el SQL "suelto" y la base local. Mantener sincronía con `lib/types.ts` (AGENTS §8).
  Decisión: las **migraciones** pasan a ser la fuente de verdad del esquema local; `schema.sql` se deriva
  o se reemplaza por la(s) migración(es).
- **App en contenedor vía compose, con host-run soportado.** Se provee el contenedor de desarrollo, pero
  se documenta también correr la app en el host + `supabase start` (común y más rápido en macOS).
- **Conexión app ↔ Supabase local por URL del API** (`NEXT_PUBLIC_SUPABASE_URL`, p. ej. el puerto del
  gateway local) + `anon key` de `supabase status`. En compose, resolver el host del Supabase local
  (red de compose o `host.docker.internal` según topología).
- **Activar la gobernanza de `docker-expert`** (§8.4) en este cambio: aquí empieza el trabajo real de Docker.

## Risks / Trade-offs

- **Hot reload lento en macOS dentro de Docker** (file watching) → bind mounts afinados o polling; o correr la app en host.
- **Conflictos de puertos entre el stack del CLI y el compose** → documentar y fijar puertos.
- **Deriva esquema vs migraciones** → migraciones como fuente única; tarea de verificación con `supabase db reset`.
- **Versión del Supabase CLI** no fijada → documentar/fijar versión para reproducibilidad.
- **Imagen base de Node desalineada con Next 16** → depende de `upgrade-nextjs-16`; tomar el piso de Node de ahí.

## Migration Plan

1. `supabase init`; ajustar `config.toml` (puertos, auth providers email/Google para local).
2. Convertir `supabase/schema.sql` en migración; validar con `supabase db reset`.
3. Añadir `Dockerfile` (dev) + `docker-compose.yml` (app) + `.dockerignore`; imagen base de Node = piso de Next 16.
4. Añadir `.env.local.example` con URL local y `anon key`; confirmar `.env.local` ignorado.
5. Documentar el flujo en README/AGENTS (+ §8.4 `docker-expert`).
6. Validar: `supabase start` → `db reset` → app levanta (contenedor y host) → conecta al API local.
   **Rollback:** eliminar archivos Docker/Supabase-CLI añadidos (no afecta el código de la app).

## Open Questions

- ¿App en contenedor por defecto o correrla en host (preferencia del equipo)?
- ¿Fijar versión del Supabase CLI? ¿Cuál?
- ¿Configurar Google OAuth en local o solo email para desarrollo?
- ¿Quién administra el entorno/responsable técnico (decisión abierta §11 del .docx)?
