"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, PageTitle, Button, SemaforoBadge, Badge, Empty } from "@/components/ui";
import { PREGUNTAS, evaluar, SEMAFORO_TEXTO, mejora } from "@/lib/health";
import { listEvaluaciones, addEvaluacion } from "@/lib/data/store";
import { EvaluacionSalud, CONDICION_LABEL } from "@/lib/types";
import { fecha } from "@/lib/format";

export default function SaludPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"panel" | "cuestionario">("panel");
  const [resp, setResp] = useState<Record<string, any>>({});
  const [tick, setTick] = useState(0);
  if (!user) return null;

  const evals = listEvaluaciones(user.id);
  const ultima = evals[evals.length - 1];
  const previa = evals[evals.length - 2];

  function set(id: string, v: any) { setResp(s => ({ ...s, [id]: v })); }
  function guardar() {
    const r = evaluar(resp);
    const ev: EvaluacionSalud = { id: Math.random().toString(36).slice(2), usuario_id: user!.id,
      fecha: new Date().toISOString(), respuestas: resp, ...r };
    addEvaluacion(ev); setResp({}); setTab("panel"); setTick(t => t + 1);
  }

  return (
    <div key={tick}>
      <PageTitle title="Salud" subtitle="Evaluación orientativa de factores de riesgo. No sustituye una consulta médica."
        action={<Button onClick={() => setTab(tab === "panel" ? "cuestionario" : "panel")}>
          {tab === "panel" ? "Nueva evaluación" : "Ver panel"}</Button>} />

      <Card className="mb-6 border-rose-200 bg-rose-50">
        <div className="flex gap-3 text-sm text-rose-800">
          <span className="text-xl">🚑</span>
          <div><b>Detección de ictus (FAST):</b> Rostro caído · Brazo débil · dificultad del Habla · es Tiempo de actuar.
            Ante cualquier signo, llama o traslada de inmediato a servicios médicos.</div>
        </div>
      </Card>

      {tab === "panel" ? (
        evals.length === 0 ? (
          <Card><Empty>Aún no tienes evaluaciones. Pulsa “Nueva evaluación” para comenzar.</Empty></Card>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <BloqueCard titulo="Riesgo metabólico" desc="Diabetes · hipertensión · obesidad"
                semaforo={ultima.semaforo_metabolico} puntaje={ultima.puntaje_metabolico}
                delta={mejora(ultima, previa)?.metabolico} />
              <BloqueCard titulo="Riesgo oncológico" desc="Tamizaje de factores de cáncer"
                semaforo={ultima.semaforo_oncologico} puntaje={ultima.puntaje_oncologico}
                delta={mejora(ultima, previa)?.oncologico} />
            </div>

            {(ultima.condiciones?.length ?? 0) > 0 && (
              <Card>
                <h3 className="font-semibold text-navy mb-2">Padecimientos registrados</h3>
                <div className="flex flex-wrap gap-2">
                  {ultima.condiciones.map(c => <Badge key={c} color="red">{CONDICION_LABEL[c] ?? c}</Badge>)}
                </div>
                <p className="text-xs text-slate-400 mt-3">Esta información ayuda a la Gran Comisión a conocer las enfermedades más frecuentes (de forma agregada).</p>
              </Card>
            )}

            {ultima.etiquetas.length > 0 && (
              <Card>
                <h3 className="font-semibold text-navy mb-2">Etiquetas de riesgo detectadas</h3>
                <div className="flex flex-wrap gap-2">
                  {ultima.etiquetas.map(t => <Badge key={t} color="yellow">{t.replace(/_/g, " ")}</Badge>)}
                </div>
                <p className="text-xs text-slate-400 mt-3">Estas etiquetas se usan de forma agregada y anonimizada para acciones preventivas de la Gran Comisión.</p>
              </Card>
            )}

            <Card>
              <h3 className="font-semibold text-navy mb-3">Historial de evaluaciones</h3>
              <table className="w-full text-sm">
                <thead><tr className="text-left text-slate-500 border-b">
                  <th className="py-2">Fecha</th><th>Metabólico</th><th>Oncológico</th></tr></thead>
                <tbody>
                  {evals.slice().reverse().map(e => (
                    <tr key={e.id} className="border-b last:border-0">
                      <td className="py-2">{fecha(e.fecha)}</td>
                      <td><SemaforoBadge s={e.semaforo_metabolico} /> <span className="text-slate-400 text-xs">({e.puntaje_metabolico})</span></td>
                      <td><SemaforoBadge s={e.semaforo_oncologico} /> <span className="text-slate-400 text-xs">({e.puntaje_oncologico})</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )
      ) : (
        <Card>
          <Cuestionario resp={resp} set={set} />
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button variant="ghost" onClick={() => setTab("panel")}>Cancelar</Button>
            <Button onClick={guardar}>Guardar evaluación</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function BloqueCard({ titulo, desc, semaforo, puntaje, delta }:
  { titulo: string; desc: string; semaforo: any; puntaje: number; delta?: number | null }) {
  const t = SEMAFORO_TEXTO[semaforo as keyof typeof SEMAFORO_TEXTO];
  const ring = semaforo === "verde" ? "ring-emerald-200" : semaforo === "amarillo" ? "ring-amber-200" : "ring-rose-200";
  return (
    <Card className={`ring-2 ${ring}`}>
      <div className="flex items-start justify-between">
        <div><h3 className="font-semibold text-navy">{titulo}</h3><p className="text-xs text-slate-500">{desc}</p></div>
        <SemaforoBadge s={semaforo} />
      </div>
      <div className="mt-3 text-sm text-slate-600">{t.label}. {t.mensaje}</div>
      {typeof delta === "number" && delta !== 0 && (
        <div className={`mt-3 text-sm font-medium ${delta > 0 ? "text-emerald-600" : "text-rose-600"}`}>
          {delta > 0 ? `▼ Mejoraste ${delta} puntos respecto a la evaluación anterior` : `▲ Subiste ${Math.abs(delta)} puntos respecto a la anterior`}
        </div>
      )}
    </Card>
  );
}

function Cuestionario({ resp, set }: { resp: Record<string, any>; set: (id: string, v: any) => void }) {
  const bloques: { key: string; titulo: string }[] = [
    { key: "metabolico", titulo: "Bloque metabólico (diabetes, hipertensión, obesidad)" },
    { key: "condiciones", titulo: "Padecimientos / enfermedades diagnosticadas" },
    { key: "habitos", titulo: "Hábitos y estilo de vida" },
    { key: "oncologico", titulo: "Bloque oncológico (tamizaje)" },
  ];
  return (
    <div className="space-y-6">
      {bloques.map(b => (
        <div key={b.key}>
          <h3 className="font-semibold text-navy mb-3">{b.titulo}</h3>
          <div className="space-y-3">
            {PREGUNTAS.filter(p => p.bloque === b.key).map(p => (
              <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 last:border-0">
                <label className="text-sm text-slate-700">{p.texto}</label>
                {p.tipo === "opciones" ? (
                  <select className="input sm:w-56" value={resp[p.id] ?? ""} onChange={e => set(p.id, e.target.value)}>
                    <option value="">Selecciona…</option>
                    {p.opciones!.map(o => <option key={o.label} value={o.valor}>{o.label}</option>)}
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => set(p.id, true)}
                      className={`btn text-xs ${resp[p.id] === true ? "btn-primary" : "btn-ghost"}`}>Sí</button>
                    <button type="button" onClick={() => set(p.id, false)}
                      className={`btn text-xs ${resp[p.id] === false ? "btn-primary" : "btn-ghost"}`}>No</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
