import {
  Asistencia, ConfigCapita, Correspondencia, DocumentoBuzon, Evento, EvaluacionSalud,
  Generales, Logia, MensajeProfesional, Pago, PerfilProfesional, Tenida, Trabajo, Usuario,
} from "../types";

export interface DB {
  logias: Logia[];
  usuarios: Usuario[];
  generales: Generales[];
  perfiles: PerfilProfesional[];
  evaluaciones: EvaluacionSalud[];
  eventos: Evento[];
  buzon: DocumentoBuzon[];
  correspondencia: Correspondencia[];
  mensajes: MensajeProfesional[];
  trabajos: Trabajo[];
  capitas: ConfigCapita[];
  pagos: Pago[];
  tenidas: Tenida[];
  asistencias: Asistencia[];
  config: { palabra_clave_general: string };
}

const hoy = new Date();
const iso = (d: Date) => d.toISOString();
const diasAtras = (n: number) => iso(new Date(hoy.getTime() - n * 86400000));
const Y = hoy.getFullYear();
const anioFecha = (offsetAnios: number, mes: number) => iso(new Date(Y - offsetAnios, mes - 1, 1));
const inicioMes = (offsetMeses: number) => iso(new Date(Y, hoy.getMonth() - offsetMeses, 1));

export function seed(): DB {
  const logias: Logia[] = [
    { id: "l1", nombre: "Luz y Verdad", numero: 12, oriente: "Villahermosa", palabra_clave: "BOAZ", estado: "activa" },
    { id: "l2", nombre: "Renacimiento", numero: 27, oriente: "Cárdenas", palabra_clave: "BOAZ", estado: "activa" },
    { id: "l3", nombre: "Hijos del Progreso", numero: 5, oriente: "Comalcalco", palabra_clave: "BOAZ", estado: "activa" },
  ];

  const usuarios: Usuario[] = [
    { id: "u_master", nombre: "Creador del Sistema", email: "master@demo.mx", rol: "master", grado: "maestro", logia_id: "l1", estado: "validado", fecha_inicio: anioFecha(5,1), fecha_registro: diasAtras(400) },
    { id: "u_gransec", nombre: "Q.·.H.·. Gran Secretario", email: "gransecretario@demo.mx", rol: "gran_secretario", grado: "maestro", logia_id: "l1", estado: "validado", fecha_inicio: anioFecha(5,1), fecha_registro: diasAtras(380) },
    { id: "u_sec1", nombre: "V.·.H.·. Secretario L12", email: "secretario@demo.mx", rol: "secretario", grado: "maestro", logia_id: "l1", estado: "validado", fecha_inicio: anioFecha(5,1), fecha_registro: diasAtras(360) },
    { id: "u_tes1", nombre: "H.·. Tesorero L12", email: "tesorero@demo.mx", rol: "tesorero", grado: "maestro", logia_id: "l1", estado: "validado", fecha_inicio: anioFecha(4,1), fecha_registro: diasAtras(350) },
    { id: "u_h1", nombre: "Juan Pérez (Aprendiz)", email: "aprendiz@demo.mx", rol: "hermano", grado: "aprendiz", logia_id: "l1", estado: "validado", fecha_inicio: anioFecha(2,1), fecha_registro: diasAtras(120) },
    { id: "u_h2", nombre: "Carlos Ruiz (Compañero)", email: "companero@demo.mx", rol: "hermano", grado: "companero", logia_id: "l1", estado: "validado", fecha_inicio: anioFecha(1,3), fecha_registro: diasAtras(200) },
    { id: "u_h3", nombre: "Miguel Soto (Maestro)", email: "maestro@demo.mx", rol: "hermano", grado: "maestro", logia_id: "l1", estado: "validado", fecha_inicio: anioFecha(3,2), fecha_registro: diasAtras(300) },
    { id: "u_h4", nombre: "Pedro Gómez (Pendiente)", email: "pendiente@demo.mx", rol: "hermano", grado: null, logia_id: "l1", estado: "pendiente", fecha_inicio: inicioMes(0), fecha_registro: diasAtras(3) },
    { id: "u_h5", nombre: "Luis Díaz (L27)", email: "luis@demo.mx", rol: "hermano", grado: "maestro", logia_id: "l2", estado: "validado", fecha_inicio: anioFecha(1,5), fecha_registro: diasAtras(150) },
  ];

  const generales: Generales[] = [
    { usuario_id: "u_h1", fecha_nacimiento: "1988-05-12", telefono: "9931112233", contacto_emergencia_nombre: "María Pérez", contacto_emergencia_tel: "9934445566", tipo_sangre: "O+" },
    { usuario_id: "u_h2", fecha_nacimiento: "1979-09-03", telefono: "9932223344", contacto_emergencia_nombre: "Ana Ruiz", contacto_emergencia_tel: "9935556677", tipo_sangre: "A+" },
    { usuario_id: "u_h3", fecha_nacimiento: "1970-01-20", telefono: "9933334455", contacto_emergencia_nombre: "Rosa Soto", contacto_emergencia_tel: "9936667788", tipo_sangre: "B+" },
  ];

  const perfiles: PerfilProfesional[] = [
    { usuario_id: "u_h1", profesion: "Arquitecto", sector: "Construcción", negocio: "Estudio Pérez Arquitectura", descripcion: "Proyectos residenciales y comerciales, remodelaciones.", palabras_clave: ["arquitectura","construccion","planos","remodelacion"], mostrar_en_directorio: true },
    { usuario_id: "u_h2", profesion: "Contador Público", sector: "Servicios", negocio: "Despacho Ruiz", descripcion: "Contabilidad, impuestos y asesoría fiscal (SAT).", palabras_clave: ["contabilidad","impuestos","sat","fiscal"], mostrar_en_directorio: true },
    { usuario_id: "u_h3", profesion: "Médico Internista", sector: "Salud", negocio: "Consultorio Soto", descripcion: "Medicina interna y metabólica.", palabras_clave: ["medico","salud","diabetes","internista"], mostrar_en_directorio: true },
    { usuario_id: "u_h5", profesion: "Abogado", sector: "Legal", negocio: "Díaz & Asociados", descripcion: "Derecho civil y mercantil.", palabras_clave: ["abogado","legal","civil","mercantil"], mostrar_en_directorio: true },
  ];

  const evaluaciones: EvaluacionSalud[] = [
    { id: "e1", usuario_id: "u_h1", fecha: diasAtras(90), respuestas: {}, puntaje_metabolico: 12, puntaje_oncologico: 4, semaforo_metabolico: "amarillo", semaforo_oncologico: "amarillo", etiquetas: ["sedentarismo","sobrepeso"], condiciones: ["sobrepeso","hipertension"] },
    { id: "e2", usuario_id: "u_h1", fecha: diasAtras(10), respuestas: {}, puntaje_metabolico: 7, puntaje_oncologico: 2, semaforo_metabolico: "amarillo", semaforo_oncologico: "verde", etiquetas: ["sobrepeso"], condiciones: ["sobrepeso"] },
    { id: "e3", usuario_id: "u_h2", fecha: diasAtras(20), respuestas: {}, puntaje_metabolico: 9, puntaje_oncologico: 2, semaforo_metabolico: "amarillo", semaforo_oncologico: "verde", etiquetas: ["glucosa_elevada"], condiciones: ["diabetes"] },
    { id: "e4", usuario_id: "u_h3", fecha: diasAtras(15), respuestas: {}, puntaje_metabolico: 16, puntaje_oncologico: 3, semaforo_metabolico: "rojo", semaforo_oncologico: "amarillo", etiquetas: ["riesgo_metabolico_alto","tabaquismo"], condiciones: ["hipertension","colesterol"] },
    { id: "e5", usuario_id: "u_h5", fecha: diasAtras(8), respuestas: {}, puntaje_metabolico: 11, puntaje_oncologico: 1, semaforo_metabolico: "amarillo", semaforo_oncologico: "verde", etiquetas: ["obesidad","sedentarismo"], condiciones: ["obesidad"] },
  ];

  const eventos: Evento[] = [
    { id: "ev1", titulo: "Tenida de Aniversario", descripcion: "Celebración del aniversario de la Gran Logia. Asistencia general.", fecha_evento: iso(new Date(hoy.getTime()+10*86400000)), alcance: "global", logia_id: null, autor_id: "u_gransec", creado: diasAtras(5) },
    { id: "ev2", titulo: "Jornada de Salud Preventiva", descripcion: "Toma de glucosa y presión para los HH.·. de la L12.", fecha_evento: iso(new Date(hoy.getTime()+20*86400000)), alcance: "logia", logia_id: "l1", autor_id: "u_sec1", creado: diasAtras(2) },
  ];

  const buzon: DocumentoBuzon[] = [
    { id: "d1", titulo: "Plancha de Arquitectura 2026", tipo: "pdf", archivo_nombre: "plancha_2026.pdf", autor_id: "u_gransec", fecha: diasAtras(15) },
    { id: "d2", titulo: "Reglamento interior actualizado", tipo: "word", archivo_nombre: "reglamento.docx", autor_id: "u_sec1", fecha: diasAtras(8) },
  ];

  const correspondencia: Correspondencia[] = [
    { id: "c1", de_logia_id: "l1", destinatarios_logia_ids: ["l2","l3"], asunto: "Invitación a tenida conjunta", cuerpo: "QQ.·.HH.·., se les convoca a la tenida blanca del próximo mes.", adjuntos: [{nombre:"convocatoria.pdf",tipo:"pdf"}], autor_id: "u_sec1", fecha: diasAtras(6), leido_por: ["u_sec1"] },
  ];

  const mensajes: MensajeProfesional[] = [
    { id: "m1", de_usuario_id: "u_h2", a_usuario_id: "u_h1", cuerpo: "Hermano, necesito un arquitecto para una obra. ¿Podemos platicar?", fecha: diasAtras(2), leido: false },
  ];

  const trabajos: Trabajo[] = [
    { id: "t1", usuario_id: "u_h1", logia_id: "l1", titulo: "El sentido del cincel y el mazo", camara: "aprendiz", archivo_nombre: "trabajo_aprendiz.pdf", fecha: diasAtras(40) },
    { id: "t2", usuario_id: "u_h2", logia_id: "l1", titulo: "La piedra cúbica", camara: "companero", archivo_nombre: "burilado_companero.pdf", fecha: diasAtras(25) },
    { id: "t3", usuario_id: "u_h3", logia_id: "l1", titulo: "Simbolismo de la cámara del medio", camara: "maestro", archivo_nombre: "trazado_maestro.pdf", fecha: diasAtras(12) },
  ];

  const capitas: ConfigCapita[] = [{ logia_id: "l1", monto: 300, periodicidad: "mensual" }];

  const pagos: Pago[] = [];
  const anio = hoy.getFullYear();
  for (const uid of ["u_h1","u_h2","u_h3"]) {
    for (let mes = 1; mes <= 12; mes++) {
      const pagado = mes <= (uid === "u_h1" ? 6 : uid === "u_h2" ? 9 : 4);
      pagos.push({ id: `p_${uid}_${mes}`, usuario_id: uid, anio, mes, monto: 300, pagado });
    }
  }

  const tenidas: Tenida[] = [
    { id: "te1", logia_id: "l1", fecha: diasAtras(30), titulo: "Tenida ordinaria de marzo" },
    { id: "te2", logia_id: "l1", fecha: diasAtras(15), titulo: "Tenida ordinaria de abril" },
    { id: "te3", logia_id: "l1", fecha: diasAtras(1), titulo: "Tenida ordinaria de mayo" },
  ];

  const asistencias: Asistencia[] = [];
  const miembrosL1 = ["u_h1","u_h2","u_h3"];
  for (const te of tenidas) {
    for (const uid of miembrosL1) {
      asistencias.push({ id: `a_${te.id}_${uid}`, tenida_id: te.id, usuario_id: uid, presente: Math.random() > 0.3 });
    }
  }

  return {
    logias, usuarios, generales, perfiles, evaluaciones, eventos, buzon,
    correspondencia, mensajes, trabajos, capitas, pagos, tenidas, asistencias,
    config: { palabra_clave_general: "BOAZ" },
  };
}
