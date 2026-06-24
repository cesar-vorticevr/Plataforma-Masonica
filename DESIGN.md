---
version: alpha
name: Restauración · Sistema Institucional
description: >-
  Sistema de diseño de la Plataforma Masónica de la Gran Logia de Estado
  "Restauración". Estética institucional, sobria y de confianza: azul marino y
  oro sobre superficies claras, paneles densos en datos, accesible y en español (MX).
  Refleja la implementación real en plataforma-masonica/ (tailwind.config.ts,
  app/globals.css, components/ui/index.tsx). Mantener este archivo y el código en sincronía.
colors:
  # — Marca institucional —
  navy: '#1F3864'              # azul marino: barra lateral, botón primario, títulos, avatar
  navy-hover: '#162a4d'        # hover del botón primario
  royal: '#2E75B6'             # azul medio: foco de inputs, acentos/enlaces
  gold: '#C8A14B'              # oro: acento de marca, botón "gold", subtítulo de logia
  ink: '#1a1d29'              # tinta: color de texto base
  # — Superficies —
  background: '#f4f6fb'        # fondo de la app
  surface: '#ffffff'           # tarjetas, cabecera, modales, inputs
  surface-sidebar: '#1F3864'   # barra lateral de navegación (= navy)
  scrim: 'rgba(0,0,0,0.40)'    # velo de fondo del modal
  # — Texto —
  on-surface: '#1a1d29'        # texto principal sobre superficies claras
  on-surface-variant: '#64748b' # slate-500: texto secundario / subtítulos
  on-surface-muted: '#94a3b8'  # slate-400: texto deshabilitado / estado vacío
  on-surface-strong: '#1e293b' # slate-800: nombre de usuario, énfasis
  on-navy: '#ffffff'           # texto sobre la barra navy
  on-navy-variant: 'rgba(255,255,255,0.80)' # texto secundario sobre navy
  # — Bordes / divisores —
  outline: '#e2e8f0'           # slate-200: borde de tarjetas y cabecera
  outline-strong: '#cbd5e1'    # slate-300: borde de inputs / selects
  outline-on-navy: 'rgba(255,255,255,0.10)' # divisores dentro de la barra navy
  # — Estados (semáforo de salud y badges) —
  success: '#047857'           # emerald-700: texto "verde"
  success-container: '#d1fae5' # emerald-100: fondo del badge verde
  warning: '#b45309'           # amber-700: texto "amarillo"
  warning-container: '#fef3c7' # amber-100: fondo del badge amarillo
  error: '#be123c'             # rose-700: texto "rojo"
  error-container: '#ffe4e6'   # rose-100: fondo del badge rojo
  error-emphasis: '#f43f5e'    # rose-500: contador de notificaciones
  info: '#1d4ed8'              # blue-700: texto informativo
  info-container: '#dbeafe'    # blue-100: fondo del badge informativo
  neutral: '#334155'           # slate-700: texto de badge/botón neutro
  neutral-container: '#f1f5f9' # slate-100: fondo del botón "ghost" / badge neutro
typography:
  page-title:                  # <h1> de PageTitle
    fontFamily: ui-sans-serif, system-ui, Segoe UI, Roboto, Arial
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.25'
  section-title:               # títulos de modal / secciones (text-lg)
    fontFamily: ui-sans-serif, system-ui, Segoe UI, Roboto, Arial
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
  stat-value:                  # cifras grandes en Stat / dashboards
    fontFamily: ui-sans-serif, system-ui, Segoe UI, Roboto, Arial
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  body:                        # texto base (text-sm)
    fontFamily: ui-sans-serif, system-ui, Segoe UI, Roboto, Arial
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label:                       # etiquetas de formulario
    fontFamily: ui-sans-serif, system-ui, Segoe UI, Roboto, Arial
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
  caption:                     # metadatos, ayudas (text-xs)
    fontFamily: ui-sans-serif, system-ui, Segoe UI, Roboto, Arial
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
  badge:                       # texto de badges / chips
    fontFamily: ui-sans-serif, system-ui, Segoe UI, Roboto, Arial
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
rounded:
  DEFAULT: 0.5rem   # botones e inputs (rounded-lg)
  lg: 0.5rem        # botones, inputs, ítems de navegación
  xl: 0.75rem       # tarjetas y modales (rounded-xl)
  full: 9999px      # badges, avatares, contadores de notificación
spacing:
  base: 4px
  gap-sm: 8px        # gap-2
  gap: 12px          # gap-3 (cabecera, ítems de nav)
  gap-md: 16px       # gap-4
  card-padding: 20px # p-5 en Card
  modal-padding: 24px # p-6 en Modal
  content-x-mobile: 16px # p-4 del <main> en móvil
  content-x: 32px        # lg:p-8 del <main> en escritorio
  section-gap: 24px      # mb-6 entre cabecera de página y contenido
  sidebar-width: 256px   # w-64
  container-max: 1152px  # max-w-6xl del área de contenido
  modal-max: 512px       # max-w-lg
components:
  button-primary:
    backgroundColor: '{colors.navy}'
    textColor: '{colors.on-navy}'
    rounded: '{rounded.lg}'
    padding: 8px 16px
    typography: '{typography.label}'
  button-ghost:
    backgroundColor: '{colors.neutral-container}'
    textColor: '{colors.neutral}'
    rounded: '{rounded.lg}'
  button-gold:
    backgroundColor: '{colors.gold}'
    textColor: '{colors.on-navy}'
    rounded: '{rounded.lg}'
  card:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.xl}'
    padding: '{spacing.card-padding}'
  input:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.lg}'
    padding: 8px 12px
  badge:
    rounded: '{rounded.full}'
    typography: '{typography.badge}'
---

## Brand & Style

Este sistema de diseño viste una **plataforma institucional de gestión** para la Gran Logia
de Estado "Restauración". El tono es **sobrio, formal y de confianza** — más cercano a un
sistema administrativo serio (banca, gobierno, salud) que a un producto de consumo. La
jerarquía masónica (Gran Secretaría → secretarios → hermanos) y el manejo de **datos
sensibles** (salud, padrón) exigen una interfaz **calmada, legible y sin estridencias**.

La paleta combina el **azul marino** (autoridad, formalidad) con un **oro** discreto (la
identidad de la Orden) sobre **superficies claras**. Las pantallas son **tableros densos en
datos** (matrices de pagos, asistencias, estadísticas, directorios): la prioridad es la
**claridad y la jerarquía de la información**, no el adorno. El objetivo emocional es que cada
hermano y cada secretario sientan que sus datos están en un entorno **serio, ordenado y seguro**.

Idioma: **español (MX)**. Diseño **responsive desde el inicio** (la app móvil es una fase
posterior, pero la web debe funcionar bien en teléfono).

## Colors

La base es **clara** (`background` gris azulado muy claro, `surface` blanco) para máxima
legibilidad en lecturas largas y tablas. Los acentos son escasos y con significado.

- **Navy (`navy`):** el color institucional dominante. Barra lateral, botón primario, títulos
  (`<h1>`), avatares. Transmite autoridad y estructura.
- **Royal (`royal`):** azul medio reservado para **foco/interacción** — borde y anillo de los
  inputs enfocados, enlaces y acentos secundarios.
- **Gold (`gold`):** acento de **marca**, dosificado. Subtítulo "Restauración" en la barra,
  botón `gold` para acciones destacadas puntuales. Nunca como color de texto de párrafo.
- **Neutros (slate):** toda la escala de texto y bordes (`on-surface-variant`,
  `on-surface-muted`, `outline`, `outline-strong`). Dan profundidad sin recurrir a sombras fuertes.
- **Estados / semáforo de salud:** verde (`success`), amarillo (`warning`) y rojo (`error`),
  cada uno con su variante `-container` para fondos suaves de badge. El rojo intenso
  (`error-emphasis`) se reserva para el **contador de notificaciones**.

Contraste: el texto principal (`on-surface` sobre `surface`/`background`) y el texto blanco
sobre `navy` deben cumplir **WCAG AA**. No comunicar estado **solo con color** (ver Do's & Don'ts).

## Typography

Una sola familia **sans-serif del sistema** (`ui-sans-serif, system-ui, Segoe UI, Roboto, Arial`):
neutra, rápida de cargar, legible en tablas densas y sin costo de fuentes externas. La jerarquía
se construye con **tamaño y peso**, no con familias distintas.

- **Títulos de página** (`page-title`, 24px/700, en `navy`): encabezan cada módulo vía `PageTitle`.
- **Cifras** (`stat-value`, 24px/700): números grandes en `Stat` y tableros.
- **Títulos de sección/modal** (`section-title`, 18px/600).
- **Cuerpo** (`body`, 14px/400): el tamaño de trabajo por defecto de la app.
- **Etiquetas** (`label`, 14px/500) y **leyendas** (`caption`, 12px/400) para formularios y metadatos.

Texto secundario en `on-surface-variant`; texto deshabilitado/vacío en `on-surface-muted`.

## Layout

Estructura de **panel administrativo**: barra lateral fija + área de contenido centrada.

- **Barra lateral** (`sidebar-width` 256px): fondo `navy`, navegación filtrada por permisos
  (`components/layout/nav.ts`). Fija en escritorio; deslizable (off-canvas) en móvil bajo `lg`.
- **Cabecera** pegajosa (`sticky top-0`): superficie blanca con borde inferior `outline`,
  contexto de la logia, identidad del usuario y acciones.
- **Contenido** (`<main>`): centrado con `container-max` (1152px), padding `content-x-mobile`
  (16px) en móvil y `content-x` (32px) en escritorio. Cada página abre con `PageTitle` y deja
  `section-gap` (24px) antes del contenido.
- **Ritmo:** escala de 4px; los gaps usados son 8/12/16px y el padding de tarjeta 20px.
- **Reflujo móvil:** la barra colapsa a off-canvas; las tablas/matrices densas (pagos,
  asistencias) deben permitir **scroll horizontal** antes que romper el layout.

## Elevation & Depth

Profundidad **plana y discreta**, coherente con el tono institucional. No glassmorphism, no
glows de color.

1. **Fondo:** `background` plano.
2. **Tarjetas (`card`):** `surface` blanco + **borde `outline` de 1px** + `shadow-sm` muy sutil
   + `rounded-xl`. El borde, no la sombra, define el contenedor.
3. **Cabecera:** superficie blanca elevada por `sticky` y borde inferior (sin sombra fuerte).
4. **Modal:** `scrim` (negro al 40%) sobre la pantalla + una `card` centrada (`modal-max` 512px).
5. **Barra lateral:** plano `navy`; el ítem activo se eleva con un fondo `white/15`, no con sombra.

## Shapes

Perfil de redondeado **suave y consistente**:

- **`rounded-lg` (0.5rem):** botones, inputs, selects, textareas e ítems de navegación.
- **`rounded-xl` (0.75rem):** tarjetas y modales — el contenedor "grande".
- **`rounded-full`:** badges/chips, avatares y contadores de notificación.

Mantener los radios constantes en hover/activo; no cambiar la forma al interactuar.

## Components

Primitivos en `components/ui/index.tsx`; layout en `components/layout/`. Reutilízalos en lugar
de recrear estilos con clases sueltas.

- **Button** — tres variantes: `primary` (relleno `navy`, texto blanco), `ghost`
  (`neutral-container` con texto `neutral`, para acciones secundarias) y `gold` (acento puntual).
  `rounded-lg`, padding 8×16, tipografía `label`, transición en hover.
- **Card** — contenedor base: `surface`, borde `outline`, `shadow-sm`, `rounded-xl`, padding 20px.
- **PageTitle** — encabezado de módulo: `<h1>` en `navy` + subtítulo opcional en
  `on-surface-variant` + slot de acción a la derecha.
- **Stat** — tarjeta de métrica: etiqueta `caption`, valor `stat-value` en `navy`, sub opcional.
- **Input / Textarea / Select** — superficie blanca, borde `outline-strong`, foco con borde y
  anillo `royal` (`focus:ring-royal/20`); etiqueta superior con estilo `label`.
- **Badge** — chip redondo con pares texto/fondo por color: `slate` (neutro), `green`, `yellow`,
  `red`, `blue`, `gold`. Tipografía `badge`.
- **SemaforoBadge** — badge especializado del módulo de salud: verde/amarillo/rojo con un punto
  (`●`) **además** del texto del nivel; nunca el color por sí solo.
- **Empty** — estado vacío centrado en `on-surface-muted`.
- **Modal** — `scrim` + `card` (`modal-max`), título `section-title`, cierre con `✕`; se cierra
  al hacer clic en el velo.
- **Sidebar nav (AppShell)** — ítems sobre `navy`; activo con fondo `white/15` y peso semibold;
  contador de novedades como pastilla `error-emphasis` `rounded-full`.

## Do's and Don'ts

**Do**
- Reutiliza los primitivos de `components/ui` y los tokens del tema (`navy`, `royal`, `gold`,
  `ink`); añade tokens nuevos al tema y a este archivo antes de usarlos.
- Mantén las superficies claras y el contenido legible; deja respirar las tablas densas.
- Usa el **semáforo con redundancia** (color + etiqueta + ícono `●`) para que sea accesible y
  no dependa solo del color.
- Permite **scroll horizontal** en matrices anchas (cápitas, asistencias) en móvil.
- Conserva los radios (`lg`/`xl`/`full`) y la escala de 4px; respeta `container-max` (1152px).

**Don't**
- No introduzcas familias tipográficas nuevas ni tamaños fuera de la escala definida.
- No uses el `gold` como color de texto de párrafo ni lo apliques en exceso: es un acento.
- No comuniques estado (riesgo, error, éxito) **solo con color**.
- No reemplaces el estilo plano por glassmorphism, sombras intensas o glows de color.
- No incrustes datos sensibles (salud individual, contacto) en la UI de quien no debe verlos:
  el diseño debe **respetar el modelo de permisos** (ver AGENTS.md §6–§7), no rodearlo.
- No hardcodees colores hex en componentes cuando exista un token equivalente.
