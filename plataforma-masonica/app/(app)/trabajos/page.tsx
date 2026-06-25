import { createClient } from "@/lib/supabase/server";
import { listTrabajos } from "@/lib/data/trabajos";
import TrabajosClient from "./TrabajosClient";

// Server Component: lista los trabajos visibles para el grado del usuario (RLS) en el servidor.
export const metadata = { title: "Trabajos · Plataforma Masónica" };

export default async function TrabajosPage() {
  const supabase = await createClient();
  const trabajos = await listTrabajos(supabase);
  return <TrabajosClient trabajos={trabajos} />;
}
