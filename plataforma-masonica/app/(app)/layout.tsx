import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/server";

// Gate de autenticación en servidor: sin sesión válida, redirige a /login antes de renderizar
// nada del área privada. El AuthProvider (sembrado en el root) provee el usuario a AppShell.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <AppShell>{children}</AppShell>;
}
