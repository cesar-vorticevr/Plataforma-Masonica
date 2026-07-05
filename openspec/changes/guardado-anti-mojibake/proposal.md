## Why

El texto del cuestionario de `/salud` se mostraba corrupto (mojibake, p. ej. `Â¿CuÃ¡l`) porque
`lib/health.ts` había quedado con una doble codificación UTF-8→Latin-1→UTF-8 grabada en el propio
fuente. Ya se corrigió el archivo, pero nada impide que el problema vuelva a colarse en otro archivo
tras una edición, pegado o transferencia con codificación equivocada. Queremos un guardado
automático que lo detecte antes de que llegue a producción.

**Fase del roadmap:** transversal / calidad (Fase 5 – Mejoras). No depende de ninguna decisión
abierta del §11 de la especificación.

Este cambio **no toca datos sensibles (salud) ni permisos ni la UI**; es exclusivamente tooling de
calidad de código.

## What Changes

- Nuevo script de verificación de codificación (`npm run check:encoding`) que recorre el código
  fuente y **falla** si encuentra secuencias típicas de mojibake (`Ã`, `Â` seguidas de los patrones
  habituales) o caracteres de control indebidos en archivos de texto.
- El script se integra en el flujo de calidad existente (invocable junto a `lint`/`typecheck`), de
  modo que "antes de cerrar trabajo" también valide la codificación.
- Documentar el guardado en la capacidad `code-quality` como requisito verificable.

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `code-quality`: se añade el requisito de que el código fuente esté libre de mojibake / texto mal
  codificado, verificado por un check automático que forma parte del flujo de calidad.

## Impact

- **Nuevo:** un script de verificación (p. ej. `plataforma-masonica/scripts/check-encoding.mjs`) y
  una entrada en `scripts` de `package.json` (`check:encoding`).
- **Sin CI actualmente:** el repo no tiene `.github/workflows`. El guardado se ejecuta como script
  npm local; si más adelante se añade CI, bastará con incluir `check:encoding` en el pipeline.
- **Sin cambios** en dominio, esquema, RLS, UI ni dependencias de runtime (script en Node puro).
- Riesgo bajo: solo lectura de archivos; su único efecto es fallar el build ante texto corrupto.

## Non-goals

- No reescribe ni "auto-repara" archivos corruptos: solo detecta y reporta (el arreglo es manual y
  revisable).
- No configura un pipeline de CI nuevo (no existe hoy); solo deja el script listo para integrarlo.
- No cambia la codificación declarada del proyecto ni añade `.editorconfig`/git attributes (podría
  ser un cambio futuro complementario).
- No audita contenido en la base de datos ni en Storage; su alcance es el código fuente del repo.
