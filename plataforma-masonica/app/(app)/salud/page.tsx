import { createClient } from "@/lib/supabase/server";
import { listEvaluaciones, tieneConsentimiento, AVISO_PRIVACIDAD_VERSION } from "@/lib/data/salud";
import SaludClient from "./SaludClient";

// Server Component: carga SOLO las evaluaciones del propio usuario (RLS solo-dueño) y su estado de
// consentimiento. El dato individual de salud nunca sale del ámbito del dueño.
export const metadata = { title: "Salud · Plataforma Masónica" };

export default async function SaludPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const [evals, consentido] = await Promise.all([
    listEvaluaciones(supabase, user.id),
    tieneConsentimiento(supabase, user.id, AVISO_PRIVACIDAD_VERSION),
  ]);
  return <SaludClient userId={user.id} evals={evals} consentido={consentido} />;
}
