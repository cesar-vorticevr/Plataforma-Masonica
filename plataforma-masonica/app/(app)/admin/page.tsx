import { createClient } from "@/lib/supabase/server";
import { cargarPerfil } from "@/lib/data/perfil";
import { resolverLogiaActiva } from "@/lib/data/logia-activa";
import { adminGetLogia, adminListUsuarios } from "@/lib/data/identidad";
import { Usuario } from "@/lib/types";
import AdminClient from "./AdminClient";

// Server Component: carga el estado inicial de administración (logia y hermanos) en el servidor.
// La logia sobre la que opera un admin global viene de la logia activa (selector del header).
export const metadata = { title: "Administración · Plataforma Masónica" };

export default async function Admin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const perfil = await cargarPerfil(supabase, user.id);
  if (!perfil) return null;
  const { logiaId, global, logias } = await resolverLogiaActiva(supabase, perfil);

  // Sin logia en foco (admin global y aún no hay logias): no consultar con id vacío.
  const [logia, usuarios] = logiaId
    ? await Promise.all([
        adminGetLogia(supabase, logiaId),
        adminListUsuarios(supabase, logiaId),
      ])
    : [undefined, [] as Usuario[]];

  return <AdminClient global={global} logiaId={logiaId} logia={logia} usuarios={usuarios} logias={logias} />;
}
