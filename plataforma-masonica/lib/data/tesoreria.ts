// Acceso a datos de Tesorería (Supabase). RLS: tesorero/secretario/master de su logia.
// Módulo agnóstico: recibe el SupabaseClient por parámetro.
import type { SupabaseClient } from "@supabase/supabase-js";
import { Rol } from "../types";

export interface MiembroTesoreria {
  id: string; nombre: string; rol: Rol; fecha_registro: string; fecha_inicio: string | null;
}
export interface PagoRow { usuario_id: string; mes: number; pagado: boolean; monto: number }

export async function listMiembros(sb: SupabaseClient, logiaId: string): Promise<MiembroTesoreria[]> {
  const { data } = await sb
    .from("perfiles").select("id,nombre,rol,fecha_registro,fecha_inicio")
    .eq("logia_id", logiaId).order("nombre");
  return (data ?? []) as MiembroTesoreria[];
}

export async function getCapita(sb: SupabaseClient, logiaId: string): Promise<number> {
  const { data } = await sb.from("config_capitas").select("monto").eq("logia_id", logiaId).maybeSingle();
  return (data?.monto as number | undefined) ?? 0;
}

export interface CapitaConfig { monto: number; periodicidad: string }

export async function getCapitaConfig(sb: SupabaseClient, logiaId: string): Promise<CapitaConfig> {
  const { data } = await sb.from("config_capitas").select("monto,periodicidad").eq("logia_id", logiaId).maybeSingle();
  return { monto: (data?.monto as number | undefined) ?? 0, periodicidad: (data?.periodicidad as string | undefined) ?? "mensual" };
}

export async function setCapita(sb: SupabaseClient, logiaId: string, monto: number): Promise<void> {
  await sb.from("config_capitas").upsert({ logia_id: logiaId, monto, periodicidad: "mensual" }, { onConflict: "logia_id" });
}

// Pagos de la logia para un año. La RLS de `pagos` ya acota a la logia del tesorero/secretario.
export async function listPagos(sb: SupabaseClient, anio: number): Promise<PagoRow[]> {
  const { data } = await sb.from("pagos").select("usuario_id,mes,pagado,monto").eq("anio", anio);
  return (data ?? []) as PagoRow[];
}

export async function setPago(
  sb: SupabaseClient, usuarioId: string, anio: number, mes: number, pagado: boolean, monto: number, registradoPor: string,
): Promise<void> {
  await sb.from("pagos").upsert(
    { usuario_id: usuarioId, anio, mes, pagado, monto, registrado_por: registradoPor, fecha_registro: new Date().toISOString() },
    { onConflict: "usuario_id,anio,mes" },
  );
}

export async function setInicioCapita(sb: SupabaseClient, usuarioId: string, fecha: string): Promise<void> {
  await sb.rpc("set_inicio_capita", { p_usuario: usuarioId, p_fecha: fecha });
}

export interface CapitaLogiaAgg {
  logia_id: string; nombre: string; numero: number;
  recaudado: number; pagos_cubiertos: number; pagos_registrados: number; cumplimiento_pct: number;
}

// Vista AGREGADA de cápitas por logia (RPC security definer). Para master/Gran Secretario;
// no expone pagos individuales.
export async function estadisticasCapitas(sb: SupabaseClient): Promise<CapitaLogiaAgg[]> {
  const { data } = await sb.rpc("estadisticas_capitas");
  return ((data ?? []) as CapitaLogiaAgg[]);
}
