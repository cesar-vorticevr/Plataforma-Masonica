"use client";
// Directorio profesional (Supabase). RLS: opt-in interlogial (prof_read), edición solo propia.
import { createClient } from "../supabase/client";
import { PerfilProfesional, Logia } from "../types";

const sb = () => createClient();
const COLS = "usuario_id,profesion,sector,negocio,descripcion,palabras_clave,mostrar_en_directorio,nombre,logia_id";

export async function listDirectorio(): Promise<PerfilProfesional[]> {
  const { data } = await sb()
    .from("perfiles_profesionales").select(COLS)
    .order("nombre", { ascending: true });
  return (data ?? []) as PerfilProfesional[];
}

export async function miPerfil(userId: string): Promise<PerfilProfesional | null> {
  const { data } = await sb()
    .from("perfiles_profesionales").select(COLS)
    .eq("usuario_id", userId).maybeSingle();
  return (data ?? null) as PerfilProfesional | null;
}

export async function guardarPerfil(
  p: PerfilProfesional, nombre: string, logiaId: string,
): Promise<{ error: string | null }> {
  const { error } = await sb().from("perfiles_profesionales").upsert({
    usuario_id: p.usuario_id,
    profesion: p.profesion ?? null,
    sector: p.sector ?? null,
    negocio: p.negocio ?? null,
    descripcion: p.descripcion ?? null,
    palabras_clave: p.palabras_clave ?? [],
    mostrar_en_directorio: p.mostrar_en_directorio,
    nombre, logia_id: logiaId,
  }, { onConflict: "usuario_id" });
  return { error: error ? error.message : null };
}

export async function listLogias(): Promise<Logia[]> {
  const { data } = await sb().from("logias").select("*").order("numero");
  return (data ?? []) as Logia[];
}
