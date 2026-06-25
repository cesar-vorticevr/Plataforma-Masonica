import { createClient } from "@/lib/supabase/server";
import { cargarPerfil } from "@/lib/data/perfil";
import { listMiembros, getCapita, listPagos } from "@/lib/data/tesoreria";
import TesoreriaClient from "./TesoreriaClient";

// Server Component: carga miembros, cápita y pagos del año en el servidor (RLS por logia).
export const metadata = { title: "Tesorería · Plataforma Masónica" };

export default async function Tesoreria() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const perfil = await cargarPerfil(supabase, user.id);
  const logiaId = perfil?.logia_id ?? "";
  const anio = new Date().getFullYear();
  const [miembros, capita, pagos] = await Promise.all([
    listMiembros(supabase, logiaId),
    getCapita(supabase, logiaId),
    listPagos(supabase, anio),
  ]);
  return <TesoreriaClient anio={anio} miembros={miembros} capita={capita} pagos={pagos} />;
}
