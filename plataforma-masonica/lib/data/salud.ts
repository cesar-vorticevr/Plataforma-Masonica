"use client";
// Acceso a datos del módulo Salud (Supabase). DATO SENSIBLE: RLS solo-dueño (salud_owner).
// El consentimiento (consent_rw) también es solo-dueño.
import { createClient } from "../supabase/client";
import { EvaluacionSalud } from "../types";

// Versión vigente del aviso de privacidad. Súbela cuando cambie el texto de /privacidad
// para volver a solicitar el consentimiento.
export const AVISO_PRIVACIDAD_VERSION = "2025-03-v1";

const sb = () => createClient();

export async function listEvaluaciones(usuarioId: string): Promise<EvaluacionSalud[]> {
  const { data } = await sb()
    .from("evaluaciones_salud").select("*")
    .eq("usuario_id", usuarioId)
    .order("fecha", { ascending: true });
  return (data ?? []) as EvaluacionSalud[];
}

export async function addEvaluacion(ev: Omit<EvaluacionSalud, "id" | "fecha">): Promise<void> {
  await sb().from("evaluaciones_salud").insert({
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

export async function tieneConsentimiento(usuarioId: string, version: string): Promise<boolean> {
  const { data } = await sb()
    .from("consentimientos").select("id")
    .eq("usuario_id", usuarioId).eq("version_aviso", version).limit(1);
  return (data?.length ?? 0) > 0;
}

export async function registrarConsentimiento(usuarioId: string, version: string): Promise<void> {
  await sb().from("consentimientos").insert({ usuario_id: usuarioId, version_aviso: version });
}
