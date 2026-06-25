"use client";
// Mensajería profesional (Supabase). RLS: solo emisor/receptor (msg_rw).
import { createClient } from "../supabase/client";
import { MensajeProfesional } from "../types";

const sb = () => createClient();
const COLS = "id,de_usuario_id,a_usuario_id,cuerpo,fecha,leido,de_nombre,a_nombre";

export async function listMensajes(_userId: string): Promise<MensajeProfesional[]> {
  // La RLS deja solo mis mensajes (emisor o receptor); orden cronológico.
  const { data } = await sb()
    .from("mensajes_profesionales").select(COLS)
    .order("fecha", { ascending: true });
  return (data ?? []) as MensajeProfesional[];
}

export async function enviar(
  deId: string, deNombre: string, aId: string, aNombre: string, cuerpo: string,
): Promise<{ error: string | null }> {
  const { error } = await sb().from("mensajes_profesionales").insert({
    de_usuario_id: deId, a_usuario_id: aId, cuerpo,
    de_nombre: deNombre, a_nombre: aNombre,
  });
  return { error: error ? error.message : null };
}

export async function marcarLeidos(deId: string): Promise<void> {
  await sb().rpc("marcar_mensajes_leidos", { p_de: deId });
}

export async function contarNoLeidos(userId: string): Promise<number> {
  const { count } = await sb()
    .from("mensajes_profesionales")
    .select("id", { count: "exact", head: true })
    .eq("a_usuario_id", userId).eq("leido", false);
  return count ?? 0;
}
