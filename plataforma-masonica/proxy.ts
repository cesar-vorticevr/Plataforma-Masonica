import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Proxy (antes "middleware" en Next < 16): refresca la sesión de Supabase en cada
// request y protege las rutas privadas en el servidor.
const PUBLICAS = ["/", "/login", "/register", "/privacidad"];

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } });

  // Solo actúa en modo supabase con configuración presente; en mock, pasa de largo.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (process.env.NEXT_PUBLIC_DATA_MODE !== "supabase" || !url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getUser() valida contra el servidor de Auth (no confiar solo en getSession).
  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  if (!user && !PUBLICAS.includes(path)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }
  return response;
}

export const config = {
  // Excluye estáticos y /api (el registro debe ser accesible sin sesión).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
