// Crea (o promueve) al administrador maestro de la plataforma.
// Uso local:  npm run crear:master                                    (carga y escribe .env.local)
// Uso prod:   node --env-file=.env.prod scripts/crear-master.mjs .env.prod
//
// El 1er argumento es el archivo de entorno donde guardar la contraseña generada (default .env.local).
//
// Variables de entorno:
//   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   (requeridas)
//   MASTER_EMAIL     (opcional; default master@restauracion.org.mx)
//   MASTER_NOMBRE    (opcional; default "Administrador Master")
//   MASTER_PASSWORD  (opcional; si no se da, se genera una segura con crypto)
//
// La contraseña se entrega a Supabase Auth, que la almacena con hash bcrypt (NO se pre-hashea).
// Si se genera, además se persiste como MASTER_PASSWORD en el archivo de entorno (gitignored).
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (process.env.MASTER_EMAIL || "master@restauracion.org.mx").toLowerCase();
const nombre = process.env.MASTER_NOMBRE || "Administrador Master";
let password = process.env.MASTER_PASSWORD || null;
// Archivo de entorno donde persistir la contraseña generada (gitignored). Default .env.local.
const envFile = process.argv[2] || ".env.local";

// Inserta o reemplaza MASTER_PASSWORD en el archivo de entorno indicado.
function guardarPasswordEnEnv(file, value) {
  let contenido = existsSync(file) ? readFileSync(file, "utf8") : "";
  const linea = `MASTER_PASSWORD=${value}`;
  if (/^MASTER_PASSWORD=.*$/m.test(contenido)) {
    contenido = contenido.replace(/^MASTER_PASSWORD=.*$/m, linea);
  } else {
    if (contenido && !contenido.endsWith("\n")) contenido += "\n";
    contenido += linea + "\n";
  }
  writeFileSync(file, contenido);
}

if (!url || !serviceKey) {
  console.error("✗ Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.");
  process.exit(1);
}

const generada = !password;
if (generada) password = randomBytes(18).toString("base64url"); // contraseña fuerte aleatoria

const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function buscarPorEmail(correo) {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  return data.users.find((u) => (u.email || "").toLowerCase() === correo) || null;
}

async function main() {
  let userId;
  const { data: creado, error: eCrear } = await admin.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { nombre },
  });

  if (eCrear) {
    const existente = await buscarPorEmail(email);
    if (!existente) {
      console.error("✗ No se pudo crear ni encontrar el usuario:", eCrear.message);
      process.exit(1);
    }
    userId = existente.id;
    if (process.env.MASTER_PASSWORD) {
      await admin.auth.admin.updateUserById(userId, { password });
    } else {
      password = null; // ya existía y no se cambia la contraseña
    }
    console.log("• El usuario ya existía; se promueve a master.");
  } else {
    userId = creado.user.id;
  }

  const { error: ePerfil } = await admin
    .from("perfiles")
    .update({ rol: "master", estado: "validado", grado: "maestro" })
    .eq("id", userId);
  if (ePerfil) {
    console.error("✗ No se pudo promover el perfil a master:", ePerfil.message);
    process.exit(1);
  }

  console.log("\n✓ Administrador maestro listo.");
  console.log("  email:      ", email);
  if (password) {
    console.log("  contraseña: ", password);
    if (generada) {
      guardarPasswordEnEnv(envFile, password);
      console.log(`  guardada en ${envFile} como MASTER_PASSWORD (gitignored).`);
    }
  }
  console.log("");
}

main().catch((e) => { console.error("✗ Error:", e.message); process.exit(1); });
