import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import RegisterForm, { LogiaOpcion } from "./RegisterForm";

export const metadata: Metadata = { title: "Crear registro · Plataforma Masónica" };

// Server Component: carga las logias (RLS logias_read = true) en el servidor; el formulario es isla.
// Solo se ofrecen logias activas: una logia inactiva está archivada y no admite registros nuevos.
export default async function RegisterPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("logias").select("id,nombre,numero,oriente").eq("estado", "activa").order("numero");
  return <RegisterForm logias={(data ?? []) as LogiaOpcion[]} />;
}
