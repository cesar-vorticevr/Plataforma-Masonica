// Acceso a datos de Tenidas/asistencia (Supabase). RLS: acotado a la logia del administrador.
// Módulo agnóstico: recibe el SupabaseClient por parámetro.
import type { SupabaseClient } from "@supabase/supabase-js";
import { Tenida } from "../types";

export interface MiembroTenida { id: string; nombre: string }
export interface AsistenciaRow { tenida_id: string; usuario_id: string; presente: boolean }

export async function listTenidas(sb: SupabaseClient, logiaId: string): Promise<Tenida[]> {
  const { data } = await sb.from("tenidas").select("*").eq("logia_id", logiaId).order("fecha", { ascending: false });
  return (data ?? []) as Tenida[];
}

export async function addTenida(sb: SupabaseClient, logiaId: string, titulo: string, fechaISO: string): Promise<void> {
  await sb.from("tenidas").insert({ logia_id: logiaId, titulo, fecha: fechaISO });
}

export async function listMiembros(sb: SupabaseClient, logiaId: string): Promise<MiembroTenida[]> {
  const { data } = await sb
    .from("perfiles").select("id,nombre")
    .eq("logia_id", logiaId).eq("estado", "validado").order("nombre");
  return (data ?? []) as MiembroTenida[];
}

// Asistencias de la logia (la RLS las acota a las tenidas de la logia del administrador).
export async function listAsistencias(sb: SupabaseClient): Promise<AsistenciaRow[]> {
  const { data } = await sb.from("asistencias").select("tenida_id,usuario_id,presente");
  return (data ?? []) as AsistenciaRow[];
}

export async function setAsistencia(sb: SupabaseClient, tenidaId: string, usuarioId: string, presente: boolean): Promise<void> {
  await sb.from("asistencias").upsert(
    { tenida_id: tenidaId, usuario_id: usuarioId, presente },
    { onConflict: "tenida_id,usuario_id" },
  );
}

export interface AsistenciaLogiaAgg {
  logia_id: string; nombre: string; numero: number;
  tenidas: number; presentes: number; registros: number; asistencia_pct: number;
}

// Vista AGREGADA de asistencia por logia (RPC security definer). Para master/Gran Secretario.
export async function estadisticasAsistencia(sb: SupabaseClient): Promise<AsistenciaLogiaAgg[]> {
  const { data } = await sb.rpc("estadisticas_asistencia");
  return ((data ?? []) as AsistenciaLogiaAgg[]);
}
