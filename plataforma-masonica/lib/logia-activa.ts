// Logia activa: la logia sobre la que opera un administrador global (master / gran_secretario),
// que no pertenece a ninguna logia. Se persiste en esta cookie para que la elección se conserve al
// navegar y sea legible por los componentes de servidor (ver lib/data/logia-activa.ts).
//
// IMPORTANTE: la cookie es PREFERENCIA DE UI, nunca autorización. El aislamiento real de datos lo
// garantiza RLS en el servidor; una cookie manipulada no expone datos fuera del alcance del rol.

export const COOKIE_LOGIA_ACTIVA = "logia_activa";

// Lee la cookie de logia activa en el navegador (undefined en servidor o si no existe).
export function leerLogiaActiva(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_LOGIA_ACTIVA}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

// Fija la cookie de logia activa (1 año, raíz). El servidor la revalida contra las logias
// accesibles, así que un valor inválido cae al valor por defecto sin exponer datos.
export function escribirLogiaActiva(id: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_LOGIA_ACTIVA}=${encodeURIComponent(id)}; path=/; max-age=31536000; samesite=lax`;
}
