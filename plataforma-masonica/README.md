# Plataforma Masónica · Gran Logia de Estado "Restauración"

Aplicación web **Next.js 16 + React 19 + TypeScript + Tailwind**, lista para conectar a **Supabase**
(autenticación, base de datos PostgreSQL y almacenamiento).

Funciona en **dos modos**, controlados por la variable `NEXT_PUBLIC_DATA_MODE`:

- `mock` (por defecto): la app **ya funciona** con datos de demostración guardados en el navegador.
  No necesita Supabase. Ideal para revisar el producto.
- `supabase`: usa tu proyecto real de Supabase.

---

## 1. Probar la demo en tu máquina

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Entra con cualquiera de estos correos (sin contraseña real):

| Correo | Rol |
|---|---|
| master@demo.mx | Administrador Master |
| gransecretario@demo.mx | Gran Secretario |
| secretario@demo.mx | Secretario de logia |
| tesorero@demo.mx | Tesorero |
| maestro@demo.mx / companero@demo.mx / aprendiz@demo.mx | Hermanos (distinto grado) |

Arriba a la derecha hay un **selector de usuario** (solo en modo demo) para cambiar de rol al vuelo
y ver cómo cambian los permisos y la navegación.

> Para reiniciar los datos de la demo, borra el almacenamiento local del navegador.

---

## 2. Conectar a Supabase (producción) — lo que hace el programador

1. Crea un proyecto en https://supabase.com
2. En **SQL Editor**, ejecuta el archivo [`supabase/schema.sql`](supabase/schema.sql).
   Crea todas las tablas, los enums, el trigger que genera el perfil al registrarse,
   y **todas las políticas de seguridad (RLS)** por logia y por grado.
3. En **Authentication > Providers**, habilita **Email** y **Google** (OAuth).
4. Copia tus llaves a `.env.local`:

   ```
   NEXT_PUBLIC_DATA_MODE=supabase
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
   ```

5. Asigna el primer administrador (en SQL Editor):

   ```sql
   update perfiles set rol='master', estado='validado', grado='maestro'
   where email='tu-correo@ejemplo.mx';
   ```

### Lo que falta cablear (claramente marcado en el código)
- **Auth real**: `lib/auth.tsx` hoy resuelve sesión contra el store mock. Sustituir `login`,
  `loginGoogle` y `registrar` por `supabase.auth.signInWithPassword`, `signInWithOAuth({provider:'google'})`
  y `signUp`. El cliente ya está en `lib/supabase/client.ts`.
- **Datos**: `lib/data/store.ts` es la capa de acceso. Cada función tiene su tabla equivalente en el
  esquema SQL; reemplazar la lógica en memoria por consultas `supabase.from('tabla')...`.
- **Archivos**: el buzón, la correspondencia y los trabajos hoy guardan el nombre del archivo.
  Conectar **Supabase Storage** para subir/descargar los PDF, Word, PNG y JPG reales.
- **Estadísticas de salud agregadas**: exponer vistas/funciones `security definer` para que los
  administradores vean prevalencia de etiquetas **sin** acceder a filas individuales (la RLS ya
  restringe la salud individual al propio hermano).

---

## 3. Estructura

```
app/                  Páginas (App Router)
  login, register     Autenticación
  (app)/              Área privada (dashboard, salud, generales, directorio,
                      mensajes, eventos, trabajos, buzon, correspondencia,
                      tesoreria, tenidas, cumplimientos, admin)
  privacidad/         Aviso de privacidad (modelo)
components/           UI y layout (AppShell, navegación por rol)
lib/                  types, roles/permisos, health (lógica del semáforo),
                      auth, data (store mock + seed), supabase (clientes)
supabase/schema.sql   Esquema completo + RLS + semilla
```

## 4. Notas importantes
- El módulo de salud entrega una **evaluación orientativa**, **no un diagnóstico**. La lógica de
  puntajes (`lib/health.ts`) debe ser **validada por un médico**.
- El **Aviso de Privacidad** (`app/privacidad`) es un modelo y debe revisarlo un **abogado**
  conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (2025).
- Las palabras clave de registro deben guardarse **cifradas (hash)** en producción.
