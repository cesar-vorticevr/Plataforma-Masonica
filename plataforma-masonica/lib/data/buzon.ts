// Buzón interlogial (Supabase + Storage). RLS: solo administradores (tabla y bucket).
// Módulo agnóstico: recibe el SupabaseClient por parámetro.
import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "buzon";

export interface DocBuzon { id: string; titulo: string; tipo: string; archivo_url: string; fecha: string; alcance: "logia" | "global"; logia_id: string | null }

export async function listBuzon(sb: SupabaseClient): Promise<DocBuzon[]> {
  const { data } = await sb
    .from("buzon_documentos").select("id,titulo,tipo,archivo_url,fecha,alcance,logia_id")
    .order("fecha", { ascending: false });
  return (data ?? []) as DocBuzon[];
}

export async function subir(
  sb: SupabaseClient, titulo: string, tipo: "pdf" | "word", file: File, autorId: string,
  alcance: "logia" | "global", logiaId: string | null,
): Promise<{ error: string | null }> {
  const ruta = `${crypto.randomUUID()}-${file.name}`;
  const up = await sb.storage.from(BUCKET).upload(ruta, file);
  if (up.error) return { error: up.error.message };
  const { error } = await sb
    .from("buzon_documentos")
    .insert({ titulo, tipo, archivo_url: ruta, autor_id: autorId, alcance, logia_id: alcance === "global" ? null : logiaId });
  return { error: error ? error.message : null };
}

export async function urlDescarga(sb: SupabaseClient, ruta: string): Promise<string | null> {
  const { data } = await sb.storage.from(BUCKET).createSignedUrl(ruta, 3600);
  return data?.signedUrl ?? null;
}
