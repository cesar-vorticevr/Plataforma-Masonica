# AGENTS.md — Plataforma Masónica · Gran Logia de Estado "Restauración"

Guía para agentes de IA y personas que colaboran en este repositorio. Léela antes de
proponer o escribir código. El idioma del dominio es **español** (términos, datos y UI);
el código usa identificadores en español cuando nombran conceptos del dominio.

> **Fuente de requisitos:** `Plataforma_Masonica_Especificacion.docx` (v1.0, junio 2026) en la
> raíz del repo. Ante cualquier duda funcional, ese documento manda. Este archivo resume lo
> esencial para trabajar a diario; no lo sustituye.
>
> **Sistema de diseño:** `DESIGN.md` (raíz, formato Google design.md) define tokens (color,
> tipografía, formas, espaciado) y reglas de UI. **Todo cambio que toque la interfaz debe
> cumplirlo.** Ver §8.1.
>
> **Estrategia de producto:** `PRODUCT.md` (raíz) define registro, usuarios, propósito,
> personalidad de marca, anti-referencias y principios de diseño. Es el "quién/qué/por qué"
> que leen las skills de diseño. Ver §8.2.

---

## 1. Qué es

Plataforma web (con visión a app móvil) para que la Gran Logia y cada logia administren:
el **padrón de hermanos**, su **salud preventiva** (tamizaje orientativo, *no* diagnóstico),
su **situación administrativa** (cápitas y asistencias) y la **comunicación institucional**.
Diseñada para crecimiento estatal: **30+ logias**, miles de hermanos, con **aislamiento de
datos por logia y por grado**.

**No** emite diagnósticos médicos. **No** procesa pagos en línea (el tesorero solo registra).
**No** es expediente clínico ni telemedicina.

---

## 2. Stack y estructura

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript** (strict) · **Tailwind CSS 3**
- **Supabase** (Postgres + Auth email/Google + Storage + RLS) como backend de producción
- Despliegue objetivo: Vercel + Supabase (Opción A de la especificación)

La aplicación vive en **`plataforma-masonica/`** (no en la raíz). OpenSpec y los docs viven en
la raíz.

```
plataforma-masonica/
  app/
    layout.tsx, page.tsx           Landing / shell raíz
    login/  register/  privacidad/ Auth y aviso de privacidad (modelo)
    (app)/                         Área privada (requiere sesión)
      layout.tsx                   AppShell + navegación por rol
      dashboard/ salud/ generales/ directorio/ mensajes/ eventos/
      trabajos/ buzon/ correspondencia/ tesoreria/ tenidas/
      cumplimientos/ estadisticas/ admin/
  components/
    layout/  AppShell.tsx, AuthCard.tsx, nav.ts (navegación filtrada por permisos)
    ui/      index.tsx (primitivos compartidos)
  lib/
    types.ts        Tipos centrales del dominio + labels (ROL_LABEL, GRADO_LABEL, …)
    roles.ts        RBAC en cliente: can.*, accesoCompleto(), puedeVerTrabajo()
    health.ts       Cuestionario + lógica de semáforo/etiquetas (ORIENTATIVA)
    auth.tsx        Contexto de sesión (Supabase Auth)
    data/
      store.ts      Capa de acceso a datos (HOY: localStorage en memoria)
      seed.ts       Datos de demostración
    format.ts       Utilidades de formato (fechas MX, etc.)
    supabase/
      client.ts     Cliente de navegador
      server.ts     Cliente de servidor (SSR)
  supabase/
    schema.sql      Esquema completo: enums, tablas, trigger, y TODAS las políticas RLS
```

---

## 3. Cómo correr

```bash
cd plataforma-masonica
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit (correr antes de proponer cierre de tareas)
npm run lint
npm run build
```

### Arranque local (siempre Supabase)

**La app siempre usa Supabase; no hay modo mock.** En local, el Supabase CLI levanta el stack (Docker):

```bash
cp .env.local.example .env.local      # pega URL + keys de `npx supabase status`
npx supabase start                    # Postgres/Auth/Storage… + migraciones + seed
npm run crear:master                  # crea el administrador maestro (contraseña impresa una vez)
npm run dev
```

Primer acceso: el **maestro** (`npm run crear:master` → `scripts/crear-master.mjs`; contraseña
generada con `crypto.randomBytes` y entregada a Supabase Auth, nunca pre-hasheada ni versionada), o
registrarse en `/register` (clave demo local `BOAZ`) y ser validado por un secretario. Detalle del
entorno en §8.4; producción con `.env.prod` (gitignored) + `supabase db push`.

> `lib/data/store.ts` y `seed.ts` (datos mock) se **conservan temporalmente** como respaldo de los
> módulos aún no cableados a Supabase; se retiran **módulo por módulo** conforme cada fase los migra.

---

## 4. Arquitectura: qué está cableado a Supabase

**Auth e identidad ya están sobre Supabase** (registro, login, sesión SSR vía `proxy.ts`, validación
por secretario, RLS, anti-escalada). Los **demás módulos** (salud, generales, tesorería, tenidas,
eventos, directorio, mensajes, trabajos, buzón, correspondencia, cumplimientos, estadísticas,
dashboard) **aún leen de `lib/data/store.ts`** (mock en memoria) y se migran a Supabase **módulo por
módulo** en las fases siguientes.

```
                 ESTADO                          DESTINO (al cablear cada módulo)
auth/identidad   ✅ Supabase                      —
datos módulos    lib/data/store.ts (memoria)  →   supabase.from('tabla')… con RLS
archivos         solo nombre de archivo       →   Supabase Storage (PDF, Word, PNG, JPG)
permisos         lib/roles.ts (UX) + RLS      →   RLS en migraciones (servidor)  ✅
salud agreg.     —                            →   vistas/funciones security definer
```

**Regla de oro:** la seguridad **debe** aplicarse en el SERVIDOR (RLS), no solo en la interfaz.
`lib/roles.ts` es para UX (mostrar/ocultar); la verdad de acceso vive en las **migraciones**
(`supabase/migrations/`). Las dos capas deben mantenerse consistentes.

---

## 5. Glosario del dominio

| Término | Significado |
|---|---|
| **Hermano (HH)** | Usuario miembro. Tiene un **grado** y pertenece a una **logia**. |
| **Logia** | Unidad organizativa. Tiene su propia *palabra clave* de registro y un secretario. |
| **Grado / Cámara** | Aprendiz < Compañero < Maestro. Define qué trabajos puede ver. |
| **Trabajo / Burilado / Trazado** | Documento de estudio según la cámara del autor (Aprendiz=Trabajo, Compañero=Burilado, Maestro=Trazado). |
| **Tenida** | Sesión/reunión de la logia. Genera lista de asistencia. |
| **Cápita** | Cuota periódica del hermano. La administra el tesorero. |
| **Validación** | Acto por el que el secretario confirma al hermano y le asigna grado, habilitando acceso completo. |

**Estados de cuenta:** `pendiente` (solo Generales y Salud) · `validado` (acceso por grado) ·
`bloqueado` (sin acceso, sin borrar datos).

---

## 6. Roles y matriz de permisos (crítico)

Cadena de mando: **Master → Gran Secretario → Secretario (1 por logia) → Hermanos**.
El **Tesorero** recibe acceso especial del secretario, acotado a su logia.

Convención: **Sí** = total · **Prop** = solo lo propio · **Logia** = limitado a su logia ·
**Agreg** = solo agregado/anonimizado · **No** = sin acceso.

| Función | Hno. no valid. | Hno. valid. | Tesorero | Secretario | Gran Secret. | Master |
|---|---|---|---|---|---|---|
| Llenar Generales | Prop | Prop | Prop | Logia | Agreg | Sí |
| Llenar Salud | Prop | Prop | Prop | Agreg | Agreg | Agreg |
| Ver Generales de otros | No | No | No | Logia | Agreg | Sí |
| Directorio / Mensajería prof. | No | Sí | Sí | Sí | Sí | Sí |
| Ver Eventos | No | Sí | Sí | Sí | Sí | Sí |
| Publicar Eventos | No | No | No | Logia | Sí | Sí |
| Buzón interlogial / Correspondencia | No | No | No | Sí | Sí | Sí |
| Subir Trabajos (su cámara) | No | Sí | Sí | Sí | Sí | Sí |
| Ver Trabajos (según grado) | No | Sí | Sí | Sí | Sí | Sí |
| Tesorería / cápitas | No | No | Logia | Logia | Agreg | Sí |
| Calendario de tenidas / asist. | No | No | No | Logia | Agreg | Sí |
| Ver mis Cumplimientos | No | Prop | Prop | Logia | Agreg | Sí |
| Validar / asignar grado / bloquear | No | No | No | Logia | Sí | Sí |
| Cambiar palabra clave de logia | No | No | No | Logia | Sí | Sí |
| Alta de logias y secretarios | No | No | No | No | Sí | Sí |

**Visibilidad de salud (privacidad):** ni Gran Secretario ni Secretario ven el detalle de salud
**individual**; solo estadísticas **agregadas** y etiquetas de riesgo **anonimizadas**.

**Visibilidad de trabajos por cámara:** Aprendiz ve solo Aprendiz; Compañero ve Aprendiz+Compañero;
Maestro ve los tres. Validar en el **servidor**.

---

## 7. Seguridad, privacidad y cumplimiento (no negociable)

La plataforma maneja **datos personales** y, en Salud, **datos personales sensibles**. Aplica la
**Ley Federal de Protección de Datos Personales en Posesión de los Particulares** (vigente desde
el 21-mar-2025; órgano regulador: Secretaría Anticorrupción y Buen Gobierno).

Reglas que todo cambio debe respetar:

- **Consentimiento expreso** (casilla del aviso de privacidad, registrado con fecha y versión)
  **antes** de llenar el módulo de Salud. Tabla `consentimientos`.
- **Salud individual = solo el propio hermano.** Administradores solo ven agregado/anonimizado.
- **RBAC en el servidor** (RLS), con aislamiento por logia y por grado. No confiar en el cliente.
- **Hash fuerte** (bcrypt/argon2 vía Supabase Auth) para contraseñas; las **palabras clave**
  general y de logia se guardan **cifradas (hash)**, nunca en texto plano.
- **HTTPS/TLS** en tránsito; cifrado en reposo de BD y archivos.
- **2FA recomendado** para secretarios, tesoreros y Gran Secretario.
- **Bitácora de auditoría** de acciones administrativas y accesos a datos sensibles (tabla `auditoría`).
- Minimización de datos y política de retención.
- El módulo de Salud **siempre** muestra la leyenda "no sustituye una consulta médica".
- La lógica de `lib/health.ts` y el texto del aviso de privacidad deben ser validados por un
  **médico** y un **abogado** respectivamente (decisiones abiertas; ver §11 de la especificación).

---

## 8. Convenciones de código

- **Idioma:** identificadores y datos del dominio en **español** (`Usuario`, `Logia`, `validarUsuario`,
  `puntaje_metabolico`). Mantén la consistencia con `lib/types.ts`.
- **Tipos:** TypeScript `strict`. Reutiliza los tipos y `labels` de `lib/types.ts`; no dupliques enums.
  Mantén los enums de TS y los `enum` de `schema.sql` sincronizados.
- **Permisos:** toda decisión de UI pasa por `lib/roles.ts` (`can.*`, `accesoCompleto`,
  `puedeVerTrabajo`). Si agregas una pantalla, agrega su permiso ahí y refléjalo en `nav.ts`.
- **Datos:** todo acceso a datos pasa por `lib/data/store.ts`. Al cablear Supabase, conserva las
  firmas de esas funciones y reemplaza su interior por consultas — así la UI no cambia.
- **Estilo:** Tailwind con los tokens del tema (`navy`, `royal`, `gold`, `ink` en
  `tailwind.config.ts`). Diseño **responsive** desde el inicio. Fechas y formato **MX**, español.
- **UI:** sigue el sistema de diseño (§8.1). Reutiliza los primitivos de `components/ui`; no
  recrees estilos con clases sueltas ni hardcodees colores hex cuando exista un token.
- **Antes de cerrar trabajo:** `npm run typecheck` y `npm run lint` deben pasar.

### 8.1 Sistema de diseño (DESIGN.md)

`DESIGN.md` (raíz) es la **fuente de verdad del diseño**, en formato Google **design.md**:
frontmatter YAML con tokens (`colors`, `typography`, `rounded`, `spacing`, `components`) y
secciones en prosa (Brand & Style, Colors, Typography, Layout, Elevation, Shapes, Components,
Do's & Don'ts). Documenta el sistema **real** implementado en `tailwind.config.ts`,
`app/globals.css` y `components/ui/index.tsx`.

Reglas para cualquier cambio que toque la UI:

- **Cumple los tokens y las reglas de DESIGN.md.** Usa los tokens del tema y los primitivos de
  `components/ui`; no introduzcas familias tipográficas, tamaños, radios o colores fuera de los definidos.
- **Respeta los Do's & Don'ts** (estética institucional sobria; semáforo con redundancia
  color+texto+ícono, nunca solo color; sin glassmorphism/glows; `gold` solo como acento).
- **Si el diseño necesita evolucionar**, primero actualiza `DESIGN.md` *y* el tema en
  `tailwind.config.ts`/`globals.css` (deben quedar sincronizados), y solo después usa el token nuevo.
- **El diseño nunca rodea los permisos:** no muestres datos sensibles a quien no debe verlos (§6–§7).

### 8.2 Skills de diseño (uso obligatorio en trabajo de UI)

El repo trae **tres skills de diseño instaladas localmente** (en `.agents/skills/`, con symlinks en
`.claude/skills/`; versionadas con el repo, no globales). **Para cualquier trabajo de UI/diseño**
—crear o modificar pantallas, componentes, estilos, paletas, layout, accesibilidad— **debes apoyarte
en estas skills**, además de cumplir `DESIGN.md`:

| Skill | Cuándo usarla aquí |
|---|---|
| **impeccable** | Tarea principal para **UI de producto**: dashboards, app shell, formularios, tablas, módulos (la mayor parte de la app, el área `(app)/`). Diseñar, auditar, pulir. Lee `DESIGN.md` (y `PRODUCT.md` si existe) en su setup; usa el registro **product**. |
| **ui-ux-pro-max** | Decisiones de **inteligencia de diseño**: elegir/validar estilos, paletas, tipografía, componentes, charts; review de UX, accesibilidad y consistencia visual. Útil en planeación y revisión. |
| **design-taste-frontend** | Solo **superficies públicas/marketing**: landing (`app/page.tsx`), login/registro, aviso de privacidad. **No** la uses para dashboards, tablas ni UI de producto multi-paso (su propio alcance lo excluye). |

Reglas:

- **`DESIGN.md` es la fuente de verdad y manda sobre las skills.** Las skills asesoran y elevan la
  calidad, pero **operan dentro** del sistema de diseño y del modelo de permisos. Si una skill sugiere
  algo que contradice `DESIGN.md` (p. ej. glassmorphism/glows, fuentes o colores fuera de tokens),
  gana `DESIGN.md`. Si de verdad conviene cambiar el sistema, primero actualiza `DESIGN.md` + el tema.
- **Ruta por superficie:** producto/dashboard → impeccable (+ ui-ux-pro-max); público/landing →
  design-taste-frontend (+ ui-ux-pro-max).
- Las skills **corren con permisos completos**; revísalas antes de ejecutar sus scripts. (`ui-ux-pro-max`
  fue marcada *High Risk* en la evaluación "Gen" del instalador.)
- Gestión: `npx skills add/list` desde la raíz del repo. El lockfile es `skills-lock.json`.
- **Contexto que leen las skills:** `PRODUCT.md` (estratégico: quién/qué/por qué) y `DESIGN.md`
  (visual), ambos en la raíz. impeccable los carga en su setup. Mantenlos actualizados si cambia
  el producto o el sistema de diseño.

### 8.3 Skills de Supabase / Postgres (uso obligatorio en trabajo de datos/backend)

El repo trae **dos skills oficiales de Supabase** instaladas localmente (en `.agents/skills/`, con symlinks
en `.claude/skills/`; versionadas con el repo). Son **complementarias**:

| Skill | Cuándo usarla | Enfoque |
|---|---|---|
| **supabase** | CUALQUIER tarea de Supabase: Auth (`@supabase/ssr`, sesiones, JWT, cookies), DB, **RLS correcta/segura**, Storage, Realtime, Edge Functions, migraciones, CLI/MCP. | *Cómo integrar* Supabase. |
| **supabase-postgres-best-practices** | Escribir/revisar/optimizar **SQL, esquemas y configuración** de Postgres: rendimiento de queries, índices, query plans, pooling, diseño de esquema y **rendimiento de RLS**. | *Que el SQL sea rápido y bien diseñado.* |

Se solapan en **RLS** desde ángulos distintos: `supabase` cuida la **corrección/seguridad** de las políticas;
`supabase-postgres-best-practices` cuida su **rendimiento** (p. ej. envolver `auth.uid()` en subconsulta,
indexar las columnas de las políticas). Aplica ambas cuando toques RLS.

En este proyecto eso es, sobre todo, el **cableado de producción** descrito en §4: reemplazar el mock por
Supabase real — auth en `lib/auth.tsx`, consultas en `lib/data/store.ts`, archivos en Storage, y las
políticas/vistas de `supabase/schema.sql`. **Atención al rendimiento de RLS a escala:** las políticas de
`schema.sql` invocan funciones (`mi_logia()`, `mi_rol()`, `mi_grado()`) por fila; con 30+ logias y miles
de hermanos, optimízalas siguiendo `supabase-postgres-best-practices` (subconsultas, índices por `logia_id`/`usuario_id`).

Reglas (las skills las refuerzan y deben respetarse junto con §7):

- **No confíes en el conocimiento previo:** Supabase cambia seguido; la skill exige verificar contra el
  changelog y los docs actuales antes de implementar.
- **Verifica con una query de prueba** tras cada cambio; un arreglo sin verificación está incompleto.
- **RLS en toda tabla de esquema expuesto** (`public`), con políticas acordes al modelo de acceso real
  (por logia y por grado), no un `auth.uid()` genérico para todo.
- **Nunca uses `user_metadata`/`raw_user_meta_data` para decisiones de autorización** (es editable por el
  usuario): usa `app_metadata`. Esto es crítico para el rol y la logia/grado de cada hermano.
- Mantén `supabase/schema.sql` (Postgres) y `lib/types.ts` (TS) **sincronizados** (§8) y conserva las
  firmas de `lib/data/store.ts` al migrar (§4).
- Las skills **corren con permisos completos** (Snyk: supabase Med, supabase-postgres-best-practices Low);
  revísalas antes de ejecutar sus scripts.

### 8.4 Entorno de desarrollo local (Docker) y skill `docker-expert`

El desarrollo contra Supabase real se hace **en local**, vía el **Supabase CLI** (instalado como
devDependency; corre con `npx supabase ...`), que levanta su propio stack en Docker. La app puede
correr en el host (recomendado) o en su propio contenedor.

**Flujo de arranque** (desde `plataforma-masonica/`):

1. `cp .env.local.example .env.local` y rellena la `anon key` (paso 4).
2. `npx supabase start` — levanta Postgres/Auth/Storage/Studio/… (Docker). Aplica migraciones + `seed.sql`.
3. `npx supabase status` — copia `API URL` (`http://localhost:54321`) y `anon key` a `.env.local`.
4. App: `npm run dev` en el host (más simple), **o** `docker compose up` (contenedor; ver caveat de red en `docker-compose.yml`).
5. `npx supabase db reset` — reconstruye el esquema + semilla desde cero cuando haga falta.

**Fuente de verdad del esquema:** `supabase/migrations/` (no hay `schema.sql`; se eliminó para evitar
deriva). La semilla local vive en `supabase/seed.sql`. Mantén las migraciones **sincronizadas** con
`lib/types.ts` (§8) y cuida el **rendimiento de RLS** (§8.3). Toda migración nueva: `npx supabase migration new <nombre>`.

**Skill `docker-expert`** (local, versionada): **úsala para trabajo de Docker** — Dockerfile,
`docker-compose.yml`, optimización de imágenes/capas, networking de contenedores. Para el stack de
Supabase local, manda la skill `supabase` (es el CLI quien orquesta esos contenedores, no se escriben a mano).

**Producción NO usa Docker:** el despliegue productivo es Vercel (Opción A). Estos contenedores son
solo para desarrollo local reproducible.

---

## 9. Flujo de trabajo: SDD con OpenSpec

Este repo usa **Spec-Driven Development** con OpenSpec (schema `spec-driven`, ver
`openspec/config.yaml`). El ciclo:

```
  /opsx:explore   →   /opsx:propose   →   /opsx:apply   →   /opsx:archive
  (pensar,            (crear cambio:       (implementar       (mover deltas a
   investigar)         proposal + design    tareas con         specs/ y cerrar)
                       + specs + tasks)     verificación)
```

- **`openspec/specs/`** = verdad establecida (capacidades actuales). *Hoy vacío* — se poblará
  como segunda etapa, capturando los módulos existentes como specs de capacidad.
- **`openspec/changes/`** = cambios propuestos en curso (cada uno con `proposal.md`, `design.md`,
  `specs/<capability>/spec.md` con deltas, y `tasks.md`).

Reglas de operación:

- **No implementes en modo explore.** Explorar es pensar; crear artefactos OpenSpec está bien,
  escribir código de aplicación no.
- **Un cambio = una capacidad/feature acotada.** Alinea cada cambio con una fase del roadmap (§10).
- **Todo cambio de UI se revisa contra `DESIGN.md` (§8.1).** Si introduce o modifica estilos,
  verifica que cumple el sistema de diseño; si el sistema debe cambiar, actualiza `DESIGN.md`
  y el tema en el mismo cambio.
- Comandos útiles: `openspec list`, `openspec list --specs`, `openspec validate`,
  `openspec show <item>`, `openspec status --change <name>`.
- Antes de proponer, lee la especificación (.docx) y las **decisiones abiertas** (§11 de ese doc):
  catálogo de logias, validación médica del cuestionario, aviso de privacidad legal, reglas de
  cápita, campos editables por el secretario, política de archivos, etc.

---

## 10. Roadmap (fases de la especificación)

| Fase | Entregable | Contenido |
|---|---|---|
| **0** | Definiciones | Catálogo de logias/grados, administradores, validación médica del cuestionario, aviso de privacidad legal. |
| **1 (MVP)** | Censo + identidad | Registro/login (palabra clave + Google), validación por secretario, Generales y Salud con histórico y etiquetas. |
| **2** | Administración | Tesorería y cápitas, calendario de tenidas y asistencia, panel de Cumplimientos. |
| **3** | Comunicación | Eventos, buzón interlogial, correspondencia digital, Trabajos/Burilados/Trazados por cámara. |
| **4** | Red profesional | Perfil profesional, directorio con buscador, mensajería interna. |
| **5** | Mejoras | Reportes/exportación, app móvil, posible cobranza en línea. |

La demo ya prototipa pantallas de todas las fases; el trabajo real es **cablear producción** fase
por fase, empezando por **Fase 1 (auth real + datos reales sobre Supabase)**.

---

## 11. Errores a evitar

- Aplicar permisos solo en la UI y olvidar la RLS del servidor.
- Exponer salud individual a administradores (debe ser agregada/anonimizada).
- Permitir ver trabajos de cámaras superiores (validar nivel en servidor).
- Guardar palabras clave en texto plano.
- Romper la simetría entre `lib/types.ts` (TS) y `supabase/schema.sql` (Postgres).
- Cambiar firmas de `lib/data/store.ts` al migrar (rompe la UI innecesariamente).
- Iniciar el módulo de Salud sin registrar el consentimiento.
- Mezclar inglés en términos del dominio.
- Introducir estilos fuera de `DESIGN.md` (colores hex sueltos, fuentes/tamaños/radios nuevos,
  glassmorphism/glows) o comunicar estado solo con color.
- Cambiar el tema (`tailwind.config.ts`/`globals.css`) sin actualizar `DESIGN.md`, o viceversa.
