## Context

`lib/health.ts` acumuló mojibake por una doble codificación (UTF-8 leído como Latin-1 y regrabado
como UTF-8), visible en `/salud` como `Â¿CuÃ¡l`. El archivo ya se corrigió re-decodificando solo las
secuencias corruptas y preservando las líneas ya correctas. Falta una barrera automática que impida
la regresión en cualquier archivo del repo.

El proyecto no tiene CI (`.github/workflows` no existe). Los guardados actuales son scripts npm
(`lint`, `typecheck`) que se corren "antes de cerrar trabajo". La solución debe encajar en ese mismo
flujo, sin dependencias nuevas de runtime.

## Goals / Non-Goals

**Goals:**
- Detectar mojibake y caracteres de control indebidos en el código fuente y **fallar** con salida ≠ 0.
- Reportar archivo y línea de cada hallazgo, para arreglo manual rápido.
- Ejecutable localmente vía `npm run check:encoding`, integrable en un futuro CI sin cambios.
- Cero dependencias nuevas (Node puro, ESM `.mjs` como `scripts/crear-master.mjs`).

**Non-Goals:**
- No auto-reparar archivos (solo detectar; el arreglo es manual y revisable).
- No montar CI nuevo.
- No añadir `.editorconfig`/`.gitattributes` (posible cambio futuro complementario).
- No inspeccionar base de datos ni Storage.

## Decisions

### 1. Script Node puro en `plataforma-masonica/scripts/check-encoding.mjs`
Coherente con el patrón existente (`scripts/crear-master.mjs`, ESM, `engines.node >=20.9`). Se añade
`"check:encoding": "node scripts/check-encoding.mjs"` a `package.json`.
- **Alternativa descartada:** regla ESLint custom → más complejo, atado al parser de JS y no cubre
  archivos no-JS (`.sql`, `.md`, `.json`). Un scanner de texto es más simple y amplio.
- **Alternativa descartada:** depender de `ftfy`/paquete externo → viola el objetivo de cero deps.

### 2. Detección por patrones de mojibake, no "cualquier byte no-ASCII"
El repo es legítimamente UTF-8 con español (acentos, `¿`, `¡`). No podemos prohibir no-ASCII. En su
lugar buscamos las **firmas** del doble-encode: `Ã`/`Â` seguidas del rango típico
(`[\x80-\xBF]` o los caracteres visibles habituales `¡¢£¤¥…`), más caracteres de control C1
(`\x80-\x9F`) que aparecen en mayúsculas acentuadas mal codificadas (`LÃ\x93GICA`).
- **Rationale:** minimiza falsos positivos sobre texto español correcto y aún captura los casos
  reales observados (minúsculas, mayúsculas con control, signos `¿`/`¡`).
- **Alternativa descartada:** intentar `encode('latin-1').decode('utf-8')` y comparar → frágil con
  archivos mixtos (como el propio `health.ts`) y da más falsos positivos.

### 3. Alcance de archivos
Recorrer el árbol del repo incluyendo `.ts/.tsx/.js/.mjs/.sql/.md/.json/.css`, **excluyendo**
`node_modules/`, `.next/`, `.git/`, `dist/`, `coverage/`, `build/` y binarios. Recorrido con `fs`
recursivo.
- Debe cubrir tanto `plataforma-masonica/` como los `.md`/`.sql` de la raíz y `supabase/`.
- **`openspec/` se excluye:** sus artefactos de planificación citan mojibake como ejemplo a
  propósito (documentan esta misma verificación) y no son código/contenido que se envíe. Trade-off:
  una corrupción real dentro de un spec no se detectaría; se acepta por ser meta-documentación
  interna. Descubierto al implementar (el check marcaba los propios artefactos de este cambio).

### 4. Salida
Por cada hallazgo: `ruta:línea: <fragmento>`. Al final, si hay hallazgos, `process.exit(1)`; si no,
mensaje OK y `exit(0)`.

## Risks / Trade-offs

- **Falso positivo:** algún texto legítimo contiene `Ã`/`Â` reales → mitigar acotando el patrón a
  secuencias (par de caracteres), no al carácter aislado; permitir revisión manual del reporte.
- **Falso negativo:** una firma de mojibake no contemplada se cuela → mitigar cubriendo los patrones
  observados y dejando el patrón fácil de ampliar; el check es una red, no una prueba formal.
- **Rendimiento:** recorrer el repo en cada corrida → despreciable excluyendo `node_modules`/`.next`.
- **Sin CI:** el guardado solo actúa si alguien corre el script → mitigar documentándolo junto a
  `lint`/`typecheck` en el flujo de cierre y dejándolo listo para CI.

## Migration Plan

1. Añadir el script y la entrada `check:encoding` en `package.json`.
2. Correrlo sobre el repo actual; debe pasar (el `health.ts` ya está limpio).
3. Documentar en `AGENTS.md`/`CLAUDE.md` que el cierre incluye `check:encoding`.
Rollback: eliminar el script y la entrada de `package.json` (sin efectos secundarios).

## Open Questions

- ¿Extender el patrón para cubrir también BOM UTF-8 (`﻿`) inicial? Se puede añadir sin coste.
- ¿Integrarlo como pre-commit (husky) además del script npm? Fuera de alcance por ahora.
