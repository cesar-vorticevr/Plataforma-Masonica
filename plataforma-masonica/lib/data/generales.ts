// Acceso a datos del módulo Generales (Supabase). RLS: dueño + admins de su logia (lectura);
// escritura solo del dueño. Módulo agnóstico: recibe el SupabaseClient por parámetro.
import type { SupabaseClient } from "@supabase/supabase-js";
import { Generales } from "../types";

export async function getGenerales(sb: SupabaseClient, usuarioId: string): Promise<Generales | null> {
  const { data } = await sb.from("generales").select("*").eq("usuario_id", usuarioId).maybeSingle();
  return (data as Generales | null) ?? null;
}

export async function guardarGenerales(sb: SupabaseClient, g: Generales): Promise<void> {
  const nz = (v?: string) => (v && v.trim() !== "" ? v : null); // vacío -> null
  await sb.from("generales").upsert(
    {
      usuario_id: g.usuario_id,
      fecha_nacimiento: nz(g.fecha_nacimiento),
      telefono: nz(g.telefono),
      direccion: nz(g.direccion),
      contacto_emergencia_nombre: nz(g.contacto_emergencia_nombre),
      contacto_emergencia_tel: nz(g.contacto_emergencia_tel),
      tipo_sangre: nz(g.tipo_sangre),
      notas: nz(g.notas),
    },
    { onConflict: "usuario_id" }
  );
}
