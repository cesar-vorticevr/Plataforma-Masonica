## 1. Base de datos (migración, skills: supabase + supabase-postgres-best-practices)

- [x] 1.1 Verificar en el entorno destino que no existan números de logia duplicados: `select numero, count(*) from logias group by numero having count(*) > 1;`. Resolver antes de aplicar la restricción única.
- [x] 1.2 Crear migración en `supabase/migrations/` que añada `alter table logias add constraint logias_numero_unico unique (numero);`.
- [x] 1.3 En la misma migración, actualizar `crear_logia` para rechazar número duplicado (validación explícita con mensaje claro) antes del `insert`, conservando el hash bcrypt de la palabra clave y el guard `es_global()`.
- [x] 1.4 Añadir RPC `editar_logia(p_id uuid, p_nombre text, p_numero int, p_oriente text)` `security definer set search_path = public`: guard `es_global()`; validar nombre/oriente no vacíos y número entero; rechazar número usado por otra logia (`where numero = p_numero and id <> p_id`); `update logias set nombre, numero, oriente`. NO tocar `palabra_clave`. `revoke all ... from public, anon, authenticated` + `grant execute ... to authenticated`.
- [x] 1.5 Añadir RPC `set_estado_logia(p_id uuid, p_estado text)` `security definer set search_path = public`: guard `es_global()`; validar `p_estado in ('activa','inactiva')`; `update logias set estado`. Mismos `revoke/grant` que las demás RPC.
- [x] 1.6 Aplicar migración local (`npx supabase migration up` o reset) y verificar con queries de prueba: editar como `master` funciona; número duplicado falla; `set_estado_logia` alterna estado; un rol no global recibe "No autorizado".
- [x] 1.7 Revisar RLS/rendimiento: confirmar que `logias_admin` respalda las RPC y que la restricción única crea su índice implícito (sin índice redundante). Sin funciones por fila nuevas.

## 2. Capa de datos (lib/data)

- [x] 2.1 En `lib/data/identidad.ts`, añadir `adminEditarLogia(sb, id, { nombre, numero, oriente })` que invoque la RPC `editar_logia`; devolver éxito/error (traducir violación de unicidad a mensaje "número ya en uso").
- [x] 2.2 En `lib/data/identidad.ts`, añadir `adminSetEstadoLogia(sb, id, estado)` que invoque `set_estado_logia`.
- [x] 2.3 Confirmar que `adminListLogias` ya devuelve `estado` (usa `select("*")`); sin cambios necesarios.

## 3. Servidor (/admin page)

- [x] 3.1 En `app/(app)/admin/page.tsx`, destructurar también `logias` de `resolverLogiaActiva` y pasarlo como prop a `AdminClient` (sin fetch nuevo).
- [x] 3.2 Ajustar la firma de props de `AdminClient` para recibir `logias: Logia[]`.

## 4. UI de gestión de logias (skills: impeccable + ui-ux-pro-max; cumplir DESIGN.md)

- [x] 4.1 En `AdminClient.tsx`, añadir la tabla "Logias" (renderizada solo cuando `global`): columnas Nombre, N.°, Oriente, Estado (con `Badge` verde `activa` / gris `inactiva`, color+texto) y acción "Editar" por fila. Reutilizar la estructura de la tabla "Hermanos".
- [x] 4.2 Crear el componente `EditarLogia` (modal, patrón de `GestionUsuario`): campos Nombre, N.°, Oriente y botón Activar/Desactivar. Validación cliente (nombre/oriente no vacíos, número entero) espejo de la del servidor.
- [x] 4.3 Cablear las acciones del modal a `adminEditarLogia` y `adminSetEstadoLogia`; al cerrar/guardar hacer `router.refresh()`. Mostrar el error de número duplicado devuelto por la capa de datos.
- [x] 4.4 Copy claro en el modal: aclarar que "Desactivar" solo bloquea el registro de hermanos nuevos y no expulsa a los actuales; que la palabra clave se cambia en su propia tarjeta.
- [x] 4.5 Verificar cumplimiento de DESIGN.md: solo primitivos de `components/ui`, tokens navy/royal/gold/ink existentes, sin colores/fuentes/radios nuevos, semáforo con redundancia color+texto, estética institucional sobria.

## 5. Registro filtrado por estado

- [x] 5.1 En `app/register/page.tsx`, filtrar la consulta de logias a `estado = 'activa'` (`.eq("estado","activa")`).
- [x] 5.2 Verificar en la app: una logia `inactiva` no aparece en el `<Select>` de registro; al reactivarla, reaparece.

## 6. Verificación funcional y cierre

- [x] 6.1 Verificar flujo completo como `master`: ver listado, editar datos, número duplicado rechazado, activar/desactivar, desactivar la logia activa (sigue visible y activa en el selector).
- [x] 6.2 Verificar que un rol no global (`secretario`) no ve la tabla de logias ni puede invocar las RPC (rechazo en servidor).
- [x] 6.3 Verificar que los edits quedan en la bitácora vía `trg_audit_logias` (revisar tabla de auditoría tras un update).
- [x] 6.4 Ejecutar `npm run typecheck`, `npm run lint` y `npm run check:encoding` dentro de `plataforma-masonica/`; corregir lo que aparezca.
