import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/server";
import { cargarPerfil } from "@/lib/data/perfil";
import { resolverLogiaActiva } from "@/lib/data/logia-activa";

// Gate de autenticación en servidor: sin sesión válida, redirige a /login antes de renderizar
// nada del área privada. Además, un usuario bloqueado pierde el acceso (se le expulsa a la
// pantalla de cuenta bloqueada, que cierra su sesión). El AuthProvider provee el usuario a AppShell.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const perfil = await cargarPerfil(supabase, user.id);
  if (perfil?.estado === "bloqueado") redirect("/cuenta-bloqueada");

  // Logia activa para el selector del header (solo admins globales). Fuente única en el servidor:
  // el header y las páginas de una sola logia leen la misma cookie validada.
  const { logias, logiaId } = perfil
    ? await resolverLogiaActiva(supabase, perfil)
    : { logias: [], logiaId: "" };

  return <AppShell logias={logias} logiaActivaId={logiaId}>{children}</AppShell>;
}
