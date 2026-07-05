import { Camara, Grado, Rol, Usuario } from "./types";

// Jerarquía de cámaras: un maestro ve los 3 grados, etc.
const ORDEN_CAMARA: Camara[] = ["aprendiz", "companero", "maestro"];

export function nivelCamara(c: Camara): number {
  return ORDEN_CAMARA.indexOf(c);
}

// ¿El usuario (por su grado) puede ver un trabajo de cierta cámara?
export function puedeVerTrabajo(grado: Grado, camaraTrabajo: Camara): boolean {
  if (!grado) return false;
  return nivelCamara(grado as Camara) >= nivelCamara(camaraTrabajo);
}

export function esAdminLogia(rol: Rol): boolean {
  return rol === "secretario" || rol === "gran_secretario" || rol === "master";
}
export function esGlobal(rol: Rol): boolean {
  return rol === "gran_secretario" || rol === "master";
}
export function validado(u: Usuario): boolean {
  return u.estado === "validado";
}
export function accesoCompleto(u: Usuario): boolean {
  // Hermano necesita estar validado y con grado; los roles administrativos siempre.
  if (esAdminLogia(u.rol) || u.rol === "tesorero") return true;
  return u.estado === "validado" && !!u.grado;
}

// Permisos puntuales usados por la navegación y las pantallas
export const can = {
  verGenerales: (u: Usuario) => esAdminLogia(u.rol),
  publicarEventos: (u: Usuario) => esAdminLogia(u.rol),
  buzonInterlogial: (u: Usuario) => esAdminLogia(u.rol),
  correspondencia: (u: Usuario) => esAdminLogia(u.rol),
  tesoreria: (u: Usuario) => u.rol === "tesorero" || u.rol === "secretario" || u.rol === "master",
  tenidas: (u: Usuario) => u.rol === "secretario" || u.rol === "master",
  // Cifras de cápitas en Estadísticas: master (todas), secretario (su logia) y Gran Secretario
  // (agregado por logia, sin datos individuales; §4.2 Tesorería = Agreg para Gran Secretario).
  verCapitasStats: (u: Usuario) => u.rol === "master" || u.rol === "secretario" || u.rol === "gran_secretario",
  administrar: (u: Usuario) => esAdminLogia(u.rol),
  altaLogias: (u: Usuario) => esGlobal(u.rol),
  directorio: (u: Usuario) => accesoCompleto(u),
  trabajos: (u: Usuario) => accesoCompleto(u),
};
