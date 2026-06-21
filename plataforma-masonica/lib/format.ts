export function fecha(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}
export function fechaHora(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
export function money(n: number) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}
export function initials(name: string) {
  return name.split(" ").slice(0,2).map(p => p[0]).join("").toUpperCase();
}
