## 1. Base de datos: RPC de creación

- [x] 1.1 Crear migración nueva en `supabase/migrations/` con la función `crear_logia(p_nombre text, p_numero int, p_oriente text, p_clave text)` `security definer`, guard `es_global()`, que inserta `nombre, numero, oriente, palabra_clave` (con `palabra_clave = extensions.crypt(lower(trim(p_clave)), extensions.gen_salt('bf'))`; `oriente` es NOT NULL) y devuelve el `id`. → `20260704175335_crear_logia.sql` (además valida datos incompletos).
- [x] 1.2 En la misma migración: `revoke all` de `public/anon/authenticated` y `grant execute` a `authenticated`, igual que `set_palabra_logia`.
- [x] 1.3 Aplicar la migración en local (`npx supabase migration up --local`) sin borrar datos existentes.

## 2. Capa de datos

- [x] 2.1 Añadir `adminCrearLogia(sb, {nombre, numero, oriente, clave})` en `lib/data/identidad.ts` que invoca `sb.rpc("crear_logia", …)` y devuelve el id, siguiendo el estilo del archivo.

## 3. UI: tarjeta "Crear logia"

- [x] 3.1 En `AdminClient.tsx`, añadir una tarjeta "Crear logia" visible solo si `global`, con campos nombre + número + oriente + palabra clave (primitivos `Card`/`Input`/`Button`).
- [x] 3.2 Validar en cliente (nombre, oriente y clave no vacíos, número entero) antes de llamar; deshabilitar el botón mientras guarda.
- [x] 3.3 Al crear con éxito, refrescar el listado de logias y seleccionar la nueva (`refrescar(nuevoId)`), limpiando el formulario.

## 4. Verificación de seguridad y datos (Supabase)

- [x] 4.1 Query de prueba: como `master`, ejecutar `crear_logia` y confirmar que se inserta y devuelve id; verificar que `logias.palabra_clave` es un hash. Verificado (psql con claim JWT del master + ruta real cliente→RPC como `authenticated`); hash válido y no en texto plano.
- [x] 4.2 Verificar autorización: como `hermano`, confirmar que `crear_logia` es rechazada por `es_global()`. Verificado: `No autorizado para crear logias`.
- [x] 4.3 Verificar integración con registro: palabra clave hasheada e insensible a mayúsculas/espacios (`crypt('jakin', hash)` coincide para clave "Jakin"), que es la comprobación que hace `verificar_acceso` en `/register`.

## 5. Calidad y diseño

- [x] 5.1 Verificar cumplimiento de `DESIGN.md`: la tarjeta reutiliza primitivos/tokens existentes (`Card`/`Input`/`Button`, error con `text-rose-600 text-sm`), sin colores/fuentes/radios nuevos.
- [x] 5.2 Ejecutar `npm run typecheck` y `npm run lint` dentro de `plataforma-masonica/` y dejarlos en verde.
