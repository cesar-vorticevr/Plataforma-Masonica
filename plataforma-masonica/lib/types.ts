// ====================================================================
// Tipos centrales de la Plataforma Masónica
// ====================================================================

export type Rol =
  | "master"          // creadores - control total
  | "gran_secretario" // administra secretarios y todas las logias
  | "secretario"      // administra su logia
  | "tesorero"        // gestiona cápitas de su logia
  | "hermano";        // miembro

export type Grado = "aprendiz" | "companero" | "maestro" | null;
export type Camara = "aprendiz" | "companero" | "maestro";
export type EstadoUsuario = "pendiente" | "validado" | "bloqueado";
export type Semaforo = "verde" | "amarillo" | "rojo";
export type AlcanceEvento = "logia" | "global";

export interface Logia {
  id: string;
  nombre: string;
  numero: number;
  oriente: string;
  palabra_clave: string;      // en producción: hash
  estado: "activa" | "inactiva";
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  grado: Grado;
  logia_id: string;
  estado: EstadoUsuario;
  foto?: string;
  fecha_registro: string;
  fecha_inicio?: string;   // cuando comenzó en la Orden / a pagar cápitas
}

export interface Generales {
  usuario_id: string;
  fecha_nacimiento?: string;
  telefono?: string;
  direccion?: string;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_tel?: string;
  tipo_sangre?: string;
  notas?: string;
}

export interface PerfilProfesional {
  usuario_id: string;
  profesion?: string;
  sector?: string;
  negocio?: string;
  descripcion?: string;
  palabras_clave?: string[];
  mostrar_en_directorio: boolean;
}

// Respuestas del cuestionario de salud: por cada pregunta, un valor si/no (boolean o "si"/"no"),
// numérico (opciones) o de texto.
export type RespuestaSalud = string | number | boolean;
export type RespuestasSalud = Record<string, RespuestaSalud>;

export interface EvaluacionSalud {
  id: string;
  usuario_id: string;
  fecha: string;
  respuestas: RespuestasSalud;
  puntaje_metabolico: number;
  puntaje_oncologico: number;
  semaforo_metabolico: Semaforo;
  semaforo_oncologico: Semaforo;
  etiquetas: string[];
  condiciones: string[];   // padecimientos detectados/registrados
}

export interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  fecha_evento: string;
  alcance: AlcanceEvento;
  logia_id: string | null;
  autor_id: string;
  creado: string;
}

export interface DocumentoBuzon {
  id: string;
  titulo: string;
  tipo: "pdf" | "word";
  archivo_nombre: string;
  autor_id: string;
  fecha: string;
}

export interface Correspondencia {
  id: string;
  de_logia_id: string;
  destinatarios_logia_ids: string[];
  asunto: string;
  cuerpo: string;
  adjuntos: { nombre: string; tipo: string; ruta: string }[];
  autor_id: string;
  fecha: string;
  leido_por: string[];
}

export interface MensajeProfesional {
  id: string;
  de_usuario_id: string;
  a_usuario_id: string;
  cuerpo: string;
  fecha: string;
  leido: boolean;
}

export interface Trabajo {
  id: string;
  usuario_id: string;
  logia_id: string;
  titulo: string;
  descripcion?: string;
  archivo_nombre: string;
  camara: Camara;
  fecha: string;
}

export interface ConfigCapita {
  logia_id: string;
  monto: number;
  periodicidad: "mensual";
}

export interface Pago {
  id: string;
  usuario_id: string;
  anio: number;
  mes: number;       // 1-12
  monto: number;
  pagado: boolean;
  registrado_por?: string;
  fecha_registro?: string;
}

export interface Tenida {
  id: string;
  logia_id: string;
  fecha: string;
  titulo: string;
}

export interface Asistencia {
  id: string;
  tenida_id: string;
  usuario_id: string;
  presente: boolean;
}

export const GRADO_LABEL: Record<string, string> = {
  aprendiz: "Aprendiz",
  companero: "Compañero",
  maestro: "Maestro",
};
export const CAMARA_LABEL = GRADO_LABEL;
export const TRABAJO_LABEL: Record<Camara, string> = {
  aprendiz: "Trabajo",
  companero: "Burilado",
  maestro: "Trazado",
};
export const ROL_LABEL: Record<Rol, string> = {
  master: "Administrador Master",
  gran_secretario: "Gran Secretario",
  secretario: "Secretario",
  tesorero: "Tesorero",
  hermano: "Hermano",
};
export const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

export const CONDICION_LABEL: Record<string, string> = {
  diabetes: "Diabetes",
  hipertension: "Hipertensión",
  obesidad: "Obesidad",
  sobrepeso: "Sobrepeso",
  colesterol: "Colesterol/triglicéridos altos",
  cardiopatia: "Enfermedad del corazón",
  tiroides: "Problemas de tiroides",
  renal: "Enfermedad renal",
  respiratoria: "Asma / EPOC",
};
