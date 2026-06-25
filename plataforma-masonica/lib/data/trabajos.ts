"use client";
// Trabajos por cámara (Supabase + Storage). RLS: misma logia y nivel(camara) <= nivel(mi_grado()).
import { createClient } from "../supabase/client";
import { Trabajo, Camara } from "../types";

const BUCKET = "trabajos";
const sb = () => createClient();

export async function listTrabajos(): Promise<Trabajo[]> {
  const { data } = await sb()
    .from("trabajos")
    .select("id,usuario_id,logia_id,titulo,descripcion,camara,archivo_url,archivo_nombre,autor_nombre,fecha")
    .order("fecha", { ascending: false });
  return (data ?? []) as Trabajo[];
}

export async function subir(
  usuarioId: string, logiaId: string, titulo: string, descripcion: string,
  camara: Camara, file: File, autorNombre: string,
): Promise<{ error: string | null }> {
  const id = crypto.randomUUID();
  const ruta = `${id}/${crypto.randomUUID()}-${file.name}`;

  // Insertar la fila primero: la RLS de Storage requiere que exista para subir.
  const { error: insErr } = await sb().from("trabajos").insert({
    id, usuario_id: usuarioId, logia_id: logiaId, titulo, descripcion: descripcion || null,
    camara, archivo_url: ruta, archivo_nombre: file.name, autor_nombre: autorNombre,
  });
  if (insErr) return { error: insErr.message };

  const up = await sb().storage.from(BUCKET).upload(ruta, file);
  if (up.error) return { error: up.error.message };
  return { error: null };
}

export async function urlDescarga(ruta: string): Promise<string | null> {
  const { data } = await sb().storage.from(BUCKET).createSignedUrl(ruta, 3600);
  return data?.signedUrl ?? null;
}
