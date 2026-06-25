import { createClient } from "@/lib/supabase/server";
import { listDirectorio, listLogias } from "@/lib/data/directorio";
import DirectorioClient from "./DirectorioClient";

// Server Component: obtiene el directorio y las logias en el servidor (RLS aplica) y los pasa
// a la isla cliente, que conserva búsqueda, edición del perfil propio y contacto.
export const metadata = { title: "Directorio · Plataforma Masónica" };

export default async function DirectorioPage() {
  const supabase = await createClient();
  const [perfiles, logias] = await Promise.all([
    listDirectorio(supabase),
    listLogias(supabase),
  ]);
  return <DirectorioClient perfiles={perfiles} logias={logias} />;
}
