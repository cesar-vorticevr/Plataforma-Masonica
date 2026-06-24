import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Registro controlado (servidor). Verifica las palabras clave y crea la cuenta con el
// service-role, asignando la logia de forma confiable. La service key vive SOLO en el servidor.
export async function POST(req: Request) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const { nombre, email, password, palabraGeneral, logiaId, palabraLogia } = body;
  if (!nombre || !email || !password || !logiaId) {
    return NextResponse.json({ error: "Faltan datos obligatorios." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Servidor sin configurar (Supabase)." }, { status: 500 });
  }
  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1. Verificar palabra general + palabra de la logia (en el servidor, contra hashes).
  const { data: acceso, error: eAcceso } = await admin.rpc("verificar_acceso", {
    p_general: palabraGeneral ?? "",
    p_logia: logiaId,
    p_clave_logia: palabraLogia ?? "",
  });
  if (eAcceso) {
    return NextResponse.json({ error: "No se pudo verificar el acceso." }, { status: 500 });
  }
  if (!acceso) {
    return NextResponse.json({ error: "La palabra clave de la Orden o de la logia es incorrecta." }, { status: 403 });
  }

  // 2. Crear la cuenta (estado pendiente lo fija el trigger handle_new_user / defaults).
  const { data: created, error: eUser } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre },
  });
  if (eUser || !created?.user) {
    return NextResponse.json({ error: eUser?.message ?? "No se pudo crear la cuenta." }, { status: 400 });
  }

  // 3. Asignar la logia verificada (server-side, no se confía en el cliente).
  const { error: eLogia } = await admin.from("perfiles").update({ logia_id: logiaId }).eq("id", created.user.id);
  if (eLogia) {
    return NextResponse.json({ error: "Cuenta creada, pero no se pudo asignar la logia." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
