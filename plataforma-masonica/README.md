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

## 2. Desarrollo local con Supabase (Docker)

Requiere **Docker** corriendo. El **Supabase CLI** (ya incluido como devDependency) levanta un
Supabase completo en local (Postgres, Auth, Storage, Studio…) en contenedores.

```bash
cd plataforma-masonica
cp .env.local.example .env.local      # luego pega la anon key (paso 3)
npx supabase start                    # levanta el stack y aplica migraciones + seed.sql
npx supabase status                   # muestra API URL (http://localhost:54321) y anon key
# -> pega NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local
npm run dev                           # app en el host (recomendado)  → http://localhost:3000
```

- **Reconstruir la base** (esquema + semilla desde cero): `npx supabase db reset`.
- **App en contenedor** (opcional): `docker compose up` (ver caveat de red en `docker-compose.yml`;
  para trabajo client-side el host es más directo).
- **Esquema:** vive en `supabase/migrations/` (fuente única). Nueva migración:
  `npx supabase migration new <nombre>`. Semilla local: `supabase/seed.sql`.
- Detener: `npx supabase stop`.

## 3. Conectar a Supabase de producción

1. Crea un proyecto en https://supabase.com y habilita **Email** y **Google** en *Authentication > Providers*.
2. Enlaza y sube las migraciones:

   ```bash
   npx supabase link --project-ref <tu-ref>
   npx supabase db push        # aplica supabase/migrations/ al proyecto remoto
   ```

3. Copia tus llaves de producción a `.env.local` (NO uses las locales):

   ```
   NEXT_PUBLIC_DATA_MODE=supabase
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
   ```

4. Asigna el primer administrador (SQL Editor del proyecto):

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

## 4. Estructura

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
supabase/migrations/  Esquema + RLS (fuente única); seed.sql semilla local
supabase/config.toml  Configuración del stack local (Supabase CLI)
Dockerfile, docker-compose.yml  App en contenedor (dev, opcional)
```

## 5. Notas importantes
- El módulo de salud entrega una **evaluación orientativa**, **no un diagnóstico**. La lógica de
  puntajes (`lib/health.ts`) debe ser **validada por un médico**.
- El **Aviso de Privacidad** (`app/privacidad`) es un modelo y debe revisarlo un **abogado**
  conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (2025).
- Las palabras clave de registro deben guardarse **cifradas (hash)** en producción.
