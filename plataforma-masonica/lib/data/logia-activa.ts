import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Logia, Usuario } from "../types";
import { esGlobal } from "../roles";
import { COOKIE_LOGIA_ACTIVA } from "../logia-activa";
import { adminListLogias } from "./identidad";

export interface LogiaActiva {
  // "" cuando un admin global aún no tiene logias creadas (no consultar con id vacío).
  logiaId: string;
  // Logias accesibles para elegir en el selector del header. Vacío para usuarios no globales.
  logias: Logia[];
  global: boolean;
}

// Resuelve la logia sobre la que opera el usuario en las páginas de una sola logia:
// - Usuario normal (secretario, tesorero, hermano): su logia fija (perfil.logia_id).
// - Admin global (master / gran_secretario): la logia activa persistida en la cookie, VALIDADA
//   contra las logias que RLS devuelve como accesibles, con fallback a la primera.
//
// La cookie es preferencia de UI, NO autorización: RLS decide qué datos se devuelven aunque la
// cookie nombre otra logia. Validarla aquí solo evita apuntar la UI a una logia inexistente.
export async function resolverLogiaActiva(sb: SupabaseClient, perfil: Usuario): Promise<LogiaActiva> {
  const global = esGlobal(perfil.rol);
  if (!global) return { logiaId: perfil.logia_id, logias: [], global };

  const logias = await adminListLogias(sb);
  if (logias.length === 0) return { logiaId: "", logias, global };

  const cookieId = (await cookies()).get(COOKIE_LOGIA_ACTIVA)?.value;
  const valida = !!cookieId && logias.some(l => l.id === cookieId);
  return { logiaId: valida ? cookieId! : logias[0].id, logias, global };
}
