import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import RegisterForm, { LogiaOpcion } from "./RegisterForm";

export const metadata: Metadata = { title: "Crear registro · Plataforma Masónica" };

// Server Component: carga las logias en el servidor; el formulario es isla.
// /register es público (rol `anon`), y la policy logias_read está restringida a
// `authenticated`; por eso el listado viene de listar_logias_registro() (SECURITY DEFINER,
// legible por anon), que devuelve solo columnas no sensibles de logias activas —nunca la
// palabra clave—. Una logia inactiva está archivada y no admite registros nuevos.
export default async function RegisterPage() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("listar_logias_registro");
  return <RegisterForm logias={(data ?? []) as LogiaOpcion[]} />;
}
