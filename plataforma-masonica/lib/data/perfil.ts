// Perfil del usuario actual (Supabase). Módulo agnóstico del entorno: recibe el SupabaseClient
// por parámetro, así sirve tanto en Server Components (cliente de servidor) como en islas cliente.
import type { SupabaseClient } from "@supabase/supabase-js";
import { EstadoUsuario, Grado, Rol, Usuario } from "../types";

interface PerfilRow {
  id: string; nombre: string; email: string; rol: Rol; grado: Grado;
  logia_id: string | null; estado: EstadoUsuario; foto: string | null;
  fecha_registro: string; fecha_inicio: string | null;
}

export function perfilAUsuario(p: PerfilRow): Usuario {
  return {
    id: p.id, nombre: p.nombre, email: p.email, rol: p.rol, grado: p.grado,
    logia_id: p.logia_id ?? "", estado: p.estado, foto: p.foto ?? undefined,
    fecha_registro: p.fecha_registro, fecha_inicio: p.fecha_inicio ?? undefined,
  };
}

// Carga el perfil de un usuario por id. RLS decide la visibilidad (perfiles_self).
export async function cargarPerfil(sb: SupabaseClient, uid: string): Promise<Usuario | null> {
  const { data } = await sb.from("perfiles").select("*").eq("id", uid).maybeSingle();
  return data ? perfilAUsuario(data as PerfilRow) : null;
}
