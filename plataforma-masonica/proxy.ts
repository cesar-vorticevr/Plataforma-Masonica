import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Proxy (en Next 16, antes "Middleware"). Refresca la sesión de Supabase en cada request y
// propaga las cookies renovadas a la respuesta. NO autoriza: el gate real vive en el server
// layout (getUser) y en las RLS. Patrón @supabase/ssr + doc de Proxy de Next.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options));
        },
      },
    }
  );

  // Refresca el token si expiró y valida la sesión (getClaims → getSession). No usamos
  // getSession() a secas para autorizar; aquí solo es para mantener viva la sesión.
  await supabase.auth.getClaims();

  return response;
}

export const config = {
  // Corre en todas las rutas salvo estáticos e imágenes (matcher oficial de Next).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
