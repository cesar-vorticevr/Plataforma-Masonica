"use client";
// Capa de acceso a datos de identidad/administración, mode-aware:
// en modo supabase usa el backend real; en mock, el store en memoria.
import { createClient, DATA_MODE } from "../supabase/client";
import * as mock from "./store";
import { EstadoUsuario, Grado, Logia, Rol, Usuario } from "../types";

const SB = DATA_MODE === "supabase";
const sb = () => createClient();

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

export async function adminListLogias(): Promise<Logia[]> {
  if (!SB) return mock.listLogias();
  const { data } = await sb().from("logias").select("*").order("numero");
  return (data ?? []) as Logia[];
}

export async function adminGetLogia(id: string): Promise<Logia | undefined> {
  if (!SB) return mock.getLogia(id);
  const { data } = await sb().from("logias").select("*").eq("id", id).single();
  return (data ?? undefined) as Logia | undefined;
}

export async function adminListUsuarios(logiaId: string): Promise<Usuario[]> {
  if (!SB) return mock.listUsuariosLogia(logiaId);
  const { data } = await sb().from("perfiles").select("*").eq("logia_id", logiaId).order("fecha_registro");
  return ((data ?? []) as PerfilRow[]).map(perfilAUsuario);
}

export async function adminValidar(id: string, grado: Grado): Promise<void> {
  if (!SB) { mock.validarUsuario(id, grado); return; }
  await sb().from("perfiles").update({ estado: "validado", grado }).eq("id", id);
}

export async function adminSetEstado(id: string, estado: EstadoUsuario): Promise<void> {
  if (!SB) { mock.actualizarUsuario(id, { estado }); return; }
  await sb().from("perfiles").update({ estado }).eq("id", id);
}

export async function adminSetRol(id: string, rol: Rol): Promise<void> {
  if (!SB) { mock.actualizarUsuario(id, { rol }); return; }
  await sb().from("perfiles").update({ rol }).eq("id", id);
}

export async function adminCambiarPalabra(logiaId: string, clave: string): Promise<void> {
  if (!SB) { mock.cambiarPalabraClaveLogia(logiaId, clave); return; }
  await sb().rpc("set_palabra_logia", { p_logia: logiaId, p_clave: clave });
}
