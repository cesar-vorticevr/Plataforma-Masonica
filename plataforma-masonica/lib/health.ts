import { EvaluacionSalud, RespuestasSalud, Semaforo } from "./types";

// ====================================================================
// Cuestionario de salud (base: Proyecto Salud Integral)
// LÓGICA ORIENTATIVA - debe ser validada por un médico. No es diagnóstico.
// ====================================================================

export type TipoPregunta = "si_no" | "numero" | "opciones";
export interface Pregunta {
  id: string;
  bloque: "metabolico" | "oncologico" | "habitos" | "condiciones";
  texto: string;
  tipo: TipoPregunta;
  opciones?: { label: string; valor: number }[];
  alarma?: boolean; // síntoma de alarma oncológico -> rojo automático
}

export const PREGUNTAS: Pregunta[] = [
  // Metabólico
  { id: "edad", bloque: "metabolico", texto: "¿Cuál es tu rango de edad?", tipo: "opciones",
    opciones: [
      { label: "Menos de 45", valor: 0 },
      { label: "45 a 54", valor: 2 },
      { label: "55 a 64", valor: 3 },
      { label: "65 o más", valor: 4 },
    ] },
  { id: "imc", bloque: "metabolico", texto: "¿Cómo es tu peso corporal (IMC)?", tipo: "opciones",
    opciones: [
      { label: "Normal", valor: 0 },
      { label: "Sobrepeso (IMC 25-30)", valor: 1 },
      { label: "Obesidad (IMC > 30)", valor: 3 },
    ] },
  { id: "cintura", bloque: "metabolico", texto: "¿Tu perímetro de cintura es elevado? (hombre >90cm)", tipo: "si_no" },
  { id: "actividad", bloque: "metabolico", texto: "¿Llevas un estilo de vida sedentario (poca actividad física)?", tipo: "si_no" },
  { id: "medicacion_presion", bloque: "metabolico", texto: "¿Tomas medicación para la presión arterial?", tipo: "si_no" },
  { id: "glucosa_elevada", bloque: "metabolico", texto: "¿Alguna vez te han detectado glucosa elevada?", tipo: "si_no" },
  { id: "antecedente_diabetes", bloque: "metabolico", texto: "¿Tienes antecedentes familiares de diabetes?", tipo: "si_no" },

  // Hábitos
  { id: "tabaco", bloque: "habitos", texto: "¿Fumas actualmente o has fumado regularmente?", tipo: "si_no" },
  { id: "alcohol", bloque: "habitos", texto: "¿Consumes bebidas alcohólicas con frecuencia?", tipo: "si_no" },
  { id: "dieta", bloque: "habitos", texto: "¿Tu dieta es baja en frutas y verduras?", tipo: "si_no" },

  // Oncológico
  { id: "fam_cancer", bloque: "oncologico", texto: "¿Tienes familiares directos diagnosticados con cáncer?", tipo: "si_no" },
  { id: "fam_cancer_temprano", bloque: "oncologico", texto: "¿Algún familiar desarrolló cáncer (mama, ovario, colon o próstata) antes de los 50 años?", tipo: "si_no" },
  { id: "exposicion", bloque: "oncologico", texto: "¿Exposición frecuente al sol sin protección o a químicos tóxicos en el trabajo?", tipo: "si_no" },
  { id: "perdida_peso", bloque: "oncologico", texto: "¿Pérdida de peso inexplicable (más de 4.5 kg) en los últimos meses?", tipo: "si_no", alarma: true },
  { id: "fatiga", bloque: "oncologico", texto: "¿Fatiga extrema y constante que no mejora con el descanso?", tipo: "si_no", alarma: true },
  { id: "dolor_fiebre", bloque: "oncologico", texto: "¿Dolor persistente o fiebre recurrente sin causa aparente?", tipo: "si_no", alarma: true },
  { id: "bultos", bloque: "oncologico", texto: "¿Bultos nuevos o engrosamiento de la piel en alguna parte del cuerpo?", tipo: "si_no", alarma: true },
  { id: "lunar", bloque: "oncologico", texto: "¿Cambio en tamaño, forma o color de un lunar o mancha?", tipo: "si_no", alarma: true },
  { id: "tos", bloque: "oncologico", texto: "¿Tos persistente, dificultad para respirar o cambios en la voz por más de 2 semanas?", tipo: "si_no", alarma: true },
  { id: "habitos_intestinales", bloque: "oncologico", texto: "¿Cambios inusuales en hábitos intestinales o urinarios (sangre, dolor, etc.)?", tipo: "si_no", alarma: true },

  // Padecimientos diagnosticados (enfermedades básicas)
  { id: "diabetes", bloque: "condiciones", texto: "¿Te han diagnosticado diabetes?", tipo: "si_no" },
  { id: "hipertension", bloque: "condiciones", texto: "¿Te han diagnosticado hipertensión (presión alta)?", tipo: "si_no" },
  { id: "colesterol", bloque: "condiciones", texto: "¿Te han diagnosticado colesterol o triglicéridos altos?", tipo: "si_no" },
  { id: "cardiopatia", bloque: "condiciones", texto: "¿Padeces alguna enfermedad del corazón?", tipo: "si_no" },
  { id: "tiroides", bloque: "condiciones", texto: "¿Tienes problemas de tiroides?", tipo: "si_no" },
  { id: "renal", bloque: "condiciones", texto: "¿Padeces alguna enfermedad renal (de los riñones)?", tipo: "si_no" },
  { id: "respiratoria", bloque: "condiciones", texto: "¿Padeces asma o EPOC (enfermedad respiratoria)?", tipo: "si_no" },
];

const PESO_SI: Record<string, number> = {
  cintura: 4, actividad: 2, medicacion_presion: 2, glucosa_elevada: 5, antecedente_diabetes: 4,
  fam_cancer: 1, fam_cancer_temprano: 2, exposicion: 1,
  perdida_peso: 1, fatiga: 1, dolor_fiebre: 1, bultos: 1, lunar: 1, tos: 1, habitos_intestinales: 1,
};

export interface ResultadoEvaluacion {
  puntaje_metabolico: number;
  puntaje_oncologico: number;
  semaforo_metabolico: Semaforo;
  semaforo_oncologico: Semaforo;
  etiquetas: string[];
  condiciones: string[];
}

export function evaluar(resp: RespuestasSalud): ResultadoEvaluacion {
  let met = 0, onc = 0;
  const etiquetas: string[] = [];
  let alarma = false;

  for (const p of PREGUNTAS) {
    const v = resp[p.id];
    if (p.tipo === "opciones") {
      const num = Number(v ?? 0);
      if (p.bloque === "metabolico") met += num;
    } else if (p.tipo === "si_no") {
      if (v === true || v === "si") {
        const peso = PESO_SI[p.id] ?? 1;
        if (p.bloque === "metabolico") met += peso;
        if (p.bloque === "oncologico") { onc += peso; if (p.alarma) alarma = true; }
      }
    }
  }

  // Etiquetas de hábitos / riesgo
  if (resp.tabaco === true || resp.tabaco === "si") etiquetas.push("tabaquismo");
  if (resp.alcohol === true || resp.alcohol === "si") etiquetas.push("alcohol");
  if (resp.actividad === true || resp.actividad === "si") etiquetas.push("sedentarismo");
  if (resp.dieta === true || resp.dieta === "si") etiquetas.push("dieta_baja_frutas_verduras");
  if (Number(resp.imc) >= 3) etiquetas.push("obesidad");
  else if (Number(resp.imc) >= 1) etiquetas.push("sobrepeso");
  if (resp.glucosa_elevada === true || resp.glucosa_elevada === "si") etiquetas.push("glucosa_elevada");
  if (resp.fam_cancer_temprano === true || resp.fam_cancer_temprano === "si") etiquetas.push("antecedente_familiar_cancer");
  if (alarma) etiquetas.push("sintoma_de_alarma");

  // Padecimientos (enfermedades) diagnosticados + derivados por IMC
  const condiciones: string[] = [];
  for (const id of ["diabetes","hipertension","colesterol","cardiopatia","tiroides","renal","respiratoria"]) {
    if (resp[id] === true || resp[id] === "si") condiciones.push(id);
  }
  if (Number(resp.imc) >= 3) condiciones.push("obesidad");
  else if (Number(resp.imc) >= 1) condiciones.push("sobrepeso");

  const semaforo_metabolico: Semaforo = met >= 15 ? "rojo" : met >= 7 ? "amarillo" : "verde";
  if (semaforo_metabolico === "rojo") etiquetas.push("riesgo_metabolico_alto");

  let semaforo_oncologico: Semaforo = onc >= 6 ? "rojo" : onc >= 3 ? "amarillo" : "verde";
  if (alarma) semaforo_oncologico = "rojo";

  return {
    puntaje_metabolico: met, puntaje_oncologico: onc,
    semaforo_metabolico, semaforo_oncologico,
    etiquetas: Array.from(new Set(etiquetas)),
    condiciones: Array.from(new Set(condiciones)),
  };
}

export const SEMAFORO_TEXTO: Record<Semaforo, { label: string; mensaje: string }> = {
  verde: { label: "Riesgo bajo", mensaje: "Mantén tus hábitos saludables y repite la evaluación periódicamente." },
  amarillo: { label: "Riesgo moderado", mensaje: "Conviene mejorar hábitos y considerar una valoración médica preventiva." },
  rojo: { label: "Riesgo alto", mensaje: "Se recomienda acudir a valoración médica. Esto no es un diagnóstico." },
};

export function mejora(actual: EvaluacionSalud, previa?: EvaluacionSalud) {
  if (!previa) return null;
  return {
    metabolico: previa.puntaje_metabolico - actual.puntaje_metabolico,
    oncologico: previa.puntaje_oncologico - actual.puntaje_oncologico,
  };
}
