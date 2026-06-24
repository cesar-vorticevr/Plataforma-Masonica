# CLAUDE.md

Este proyecto documenta sus convenciones, arquitectura, dominio y flujo de trabajo en
**[`AGENTS.md`](./AGENTS.md)**. Léelo primero: es la fuente de verdad para colaborar.

Puntos rápidos (el detalle está en `AGENTS.md`):

- La app Next.js vive en **`plataforma-masonica/`**, no en la raíz.
- Requisitos funcionales completos: **`Plataforma_Masonica_Especificacion.docx`** (raíz).
- Estrategia de producto: **[`PRODUCT.md`](./PRODUCT.md)** (registro, usuarios, propósito, marca,
  anti-referencias, principios). Lo leen las skills de diseño junto con `DESIGN.md`.
- Sistema de diseño: **[`DESIGN.md`](./DESIGN.md)** (formato Google design.md). **Todo cambio de
  UI debe cumplirlo**; si el diseño debe evolucionar, actualiza `DESIGN.md` y el tema
  (`tailwind.config.ts`/`globals.css`) en el mismo cambio. Ver `AGENTS.md` §8.1.
- Skills de diseño (locales en `.agents/skills/`, versionadas): **usar siempre en trabajo de UI**.
  Producto/dashboard → **impeccable** (+ **ui-ux-pro-max**); público/landing → **design-taste-frontend**
  (+ **ui-ux-pro-max**). Las skills asesoran, pero **`DESIGN.md` manda** sobre ellas. Ver `AGENTS.md` §8.2.
- Skills de Supabase/Postgres (locales, versionadas): **usar siempre en trabajo de datos/backend**.
  **supabase** = integración (Auth/`@supabase/ssr`, DB, RLS segura, Storage, migraciones);
  **supabase-postgres-best-practices** = rendimiento/diseño de SQL, índices, esquema y rendimiento de RLS.
  Es el grueso del cableado de producción. No confíes en el conocimiento previo (verifica contra
  docs/changelog); RLS por logia/grado; nunca `user_metadata` para autorización. Ver `AGENTS.md` §8.3.
- Trabajamos con **SDD vía OpenSpec** (`openspec/`, schema `spec-driven`). Ciclo:
  `/opsx:explore` → `/opsx:propose` → `/opsx:apply` → `/opsx:archive`.
- **No implementar en modo explore.** Crear artefactos OpenSpec está bien; escribir código de
  aplicación no.
- Restricciones no negociables: **RBAC en el servidor (RLS)**, **salud individual privada**
  (admins solo ven agregado/anonimizado), **consentimiento** antes de Salud, **palabras clave
  cifradas**. Cumplimiento LFPDPPP 2025. Ver `AGENTS.md` §7.
- El dominio se nombra en **español**; mantén `lib/types.ts` y `supabase/schema.sql` sincronizados.

Antes de cerrar trabajo: `npm run typecheck` y `npm run lint` (dentro de `plataforma-masonica/`).
