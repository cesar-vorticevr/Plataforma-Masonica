## Why

El módulo de Salud maneja **datos personales sensibles** (LFPDPPP 2025, §8). La ley exige
consentimiento **expreso y previo** para datos de salud, con fecha y versión, y mecanismos ARCO /
revocación. Hoy:

- El consentimiento se exige **solo en la UI** (`SaludClient.tsx`): la RLS `salud_owner` permite
  `INSERT` en `evaluaciones_salud` sin comprobar que exista consentimiento. Una llamada directa a la
  API guarda datos de salud sin consentir. §8.1 exige control en el servidor, no solo en interfaz.
- La `ip` del consentimiento nunca se captura (la columna existe pero `registrarConsentimiento` no la
  escribe), debilitando la prueba del consentimiento.
- No hay mecanismo **in-app** de derechos ARCO ni de **revocación** del consentimiento; solo un correo
  en el aviso de privacidad. No existe forma de que el hermano acceda/exporte o **borre** sus datos de
  salud desde la plataforma.

Pertenece a la **Fase 1** y es un **requisito de cumplimiento legal** sobre datos sensibles (riesgo
de sanción). La barrera de privacidad de lectura (solo el dueño ve su salud) ya está correcta; lo que
falta es el consentimiento previo **forzado en servidor** y los mecanismos ARCO.

## What Changes

- **BD (migración nueva):**
  - Trigger `BEFORE INSERT` en `evaluaciones_salud` que exige un consentimiento vigente
    (`consentimientos` del `usuario_id` con la versión de aviso actual). Sin consentimiento → excepción.
  - Captura de `ip` (y opcionalmente user-agent) del consentimiento en el servidor, leyendo las
    cabeceras de la petición (GUC `request.headers`) en `registrarConsentimiento`/insert.
  - RPC de **revocación** de consentimiento y de **borrado** de las evaluaciones de salud propias
    (derecho de cancelación), con guard por dueño.
- **App:**
  - Sección ARCO en `/privacidad` o en `/salud`: revocar consentimiento, exportar mis datos, borrar
    mis evaluaciones de salud. Revocar consentimiento SHALL impedir nuevas evaluaciones.
  - Versión del aviso como **fuente única** (constante compartida) usada por el gate y por el trigger.
- **(Menor)** semáforo propio del bloque de hábitos (§6.3), hoy solo emite etiquetas.

## Capabilities

### New Capabilities
- `consentimiento-salud`: consentimiento previo forzado en el servidor para datos de salud, captura de
  evidencia (fecha/versión/ip) y mecanismos ARCO (acceso/exportación, revocación, cancelación/borrado).

## Impact

- **Código:** migración nueva (trigger + RPCs), `lib/data/salud.ts`, UI de Salud/Privacidad.
- **Legal/Privacidad:** cumple consentimiento previo y ARCO sobre datos sensibles.
- **Externo (fuera de código):** el **texto legal** del aviso de privacidad y la **leyenda de deslinde
  médico** deben ser validados por abogado y médico respectivamente (§11-#9/#10); esta propuesta deja
  el mecanismo y el versionado listos.

## Non-goals

- No redacta el texto legal ni la leyenda médica (validación externa).
- No cambia el cálculo de puntajes/semáforos metabólico/oncológico (ya correctos), salvo el añadido
  menor de hábitos.
- No toca la barrera de lectura de salud (ya correcta: solo el dueño).
