## 1. Script de verificación

- [x] 1.1 Crear `plataforma-masonica/scripts/check-encoding.mjs` (Node ESM, sin dependencias) que
  recorra el árbol del repo de forma recursiva.
- [x] 1.2 Excluir rutas no fuente: `node_modules/`, `.next/`, `.git/`, `dist/`, `coverage/` y
  binarios; incluir extensiones de texto (`.ts/.tsx/.js/.mjs/.sql/.md/.json/.css`).
- [x] 1.3 Detectar firmas de mojibake (pares `Ã`/`Â` + rango típico) y caracteres de control C1
  (`\x80-\x9F`) indebidos; acumular hallazgos con ruta y línea.
- [x] 1.4 Reportar cada hallazgo como `ruta:línea: <fragmento>` y salir con código 1 si hay
  hallazgos, o mensaje OK y código 0 si no.

## 2. Integración

- [x] 2.1 Añadir `"check:encoding": "node scripts/check-encoding.mjs"` a los `scripts` de
  `plataforma-masonica/package.json`.
- [x] 2.2 Documentar en `AGENTS.md`/`CLAUDE.md` que el cierre de trabajo incluye `npm run
  check:encoding` junto a `lint` y `typecheck`.

## 3. Verificación

- [x] 3.1 Ejecutar `npm run check:encoding` sobre el repo actual y confirmar que pasa (salida 0),
  ya que `lib/health.ts` está limpio.
- [x] 3.2 Probar la detección con un caso corrupto temporal (p. ej. `Â¿CuÃ¡l`) y confirmar que el
  check falla (salida ≠ 0) reportando archivo y línea; luego revertir el caso de prueba.
- [x] 3.3 Confirmar que `npm run lint` y `npm run typecheck` siguen en verde.
