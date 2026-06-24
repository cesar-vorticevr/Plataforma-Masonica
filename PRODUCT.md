# Product

> Documento estratégico (quién/qué/por qué) de la Plataforma Masónica de la Gran Logia de Estado
> "Restauración". Complementa a `DESIGN.md` (cómo se ve) y a `AGENTS.md` (cómo se construye).
> Lo lee la skill **impeccable** antes de cualquier trabajo de UI de producto.
> Fuente: `Plataforma_Masonica_Especificacion.docx` (v1.0). Las personalidades de marca y
> anti-referencias son inferidas del contexto institucional y de datos sensibles; ajústalas si hace falta.

## Register

product

## Users

Plataforma **multi-logia** (30+ logias, miles de hermanos) con una cadena de mando jerárquica.
Cada rol entra con un objetivo distinto:

- **Hermano (HH).** Miembro de una logia, con un grado (Aprendiz/Compañero/Maestro). Población
  **heterogénea en edad y alfabetización digital** (incluye adultos mayores, 65+). Su contexto:
  completar su censo de **salud** y **generales**, consultar trabajos de su cámara, eventos,
  directorio profesional y sus **cumplimientos** (pagos/asistencias). Entra ocasionalmente, desde
  teléfono o computadora; necesita flujos simples y sin fricción.
- **Secretario (admin de logia).** Administra su logia: valida hermanos y asigna grado, bloquea,
  cambia la palabra clave, publica eventos, gestiona tenidas, correspondencia y buzón. Es un
  **usuario de trabajo recurrente** que necesita tableros claros y acciones rápidas y seguras.
- **Tesorero.** Acceso especial de su logia. Registra pagos de cápitas en una **matriz por
  hermano/mes** y configura montos. Su tarea es repetitiva y debe ser a prueba de errores.
- **Gran Secretario.** Administra logias y secretarios; ve **datos agregados** de todas las logias
  (nunca salud individual). Contexto: coordinación y reportes a escala estatal.
- **Administrador Master.** Control técnico: catálogos, parámetros globales, la cuenta del Gran
  Secretario y soporte.

Jerarquía de acceso: **Master → Gran Secretario → Secretario (+ Tesorero) → Hermanos**, con
aislamiento por **logia** y por **grado**.

## Product Purpose

Administrar de forma **centralizada y segura** la vida institucional de la Orden: el **padrón** de
hermanos, su **salud preventiva** (tamizaje orientativo, no diagnóstico), su **situación
administrativa** (cápitas y asistencias) y la **comunicación institucional** (eventos,
correspondencia entre secretarios, trabajos por cámara, directorio profesional).

Nace del **Proyecto Salud Integral** (censo de salud) y se amplía a una plataforma integral.
El **éxito** se ve como: adopción real por parte de logias y hermanos; datos sensibles **protegidos
y conformes a la ley** (LFPDPPP 2025); secretarios y tesoreros administrando sin fricción ni errores;
y hermanos completando su salud/generales con confianza. No busca volumen ni "engagement": busca
**confianza, orden y cumplimiento**.

## Brand Personality

Tres palabras: **institucional, discreto, riguroso.**

- **Voz y tono:** formal y respetuoso, propio de la tradición masónica (usa formas como
  *Resp.·. Log.·.*, *Or.·.*, "hermano"). Claro y directo, sin jerga técnica ni coloquialismos.
  En español de México.
- **Metas emocionales:** transmitir **confianza y seguridad** (los datos están bien cuidados),
  **seriedad y orden** (es una institución, no una app de consumo) y **discreción** (lo sensible
  se trata con sobriedad, nunca de forma alarmista ni espectacular).
- En salud: tono **prudente y orientador**, siempre con el deslinde "no sustituye una consulta médica".

## Anti-references

Lo que esta plataforma **no** debe parecer:

- **No** una red social o app de consumo: nada de gamificación, "me gusta", rachas, ni dopamina.
- **No** una startup llamativa: sin gradientes neón, glassmorphism, glows, ni animaciones de marketing.
- **No** una app médica que **diagnostica**: el módulo de salud es **orientativo**; no debe aparentar
  autoridad clínica ni dar veredictos. Evitar estética de "resultado de laboratorio" definitivo.
- **No** un panel saturado de color o de adornos: el color tiene significado (estados, semáforo),
  no decoración.
- **No** exponer datos sensibles o de contacto "porque caben en pantalla": la discreción manda.

## Design Principles

1. **Confianza por discreción.** La seriedad, la privacidad y el orden comunican calidad mejor que
   el adorno. Si dudas entre "más vistoso" y "más sobrio", elige sobrio.
2. **Claridad sobre densidad.** Las pantallas son tableros densos (pagos, asistencias, estadísticas);
   la prioridad es la **jerarquía de la información** y la legibilidad, no caber más cosas.
3. **El permiso es parte del diseño.** Cada rol ve solo lo que le corresponde; la UI **nunca** expone
   de más (salud individual solo del propio hermano; administradores ven solo agregado/anonimizado).
   Diseñar las vistas desde el permiso, no rodearlo.
4. **Orientar, no diagnosticar.** El módulo de salud informa, previene y deriva al médico, con
   deslinde claro y semáforo prudente; jamás aparenta un diagnóstico.
5. **Accesible para todos los hermanos.** Pensado también para adultos mayores y baja alfabetización
   digital: texto legible, flujos cortos, lenguaje claro, objetivos táctiles amplios, español MX.

## Accessibility & Inclusion

- **WCAG 2.1 AA** como mínimo. Contraste de texto verificado (cuerpo ≥ 4.5:1; texto grande ≥ 3:1).
- **Nunca comunicar estado solo con color:** el semáforo de salud y los badges usan **color + texto
  + ícono** (p. ej. `● Verde/Amarillo/Rojo`).
- **Adultos mayores y baja alfabetización digital:** tamaños de fuente cómodos, jerarquía evidente,
  formularios simples por pasos, mensajes en lenguaje llano.
- **Responsive real:** funciona en teléfono (la app nativa es fase posterior). Las matrices anchas
  permiten **scroll horizontal** antes que romperse.
- **Movimiento:** respetar `prefers-reduced-motion`; la animación es funcional, nunca decorativa.
- **Idioma y formato:** español (MX), fechas y números en formato MX.
- **Datos sensibles:** la accesibilidad no puede comprometer la privacidad; los avisos de
  consentimiento y el aviso de privacidad deben ser legibles y comprensibles.
