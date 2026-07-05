// Acceso a datos de Eventos (Supabase). RLS: lectura de globales + de la logia; publicación acotada por rol.
// Módulo agnóstico: recibe el SupabaseClient por parámetro.
import type { SupabaseClient } from "@supabase/supabase-js";
import { Evento } from "../types";

export async function listEventos(sb: SupabaseClient): Promise<Evento[]> {
  const { data } = await sb.from("eventos").select("*").order("fecha_evento", { ascending: false });
  return (data ?? []) as Evento[];
}

const BUCKET = "eventos";

export interface NuevoEvento {
  titulo: string; descripcion: string; fecha_evento: string;
  alcance: "logia" | "global"; logia_id: string | null; autor_id: string;
}

export async function addEvento(sb: SupabaseClient, ev: NuevoEvento, files: File[] = []): Promise<{ error: string | null }> {
  const id = crypto.randomUUID();
  const adjuntos = files.map(f => ({
    nombre: f.name,
    tipo: f.name.split(".").pop()?.toLowerCase() ?? "file",
    ruta: `${id}/${crypto.randomUUID()}-${f.name}`,
  }));
  // Insertar primero: la RLS de Storage requiere que el evento exista para subir.
  const { error } = await sb.from("eventos").insert({ id, ...ev, adjuntos });
  if (error) return { error: error.message };
  for (let i = 0; i < files.length; i++) {
    const up = await sb.storage.from(BUCKET).upload(adjuntos[i].ruta, files[i]);
    if (up.error) return { error: up.error.message };
  }
  return { error: null };
}

export async function urlDescargaEvento(sb: SupabaseClient, ruta: string): Promise<string | null> {
  const { data } = await sb.storage.from(BUCKET).createSignedUrl(ruta, 3600);
  return data?.signedUrl ?? null;
}

// Badge de no vistos: cuenta eventos visibles publicados tras el último visto del hermano (RPC).
export async function contarEventosNuevos(sb: SupabaseClient): Promise<number> {
  const { data } = await sb.rpc("contar_eventos_nuevos");
  return (data as number | null) ?? 0;
}

// Marca todos los eventos como vistos para el hermano actual (al abrir /eventos).
export async function marcarEventosVistos(sb: SupabaseClient): Promise<void> {
  await sb.rpc("marcar_eventos_vistos");
}
