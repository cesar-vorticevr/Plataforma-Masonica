// Correspondencia masónica dirigida (Supabase + Storage). RLS: emisor/destinatarios/global.
// Módulo agnóstico: recibe el SupabaseClient por parámetro.
import type { SupabaseClient } from "@supabase/supabase-js";
import { Correspondencia, Logia } from "../types";

const BUCKET = "correspondencia";

export async function listLogias(sb: SupabaseClient): Promise<Logia[]> {
  const { data } = await sb.from("logias").select("*").order("numero");
  return (data ?? []) as Logia[];
}

export async function listCorrespondencia(sb: SupabaseClient): Promise<Correspondencia[]> {
  const { data } = await sb
    .from("correspondencia")
    .select("id,de_logia_id,destinatarios_logia_ids,asunto,cuerpo,adjuntos,autor_id,fecha,leido_por")
    .order("fecha", { ascending: false });
  return (data ?? []) as Correspondencia[];
}

export async function enviar(
  sb: SupabaseClient, deLogia: string, destinos: string[], asunto: string, cuerpo: string,
  files: File[], autorId: string,
): Promise<{ error: string | null }> {
  const corrId = crypto.randomUUID();
  const adjuntos = files.map(f => ({
    nombre: f.name,
    tipo: f.name.split(".").pop()?.toLowerCase() ?? "file",
    ruta: `${corrId}/${crypto.randomUUID()}-${f.name}`,
  }));

  // Insertar la fila primero: la RLS de Storage requiere que exista para subir.
  const { error: insErr } = await sb.from("correspondencia").insert({
    id: corrId, de_logia_id: deLogia, destinatarios_logia_ids: destinos,
    asunto, cuerpo, adjuntos, autor_id: autorId, leido_por: [autorId],
  });
  if (insErr) return { error: insErr.message };

  for (let i = 0; i < files.length; i++) {
    const up = await sb.storage.from(BUCKET).upload(adjuntos[i].ruta, files[i]);
    if (up.error) return { error: up.error.message };
  }
  return { error: null };
}

export async function urlDescarga(sb: SupabaseClient, ruta: string): Promise<string | null> {
  const { data } = await sb.storage.from(BUCKET).createSignedUrl(ruta, 3600);
  return data?.signedUrl ?? null;
}

// Marca una correspondencia como leída por el usuario actual (RPC: solo destinatario/emisor/global).
export async function marcarLeida(sb: SupabaseClient, id: string): Promise<void> {
  await sb.rpc("marcar_correspondencia_leida", { p_id: id });
}
