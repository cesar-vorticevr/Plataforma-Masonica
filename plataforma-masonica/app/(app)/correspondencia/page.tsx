import { createClient } from "@/lib/supabase/server";
import { listCorrespondencia, listLogias } from "@/lib/data/correspondencia";
import CorrespondenciaClient from "./CorrespondenciaClient";

// Server Component: lista la correspondencia (RLS emisor/destinatarios/global) y las logias.
export const metadata = { title: "Correspondencia · Plataforma Masónica" };

export default async function CorrespondenciaPage() {
  const supabase = await createClient();
  const [items, logias] = await Promise.all([
    listCorrespondencia(supabase),
    listLogias(supabase),
  ]);
  return <CorrespondenciaClient items={items} logias={logias} />;
}
