// Estadísticas de salud AGREGADAS (RPC a la función security definer). Nunca trae datos individuales.
// Módulo agnóstico: recibe el SupabaseClient por parámetro.
import type { SupabaseClient } from "@supabase/supabase-js";

export interface Distribucion { verde: number; amarillo: number; rojo: number }
export interface EstadisticasSalud {
  cohorte: number;
  suprimido: boolean;
  semaforo_metabolico?: Distribucion;
  semaforo_oncologico?: Distribucion;
  etiquetas?: { k: string; n: number }[];
  condiciones?: { k: string; n: number }[];
}

// logiaId: null/undefined = total (solo global; el secretario queda acotado a su logia en el servidor).
export async function estadisticasSalud(sb: SupabaseClient, logiaId?: string | null): Promise<EstadisticasSalud | null> {
  const { data, error } = await sb.rpc("estadisticas_salud", { p_logia: logiaId ?? null });
  if (error) return null;
  return data as EstadisticasSalud;
}
