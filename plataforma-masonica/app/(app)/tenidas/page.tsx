import { createClient } from "@/lib/supabase/server";
import { cargarPerfil } from "@/lib/data/perfil";
import { resolverLogiaActiva } from "@/lib/data/logia-activa";
import { listTenidas, listMiembros, listAsistencias, MiembroTenida, AsistenciaRow } from "@/lib/data/tenidas";
import { Tenida } from "@/lib/types";
import TenidasClient from "./TenidasClient";

// Server Component: carga tenidas, miembros y asistencias de la logia (RLS) en el servidor. La
// logia sobre la que opera un admin global viene de la logia activa (selector del header).
export const metadata = { title: "Tenidas · Plataforma Masónica" };

export default async function Tenidas() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const perfil = await cargarPerfil(supabase, user.id);
  if (!perfil) return null;
  const { logiaId, global } = await resolverLogiaActiva(supabase, perfil);

  // Sin logia en foco (global sin logias creadas): no consultar con id vacío.
  const [tenidas, miembros, asistencias] = logiaId
    ? await Promise.all([
        listTenidas(supabase, logiaId),
        listMiembros(supabase, logiaId),
        listAsistencias(supabase),
      ])
    : [[] as Tenida[], [] as MiembroTenida[], [] as AsistenciaRow[]];

  return <TenidasClient global={global} logiaId={logiaId}
    tenidas={tenidas} miembros={miembros} asistencias={asistencias} />;
}
