import { createClient } from "@/lib/supabase/server";
import { listEventos } from "@/lib/data/eventos";
import EventosClient from "./EventosClient";

// Server Component: lista los eventos visibles (RLS) en el servidor y los pasa a la isla.
export const metadata = { title: "Eventos · Plataforma Masónica" };

export default async function Eventos() {
  const supabase = await createClient();
  const eventos = await listEventos(supabase);
  return <EventosClient eventos={eventos} />;
}
