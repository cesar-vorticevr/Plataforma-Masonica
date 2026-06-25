import { createClient } from "@/lib/supabase/server";
import { getGenerales } from "@/lib/data/generales";
import GeneralesForm from "./GeneralesForm";

// Server Component: carga los generales del usuario en el servidor (RLS) y los pasa al formulario.
export default async function GeneralesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const generales = await getGenerales(supabase, user.id);
  return <GeneralesForm userId={user.id} inicial={generales} />;
}
