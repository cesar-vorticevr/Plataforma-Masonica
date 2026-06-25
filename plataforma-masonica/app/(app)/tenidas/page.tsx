import { createClient } from "@/lib/supabase/server";
import { cargarPerfil } from "@/lib/data/perfil";
import { listTenidas, listMiembros, listAsistencias } from "@/lib/data/tenidas";
import TenidasClient from "./TenidasClient";

// Server Component: carga tenidas, miembros y asistencias de la logia (RLS) en el servidor.
export default async function Tenidas() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const perfil = await cargarPerfil(supabase, user.id);
  const logiaId = perfil?.logia_id ?? "";
  const [tenidas, miembros, asistencias] = await Promise.all([
    listTenidas(supabase, logiaId),
    listMiembros(supabase, logiaId),
    listAsistencias(supabase),
  ]);
  return <TenidasClient tenidas={tenidas} miembros={miembros} asistencias={asistencias} />;
}
