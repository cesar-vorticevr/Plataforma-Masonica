import { createClient } from "@/lib/supabase/server";
import { listBuzon } from "@/lib/data/buzon";
import BuzonClient from "./BuzonClient";

// Server Component: lista los documentos del buzón (RLS solo administradores) en el servidor.
export default async function Buzon() {
  const supabase = await createClient();
  const docs = await listBuzon(supabase);
  return <BuzonClient docs={docs} />;
}
