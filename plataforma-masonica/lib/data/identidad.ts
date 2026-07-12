// Capa de acceso a datos de identidad/administración (Supabase).
// Módulo agnóstico: recibe el SupabaseClient por parámetro.
import type { SupabaseClient } from "@supabase/supabase-js";
import { EstadoUsuario, Grado, Logia, Rol, Usuario } from "../types";

interface PerfilRow {
  id: string; nombre: string; email: string; rol: Rol; grado: Grado;
  logia_id: string | null; estado: EstadoUsuario; foto: string | null; fecha_registro: string;
}
function perfilAUsuario(p: PerfilRow): Usuario {
  return {
    id: p.id, nombre: p.nombre, email: p.email, rol: p.rol, grado: p.grado,
    logia_id: p.logia_id ?? "", estado: p.estado, foto: p.foto ?? undefined,
    fecha_registro: p.fecha_registro,
  };
}

export async function adminListLogias(sb: SupabaseClient): Promise<Logia[]> {
  const { data } = await sb.from("logias").select("*").order("numero");
  return (data ?? []) as Logia[];
}

export async function adminGetLogia(sb: SupabaseClient, id: string): Promise<Logia | undefined> {
  const { data } = await sb.from("logias").select("*").eq("id", id).single();
  return (data ?? undefined) as Logia | undefined;
}

export async function adminListUsuarios(sb: SupabaseClient, logiaId: string): Promise<Usuario[]> {
  const { data } = await sb.from("perfiles").select("*").eq("logia_id", logiaId).order("fecha_registro");
  return ((data ?? []) as PerfilRow[]).map(perfilAUsuario);
}

export async function adminValidar(sb: SupabaseClient, id: string, grado: Grado): Promise<void> {
  await sb.from("perfiles").update({ estado: "validado", grado }).eq("id", id);
}

export async function adminSetEstado(sb: SupabaseClient, id: string, estado: EstadoUsuario): Promise<void> {
  await sb.from("perfiles").update({ estado }).eq("id", id);
}

export async function adminSetRol(sb: SupabaseClient, id: string, rol: Rol): Promise<void> {
  await sb.from("perfiles").update({ rol }).eq("id", id);
}

export async function adminCambiarPalabra(sb: SupabaseClient, logiaId: string, clave: string): Promise<void> {
  await sb.rpc("set_palabra_logia", { p_logia: logiaId, p_clave: clave });
}

// Designa como secretario de su logia a un hermano validado (solo admin global; RPC con guard).
// Degrada al secretario anterior de esa logia (regla: un secretario por logia).
export async function adminDesignarSecretario(sb: SupabaseClient, usuarioId: string): Promise<void> {
  await sb.rpc("designar_secretario", { p_usuario: usuarioId });
}
// Quita el rol de secretario, devolviendo al usuario a hermano (solo admin global).
export async function adminQuitarSecretario(sb: SupabaseClient, usuarioId: string): Promise<void> {
  await sb.rpc("quitar_secretario", { p_usuario: usuarioId });
}

// Alta de logia por el admin global. La palabra clave se hashea en el servidor (RPC crear_logia).
// Devuelve el id de la nueva logia, o undefined si falló.
export async function adminCrearLogia(
  sb: SupabaseClient,
  args: { nombre: string; numero: number; oriente: string; clave: string },
): Promise<string | undefined> {
  const { data } = await sb.rpc("crear_logia", {
    p_nombre: args.nombre, p_numero: args.numero,
    p_oriente: args.oriente, p_clave: args.clave,
  });
  return (data as string | null) ?? undefined;
}

// Edita los datos básicos de una logia (NO la palabra clave; eso es set_palabra_logia). El guard
// es_global() y la unicidad de número viven en la RPC. Traduce la violación de unicidad (23505) a
// un mensaje accionable para la UI.
export async function adminEditarLogia(
  sb: SupabaseClient,
  id: string,
  args: { nombre: string; numero: number; oriente: string },
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await sb.rpc("editar_logia", {
    p_id: id, p_nombre: args.nombre, p_numero: args.numero, p_oriente: args.oriente,
  });
  if (!error) return { ok: true };
  if (error.code === "23505") return { ok: false, error: "El número de logia ya está en uso." };
  return { ok: false, error: "No se pudo editar la logia. Verifica tus permisos." };
}

// Cambia el ciclo de vida de una logia. "inactiva" solo bloquea el registro de hermanos nuevos
// (ver app/register); no expulsa a los hermanos ya validados ni la oculta a los admins.
export async function adminSetEstadoLogia(
  sb: SupabaseClient, id: string, estado: "activa" | "inactiva",
): Promise<void> {
  await sb.rpc("set_estado_logia", { p_id: id, p_estado: estado });
}
