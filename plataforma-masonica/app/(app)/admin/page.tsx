import { createClient } from "@/lib/supabase/server";
import { cargarPerfil } from "@/lib/data/perfil";
import { esGlobal } from "@/lib/roles";
import { adminListLogias, adminGetLogia, adminListUsuarios } from "@/lib/data/identidad";
import { Logia } from "@/lib/types";
import AdminClient from "./AdminClient";

// Server Component: carga el estado inicial de administración (logias, logia y hermanos) en el
// servidor. La isla gestiona el cambio de logia y las mutaciones.
export default async function Admin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const perfil = await cargarPerfil(supabase, user.id);
  if (!perfil) return null;
  const global = esGlobal(perfil.rol);
  const logiaId = perfil.logia_id;
  const [logias, logia, usuarios] = await Promise.all([
    global ? adminListLogias(supabase) : Promise.resolve([] as Logia[]),
    adminGetLogia(supabase, logiaId),
    adminListUsuarios(supabase, logiaId),
  ]);
  return <AdminClient global={global} defaultLogiaId={logiaId}
    initialLogias={logias} initialLogia={logia} initialUsuarios={usuarios} />;
}
