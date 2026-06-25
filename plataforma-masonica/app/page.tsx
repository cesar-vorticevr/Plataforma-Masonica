import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Resuelve el destino en el servidor según haya sesión, sin pasar por un estado de carga cliente.
export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  redirect(user ? "/dashboard" : "/login");
}
