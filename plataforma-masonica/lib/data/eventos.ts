"use client";
// Acceso a datos de Eventos (Supabase). RLS: lectura de globales + de la logia; publicación acotada por rol.
import { createClient } from "../supabase/client";
import { Evento } from "../types";

const sb = () => createClient();

export async function listEventos(): Promise<Evento[]> {
  const { data } = await sb().from("eventos").select("*").order("fecha_evento", { ascending: false });
  return (data ?? []) as Evento[];
}

export interface NuevoEvento {
  titulo: string; descripcion: string; fecha_evento: string;
  alcance: "logia" | "global"; logia_id: string | null; autor_id: string;
}

export async function addEvento(ev: NuevoEvento): Promise<{ error: string | null }> {
  const { error } = await sb().from("eventos").insert(ev);
  return { error: error ? error.message : null };
}
