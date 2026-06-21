"use client";
import { DB, seed } from "./seed";
import {
  Asistencia, Correspondencia, DocumentoBuzon, Evento, EvaluacionSalud, Generales,
  Logia, MensajeProfesional, Pago, PerfilProfesional, Tenida, Trabajo, Usuario, Grado, Rol,
} from "../types";

const KEY = "plataforma_masonica_db_v1";
let mem: DB | null = null;

function load(): DB {
  if (mem) return mem;
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(KEY);
    if (raw) { try { mem = JSON.parse(raw); return mem!; } catch {} }
  }
  mem = seed();
  persist();
  return mem!;
}
function persist() {
  if (typeof window !== "undefined" && mem) {
    window.localStorage.setItem(KEY, JSON.stringify(mem));
  }
}
export function resetDB() { mem = seed(); persist(); }
export function db(): DB { return load(); }
const uid = () => Math.random().toString(36).slice(2, 10);

// ---------- Usuarios / Logias ----------
export const getUsuario = (id: string) => db().usuarios.find(u => u.id === id);
export const getUsuarioPorEmail = (email: string) =>
  db().usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
export const getLogia = (id: string) => db().logias.find(l => l.id === id);
export const listLogias = () => db().logias;
export const listUsuariosLogia = (logiaId: string) =>
  db().usuarios.filter(u => u.logia_id === logiaId);
export const listUsuarios = () => db().usuarios;

export function crearUsuario(data: {
  nombre: string; email: string; logia_id: string; rol?: Rol;
}): Usuario {
  const u: Usuario = {
    id: uid(), nombre: data.nombre, email: data.email, rol: data.rol ?? "hermano",
    grado: null, logia_id: data.logia_id, estado: "pendiente",
    fecha_registro: new Date().toISOString(),
  };
  db().usuarios.push(u); persist(); return u;
}
export function actualizarUsuario(id: string, patch: Partial<Usuario>) {
  const u = getUsuario(id); if (!u) return;
  Object.assign(u, patch); persist();
}
export function validarUsuario(id: string, grado: Grado) {
  actualizarUsuario(id, { estado: "validado", grado });
}
export function cambiarPalabraClaveLogia(logiaId: string, palabra: string) {
  const l = getLogia(logiaId); if (!l) return;
  l.palabra_clave = palabra; persist();
}
export function crearLogia(data: { nombre: string; numero: number; oriente: string }) {
  const l: Logia = { id: uid(), ...data, palabra_clave: "BOAZ", estado: "activa" };
  db().logias.push(l); persist(); return l;
}

// ---------- Generales / Perfil ----------
export const getGenerales = (uid: string) => db().generales.find(g => g.usuario_id === uid);
export function guardarGenerales(g: Generales) {
  const i = db().generales.findIndex(x => x.usuario_id === g.usuario_id);
  if (i >= 0) db().generales[i] = g; else db().generales.push(g);
  persist();
}
export const getPerfil = (uid: string) => db().perfiles.find(p => p.usuario_id === uid);
export function guardarPerfil(p: PerfilProfesional) {
  const i = db().perfiles.findIndex(x => x.usuario_id === p.usuario_id);
  if (i >= 0) db().perfiles[i] = p; else db().perfiles.push(p);
  persist();
}
export const listPerfilesDirectorio = () =>
  db().perfiles.filter(p => p.mostrar_en_directorio);

// ---------- Salud ----------
export const listEvaluaciones = (uid: string) =>
  db().evaluaciones.filter(e => e.usuario_id === uid).sort((a,b) => a.fecha.localeCompare(b.fecha));
export function addEvaluacion(e: EvaluacionSalud) { db().evaluaciones.push(e); persist(); }
export const listTodasEvaluaciones = () => db().evaluaciones;

// ---------- Eventos ----------
export function listEventos(logiaId: string): Evento[] {
  return db().eventos
    .filter(e => e.alcance === "global" || e.logia_id === logiaId)
    .sort((a,b) => b.fecha_evento.localeCompare(a.fecha_evento));
}
export function addEvento(e: Omit<Evento,"id"|"creado">) {
  db().eventos.push({ ...e, id: uid(), creado: new Date().toISOString() }); persist();
}

// ---------- Buzón / Correspondencia ----------
export const listBuzon = () => db().buzon.slice().sort((a,b)=>b.fecha.localeCompare(a.fecha));
export function addBuzon(d: Omit<DocumentoBuzon,"id"|"fecha">) {
  db().buzon.push({ ...d, id: uid(), fecha: new Date().toISOString() }); persist();
}
export function listCorrespondencia(logiaId: string): Correspondencia[] {
  return db().correspondencia
    .filter(c => c.de_logia_id === logiaId || c.destinatarios_logia_ids.includes(logiaId))
    .sort((a,b)=>b.fecha.localeCompare(a.fecha));
}
export function addCorrespondencia(c: Omit<Correspondencia,"id"|"fecha"|"leido_por">) {
  db().correspondencia.push({ ...c, id: uid(), fecha: new Date().toISOString(), leido_por: [c.autor_id] }); persist();
}

// ---------- Mensajería profesional ----------
export function listMensajes(uid: string) {
  return db().mensajes
    .filter(m => m.de_usuario_id === uid || m.a_usuario_id === uid)
    .sort((a,b)=>b.fecha.localeCompare(a.fecha));
}
export function conversacion(a: string, b: string) {
  return db().mensajes
    .filter(m => (m.de_usuario_id===a && m.a_usuario_id===b) || (m.de_usuario_id===b && m.a_usuario_id===a))
    .sort((x,y)=>x.fecha.localeCompare(y.fecha));
}
export function enviarMensaje(de: string, a: string, cuerpo: string) {
  db().mensajes.push({ id: uid(), de_usuario_id: de, a_usuario_id: a, cuerpo, fecha: new Date().toISOString(), leido: false });
  persist();
}

// ---------- Trabajos ----------
export const listTrabajosLogia = (logiaId: string) =>
  db().trabajos.filter(t => t.logia_id === logiaId).sort((a,b)=>b.fecha.localeCompare(a.fecha));
export function addTrabajo(t: Omit<Trabajo,"id"|"fecha">) {
  db().trabajos.push({ ...t, id: uid(), fecha: new Date().toISOString() }); persist();
}

// ---------- Tesorería ----------
export const getCapita = (logiaId: string) => db().capitas.find(c => c.logia_id === logiaId);
export function setCapita(logiaId: string, monto: number) {
  const c = getCapita(logiaId);
  if (c) c.monto = monto; else db().capitas.push({ logia_id: logiaId, monto, periodicidad: "mensual" });
  persist();
}
export function listPagos(uid: string, anio: number) {
  return db().pagos.filter(p => p.usuario_id === uid && p.anio === anio);
}
export function togglePago(usuarioId: string, anio: number, mes: number, registradoPor: string, monto: number) {
  let p = db().pagos.find(x => x.usuario_id===usuarioId && x.anio===anio && x.mes===mes);
  if (!p) {
    p = { id: uid(), usuario_id: usuarioId, anio, mes, monto, pagado: true, registrado_por: registradoPor, fecha_registro: new Date().toISOString() };
    db().pagos.push(p);
  } else {
    p.pagado = !p.pagado; p.registrado_por = registradoPor; p.fecha_registro = new Date().toISOString(); p.monto = monto;
  }
  persist();
}

// ---------- Tenidas / Asistencia ----------
export const listTenidas = (logiaId: string) =>
  db().tenidas.filter(t => t.logia_id === logiaId).sort((a,b)=>b.fecha.localeCompare(a.fecha));
export function addTenida(logiaId: string, titulo: string, fecha: string) {
  db().tenidas.push({ id: uid(), logia_id: logiaId, titulo, fecha }); persist();
}
export const listAsistencias = (tenidaId: string) =>
  db().asistencias.filter(a => a.tenida_id === tenidaId);
export function setAsistencia(tenidaId: string, usuarioId: string, presente: boolean) {
  let a = db().asistencias.find(x => x.tenida_id===tenidaId && x.usuario_id===usuarioId);
  if (!a) { a = { id: uid(), tenida_id: tenidaId, usuario_id: usuarioId, presente }; db().asistencias.push(a); }
  else a.presente = presente;
  persist();
}
export function asistenciasUsuario(usuarioId: string, logiaId: string) {
  const tenidas = listTenidas(logiaId);
  const total = tenidas.length;
  let presentes = 0;
  for (const t of tenidas) {
    const a = db().asistencias.find(x => x.tenida_id===t.id && x.usuario_id===usuarioId);
    if (a?.presente) presentes++;
  }
  return { total, presentes, pct: total ? Math.round((presentes/total)*100) : 0 };
}

// ---------- Estadísticas agregadas (anonimizadas) ----------
export interface StatsLogia {
  logiaId: string;
  nombre: string;
  oriente: string;
  totalMiembros: number;
  validados: number;
  pendientes: number;
  capitasPct: number;        // % cumplimiento cápitas (año actual)
  asistenciaPct: number;     // % asistencia promedio
  evaluados: number;         // hermanos con al menos una evaluación de salud
  saludMetab: { verde: number; amarillo: number; rojo: number };
  saludOnc: { verde: number; amarillo: number; rojo: number };
  etiquetas: Record<string, number>;
  condiciones: Record<string, number>;
}

export function statsLogia(logiaId: string): StatsLogia {
  const l = getLogia(logiaId)!;
  const miembros = listUsuariosLogia(logiaId).filter(u => u.rol !== "master" && u.rol !== "gran_secretario");
  const anio = new Date().getFullYear();

  let capSum = 0, capN = 0, asisSum = 0, asisN = 0;
  const saludMetab = { verde: 0, amarillo: 0, rojo: 0 };
  const saludOnc = { verde: 0, amarillo: 0, rojo: 0 };
  const etiquetas: Record<string, number> = {};
  const condiciones: Record<string, number> = {};
  let evaluados = 0;

  for (const m of miembros) {
    const c = cumplimientoCapitas(m, anio);
    if (c.count > 0) { capSum += c.pct; capN++; }
    const a = asistenciasUsuario(m.id, logiaId);
    if (a.total) { asisSum += a.pct; asisN++; }
    const evals = listEvaluaciones(m.id);
    if (evals.length) {
      evaluados++;
      const u = evals[evals.length - 1];
      saludMetab[u.semaforo_metabolico]++;
      saludOnc[u.semaforo_oncologico]++;
      for (const t of u.etiquetas) etiquetas[t] = (etiquetas[t] ?? 0) + 1;
      for (const cd of (u.condiciones ?? [])) condiciones[cd] = (condiciones[cd] ?? 0) + 1;
    }
  }

  return {
    logiaId, nombre: l.nombre, oriente: l.oriente,
    totalMiembros: miembros.length,
    validados: miembros.filter(u => u.estado === "validado").length,
    pendientes: miembros.filter(u => u.estado === "pendiente").length,
    capitasPct: capN ? Math.round(capSum / capN) : 0,
    asistenciaPct: asisN ? Math.round(asisSum / asisN) : 0,
    evaluados, saludMetab, saludOnc, etiquetas, condiciones,
  };
}

export function statsTodas(): StatsLogia[] {
  return listLogias().map(l => statsLogia(l.id));
}

export function consolidar(stats: StatsLogia[]) {
  const total = stats.reduce((a, s) => a + s.totalMiembros, 0);
  const validados = stats.reduce((a, s) => a + s.validados, 0);
  const evaluados = stats.reduce((a, s) => a + s.evaluados, 0);
  const capitasPct = stats.length ? Math.round(stats.reduce((a, s) => a + s.capitasPct, 0) / stats.length) : 0;
  const asistenciaPct = stats.length ? Math.round(stats.reduce((a, s) => a + s.asistenciaPct, 0) / stats.length) : 0;
  const etiquetas: Record<string, number> = {};
  const condiciones: Record<string, number> = {};
  const saludMetab = { verde: 0, amarillo: 0, rojo: 0 };
  const saludOnc = { verde: 0, amarillo: 0, rojo: 0 };
  for (const st of stats) {
    for (const [k, v] of Object.entries(st.etiquetas)) etiquetas[k] = (etiquetas[k] ?? 0) + v;
    for (const [k, v] of Object.entries(st.condiciones)) condiciones[k] = (condiciones[k] ?? 0) + v;
    (["verde","amarillo","rojo"] as const).forEach(k => { saludMetab[k] += st.saludMetab[k]; saludOnc[k] += st.saludOnc[k]; });
  }
  return { total, validados, evaluados, capitasPct, asistenciaPct, etiquetas, condiciones, saludMetab, saludOnc };
}

export function topEtiquetas(etiquetas: Record<string, number>, n = 6) {
  return Object.entries(etiquetas).sort((a, b) => b[1] - a[1]).slice(0, n);
}

// ---------- Cápitas: rango por mes actual y fecha de inicio ----------
export function rangoCapitas(usuario: Usuario, anio: number) {
  const now = new Date();
  const finMes = anio === now.getFullYear() ? now.getMonth() + 1 : 12;
  const inicio = new Date(usuario.fecha_inicio ?? usuario.fecha_registro);
  if (inicio.getFullYear() > anio) return { iniMes: 0, finMes, count: 0 }; // aún no iniciaba
  const iniMes = inicio.getFullYear() === anio ? inicio.getMonth() + 1 : 1;
  if (iniMes > finMes) return { iniMes, finMes, count: 0 };
  return { iniMes, finMes, count: finMes - iniMes + 1 };
}

export function cumplimientoCapitas(usuario: Usuario, anio: number) {
  const r = rangoCapitas(usuario, anio);
  if (r.count === 0) return { ...r, pagados: 0, pendientes: 0, pct: 0 };
  const pagados = listPagos(usuario.id, anio)
    .filter(p => p.pagado && p.mes >= r.iniMes && p.mes <= r.finMes).length;
  return { ...r, pagados, pendientes: r.count - pagados, pct: Math.round((pagados / r.count) * 100) };
}

export function mesAplica(usuario: Usuario, anio: number, mes: number) {
  const r = rangoCapitas(usuario, anio);
  return r.count > 0 && mes >= r.iniMes && mes <= r.finMes;
}

export function setInicioUsuario(userId: string, fechaISO: string) {
  actualizarUsuario(userId, { fecha_inicio: fechaISO });
}

// ---------- Notificaciones (último visto) ----------
const SEEN_KEY = "plataforma_masonica_seen_v1";
function seenMap(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem(SEEN_KEY) ?? "{}"); } catch { return {}; }
}
function saveSeen(m: Record<string, number>) {
  if (typeof window !== "undefined") window.localStorage.setItem(SEEN_KEY, JSON.stringify(m));
}
export function getLastSeen(userId: string, key: string): number {
  return seenMap()[`${userId}:${key}`] ?? 0;
}
export function marcarVisto(userId: string, key: string) {
  const m = seenMap(); m[`${userId}:${key}`] = Date.now(); saveSeen(m);
}

export function nuevosEventos(u: Usuario): number {
  const last = getLastSeen(u.id, "eventos");
  return listEventos(u.logia_id).filter(e => new Date(e.creado).getTime() > last).length;
}
export function marcarEventosVistos(userId: string) { marcarVisto(userId, "eventos"); }

export function unreadMensajes(userId: string): number {
  return db().mensajes.filter(m => m.a_usuario_id === userId && !m.leido).length;
}
export function marcarMensajesLeidos(userId: string, deUsuarioId?: string) {
  let cambios = false;
  for (const m of db().mensajes) {
    if (m.a_usuario_id === userId && !m.leido && (!deUsuarioId || m.de_usuario_id === deUsuarioId)) {
      m.leido = true; cambios = true;
    }
  }
  if (cambios) persist();
}
