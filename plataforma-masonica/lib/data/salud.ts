// Acceso a datos del módulo Salud (Supabase). DATO SENSIBLE: RLS solo-dueño (salud_owner).
// El consentimiento (consent_rw) también es solo-dueño.
// Módulo agnóstico: recibe el SupabaseClient por parámetro.
import type { SupabaseClient } from "@supabase/supabase-js";
import { EvaluacionSalud } from "../types";

// Versión vigente del aviso de privacidad. Súbela cuando cambie el texto de /privacidad
// para volver a solicitar el consentimiento.
export const AVISO_PRIVACIDAD_VERSION = "2025-03-v1";

export async function listEvaluaciones(sb: SupabaseClient, usuarioId: string): Promise<EvaluacionSalud[]> {
  const { data } = await sb
    .from("evaluaciones_salud").select("*")
    .eq("usuario_id", usuarioId)
    .order("fecha", { ascending: true });
  return (data ?? []) as EvaluacionSalud[];
}

export async function addEvaluacion(sb: SupabaseClient, ev: Omit<EvaluacionSalud, "id" | "fecha">): Promise<void> {
  await sb.from("evaluaciones_salud").insert({
    usuario_id: ev.usuario_id,
    respuestas: ev.respuestas,
    puntaje_metabolico: ev.puntaje_metabolico,
    puntaje_oncologico: ev.puntaje_oncologico,
    semaforo_metabolico: ev.semaforo_metabolico,
    semaforo_oncologico: ev.semaforo_oncologico,
    etiquetas: ev.etiquetas,
    condiciones: ev.condiciones,
  });
}

export async function tieneConsentimiento(sb: SupabaseClient, usuarioId: string, version: string): Promise<boolean> {
  const { data } = await sb
    .from("consentimientos").select("id")
    .eq("usuario_id", usuarioId).eq("version_aviso", version).limit(1);
  return (data?.length ?? 0) > 0;
}

export async function registrarConsentimiento(sb: SupabaseClient, _usuarioId: string, version: string): Promise<void> {
  // Se registra por RPC (server-side) para capturar la ip y no confiar el usuario/ip al cliente.
  await sb.rpc("registrar_consentimiento", { p_version: version });
}

// ARCO: revoca el consentimiento (impide nuevas evaluaciones hasta volver a consentir).
export async function revocarConsentimiento(sb: SupabaseClient): Promise<void> {
  await sb.rpc("revocar_consentimiento");
}

// ARCO (cancelación): borra todas las evaluaciones de salud del propio hermano.
export async function borrarMiSalud(sb: SupabaseClient): Promise<void> {
  await sb.rpc("borrar_mi_salud");
}
