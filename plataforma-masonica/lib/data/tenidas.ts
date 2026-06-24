"use client";
// Acceso a datos de Tenidas/asistencia (Supabase). RLS: acotado a la logia del administrador.
import { createClient } from "../supabase/client";
import { Tenida } from "../types";

const sb = () => createClient();

export interface MiembroTenida { id: string; nombre: string }
export interface AsistenciaRow { tenida_id: string; usuario_id: string; presente: boolean }

export async function listTenidas(logiaId: string): Promise<Tenida[]> {
  const { data } = await sb().from("tenidas").select("*").eq("logia_id", logiaId).order("fecha", { ascending: false });
  return (data ?? []) as Tenida[];
}

export async function addTenida(logiaId: string, titulo: string, fechaISO: string): Promise<void> {
  await sb().from("tenidas").insert({ logia_id: logiaId, titulo, fecha: fechaISO });
}

export async function listMiembros(logiaId: string): Promise<MiembroTenida[]> {
  const { data } = await sb()
    .from("perfiles").select("id,nombre")
    .eq("logia_id", logiaId).eq("estado", "validado").order("nombre");
  return (data ?? []) as MiembroTenida[];
}

// Asistencias de la logia (la RLS las acota a las tenidas de la logia del administrador).
export async function listAsistencias(): Promise<AsistenciaRow[]> {
  const { data } = await sb().from("asistencias").select("tenida_id,usuario_id,presente");
  return (data ?? []) as AsistenciaRow[];
}

export async function setAsistencia(tenidaId: string, usuarioId: string, presente: boolean): Promise<void> {
  await sb().from("asistencias").upsert(
    { tenida_id: tenidaId, usuario_id: usuarioId, presente },
    { onConflict: "tenida_id,usuario_id" },
  );
}
