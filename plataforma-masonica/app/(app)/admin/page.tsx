import { createClient } from "@/lib/supabase/server";
import { cargarPerfil } from "@/lib/data/perfil";
import { esGlobal } from "@/lib/roles";
import { adminListLogias, adminGetLogia, adminListUsuarios } from "@/lib/data/identidad";
import { Logia, Usuario } from "@/lib/types";
import AdminClient from "./AdminClient";

// Server Component: carga el estado inicial de administración (logias, logia y hermanos) en el
// servidor. La isla gestiona el cambio de logia y las mutaciones.
export const metadata = { title: "Administración · Plataforma Masónica" };

export default async function Admin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const perfil = await cargarPerfil(supabase, user.id);
  if (!perfil) return null;
  const global = esGlobal(perfil.rol);

  // Un admin global (master / gran secretario) no pertenece a una logia (logia_id nulo): por
  // defecto trabaja la primera logia disponible. Un admin de logia usa la suya.
  const logias = global ? await adminListLogias(supabase) : ([] as Logia[]);
  const defaultLogiaId = global ? (logias[0]?.id ?? "") : perfil.logia_id;

  // Sin logia por defecto (admin global y aún no hay logias): no consultar con id vacío.
  const [logia, usuarios] = defaultLogiaId
    ? await Promise.all([
        adminGetLogia(supabase, defaultLogiaId),
        adminListUsuarios(supabase, defaultLogiaId),
      ])
    : [undefined, [] as Usuario[]];

  return <AdminClient global={global} defaultLogiaId={defaultLogiaId}
    initialLogias={logias} initialLogia={logia} initialUsuarios={usuarios} />;
}
