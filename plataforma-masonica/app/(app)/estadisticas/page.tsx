import { createClient } from "@/lib/supabase/server";
import { cargarPerfil } from "@/lib/data/perfil";
import { esGlobal } from "@/lib/roles";
import { estadisticasSalud } from "@/lib/data/salud-estadisticas";
import EstadisticasClient, { LogiaOpcion } from "./EstadisticasClient";

// Server Component: carga el agregado anonimizado (RPC security definer) y, para admins globales,
// la lista de logias. Nunca trae datos individuales de salud.
export const metadata = { title: "Estadísticas · Plataforma Masónica" };

export default async function Estadisticas() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const perfil = await cargarPerfil(supabase, user.id);
  if (!perfil) return null;
  const global = esGlobal(perfil.rol);
  const [logias, data] = await Promise.all([
    global
      ? supabase.from("logias").select("id,nombre,numero").order("numero").then(r => (r.data ?? []) as LogiaOpcion[])
      : Promise.resolve([] as LogiaOpcion[]),
    estadisticasSalud(supabase, global ? null : undefined),
  ]);
  return <EstadisticasClient global={global} logias={logias} initial={data} />;
}
