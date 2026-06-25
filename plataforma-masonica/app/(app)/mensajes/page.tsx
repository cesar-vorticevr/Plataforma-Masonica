import { createClient } from "@/lib/supabase/server";
import { listMensajes } from "@/lib/data/mensajes";
import MensajesClient from "./MensajesClient";

// Server Component: carga el buzón inicial (RLS solo emisor/receptor) en el servidor.
export default async function MensajesPage() {
  const supabase = await createClient();
  const mensajes = await listMensajes(supabase);
  return <MensajesClient inicial={mensajes} />;
}
