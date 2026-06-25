// Acceso a datos de Eventos (Supabase). RLS: lectura de globales + de la logia; publicación acotada por rol.
// Módulo agnóstico: recibe el SupabaseClient por parámetro.
import type { SupabaseClient } from "@supabase/supabase-js";
import { Evento } from "../types";

export async function listEventos(sb: SupabaseClient): Promise<Evento[]> {
  const { data } = await sb.from("eventos").select("*").order("fecha_evento", { ascending: false });
  return (data ?? []) as Evento[];
}

export interface NuevoEvento {
  titulo: string; descripcion: string; fecha_evento: string;
  alcance: "logia" | "global"; logia_id: string | null; autor_id: string;
}

export async function addEvento(sb: SupabaseClient, ev: NuevoEvento): Promise<{ error: string | null }> {
  const { error } = await sb.from("eventos").insert(ev);
  return { error: error ? error.message : null };
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
