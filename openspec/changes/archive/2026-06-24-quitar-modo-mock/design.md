## Context

`NEXT_PUBLIC_DATA_MODE` conmuta entre mock (localStorage) y Supabase. Tras montar el Supabase local y
cablear auth, el mock ya no se usará en ningún entorno. Solo **auth/identidad** está cableado a Supabase;
los demás módulos aún leen de `lib/data/store.ts` (mock en memoria) y se migrarán por fases.

## Goals / Non-Goals

**Goals:**
- App siempre Supabase: eliminar el toggle, el `MockAuthProvider`, el selector demo y los hints.
- Script `crear:master` reproducible (local+prod) con contraseña generada de forma segura.
- Plantilla `.env.prod.example`; `MASTER_EMAIL`/`MASTER_PASSWORD` documentados.

**Non-Goals:**
- Borrar `store.ts`/`seed.ts` ni cablear los módulos restantes (Fases 1–4, módulo por módulo).
- Alta de logias/secretarios en Supabase (route handler) — corte posterior.

## Decisions

- **`store.ts`/`seed.ts` se conservan como respaldo temporal.** Quitar el *modo* (toggle + auth mock + UI
  demo) no implica borrar el store: los módulos sin cablear lo seguirán usando hasta su corte. Para un
  usuario real mostrarán vacío (su id no está en el seed) — estado WIP aceptable. Alternativa (borrar todo
  el mock ya): rompería 13 módulos; descartada.
- **Contraseña del maestro: generar, no pre-hashear.** Supabase Auth (GoTrue) hashea con bcrypt al llamar
  `admin.createUser({ password })`. El script genera la contraseña con `crypto.randomBytes` (Node) cuando
  no se provee `MASTER_PASSWORD`, y la imprime una vez. Pre-hashearla rompería el login.
- **Promoción a master con service-role.** Tras crear el usuario, `update perfiles set rol/estado/grado`
  con la service key (el trigger anti-escalada permite `auth.role()='service_role'`). `logia_id` queda nulo
  (el maestro es global, no pertenece a una logia).
- **Carga de entorno con `--env-file`.** `npm run crear:master` usa `node --env-file=.env.local`; para
  producción se documenta `node --env-file=.env.prod scripts/crear-master.mjs`.
- **`AltaRapida` se elimina del admin** (era mock-only). El alta real (Supabase) llegará con un route handler.

## Risks / Trade-offs

- **Service-role en el entorno** → solo en scripts/servidor; `.env.prod` gitignored; nunca `NEXT_PUBLIC_`.
- **Módulos sin cablear muestran vacío** para usuarios reales → esperado; se documenta como WIP por fase.
- **Quitar el toggle puede dejar imports/usos colgando** (`DATA_MODE`) → barrer todos los usos; `typecheck`/`lint` deben pasar.
- **Olvidar correr `crear:master`** dejaría sin forma de entrar tras quitar los demos → documentar en README como paso de arranque.

## Migration Plan

1. Rama desde `main`; Supabase local arriba.
2. Quitar `DATA_MODE` y ramas mock: `client.ts`, `auth.tsx` (solo Supabase), `login`, `register`, `AppShell` (sin selector demo), `admin` (sin `AltaRapida`, sin ramas mock), `identidad.ts` (solo Supabase).
3. Crear `scripts/crear-master.mjs` + script npm; añadir `MASTER_EMAIL`/`MASTER_PASSWORD` a `.env.local`/`.example`.
4. Crear `.env.prod.example`; confirmar `.env.prod` gitignored.
5. Validar: `crear:master` crea el maestro; login del maestro; `typecheck`/`lint`/`build` verdes; un módulo sin cablear no crashea (muestra vacío).
6. Docs (README/AGENTS) sin modo mock; documentar `crear:master` y `.env.prod`. Rollback: revertir rama.

## Open Questions

- Email del maestro (`MASTER_EMAIL`): default `master@restauracion.org.mx`, confirmable/override por el usuario.
- ¿Conviene un `.env.local` versionado como ejemplo además del `.example`? (No; mantener solo `.example`.)
