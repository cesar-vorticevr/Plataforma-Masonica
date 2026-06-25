import { Usuario } from "@/lib/types";
import { can, accesoCompleto } from "@/lib/roles";
import { nuevosEventos } from "@/lib/data/store";
import { contarNoLeidos } from "@/lib/data/mensajes";

export interface NavItem { href: string; label: string; icon: string; show: (u: Usuario) => boolean; badge?: (u: Usuario) => Promise<number> | number; }

export const NAV: NavItem[] = [
  { href: "/dashboard", label: "Inicio", icon: "🏛️", show: () => true },
  { href: "/estadisticas", label: "Estadísticas", icon: "📊", show: u => can.administrar(u) },
  { href: "/salud", label: "Salud", icon: "❤️", show: () => true },
  { href: "/generales", label: "Generales", icon: "📋", show: () => true },
  { href: "/cumplimientos", label: "Cumplimientos", icon: "✅", show: () => true },
  { href: "/directorio", label: "Directorio", icon: "💼", show: u => can.directorio(u) },
  { href: "/mensajes", label: "Mensajes", icon: "✉️", show: u => accesoCompleto(u), badge: u => contarNoLeidos(u.id) },
  { href: "/eventos", label: "Eventos", icon: "📅", show: () => true, badge: u => nuevosEventos(u) },
  { href: "/trabajos", label: "Trabajos", icon: "📜", show: u => can.trabajos(u) },
  { href: "/buzon", label: "Buzón interlogial", icon: "🗂️", show: u => can.buzonInterlogial(u) },
  { href: "/correspondencia", label: "Correspondencia", icon: "📨", show: u => can.correspondencia(u) },
  { href: "/tesoreria", label: "Tesorería", icon: "💰", show: u => can.tesoreria(u) },
  { href: "/tenidas", label: "Tenidas y asistencia", icon: "🗓️", show: u => can.tenidas(u) },
  { href: "/admin", label: "Administración", icon: "⚙️", show: u => can.administrar(u) },
];
