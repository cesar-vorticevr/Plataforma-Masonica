import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/server";
import { cargarPerfil } from "@/lib/data/perfil";

// Gate de autenticación en servidor: sin sesión válida, redirige a /login antes de renderizar
// nada del área privada. Además, un usuario bloqueado pierde el acceso (se le expulsa a la
// pantalla de cuenta bloqueada, que cierra su sesión). El AuthProvider provee el usuario a AppShell.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const perfil = await cargarPerfil(supabase, user.id);
  if (perfil?.estado === "bloqueado") redirect("/cuenta-bloqueada");
  return <AppShell>{children}</AppShell>;
}
