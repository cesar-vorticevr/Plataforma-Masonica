import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { cargarPerfil } from "@/lib/data/perfil";

export const metadata: Metadata = {
  title: "Plataforma Masónica · Gran Logia Restauración",
  description: "Administración integral de hermanos, salud, tesorería y comunicación.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Resolvemos la sesión en el servidor y sembramos el AuthProvider con el perfil (o null).
  // Así las islas cliente usan useAuth() sin un getUser() de cliente en el arranque.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const perfil = user ? await cargarPerfil(supabase, user.id) : null;

  return (
    <html lang="es">
      <body>
        <AuthProvider initialUser={perfil}>{children}</AuthProvider>
      </body>
    </html>
  );
}
