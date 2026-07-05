"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, PageTitle, Button, SemaforoBadge, Badge, Empty } from "@/components/ui";
import { PREGUNTAS, evaluar, SEMAFORO_TEXTO, mejora } from "@/lib/health";
import { addEvaluacion, registrarConsentimiento, revocarConsentimiento, borrarMiSalud, AVISO_PRIVACIDAD_VERSION } from "@/lib/data/salud";
import { EvaluacionSalud, CONDICION_LABEL, Semaforo, RespuestasSalud, RespuestaSalud } from "@/lib/types";
import { fecha } from "@/lib/format";

// Isla de salud: recibe del servidor las evaluaciones del propio usuario y su consentimiento
// (lectura directa de props). El cuestionario y el consentimiento mutan con el cliente de
// navegador; tras guardar, router.refresh() re-ejecuta el Server Component.
export default function SaludClient({ userId, evals, consentido }:
  { userId: string; evals: EvaluacionSalud[]; consentido: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<"panel" | "cuestionario">("panel");
  const [resp, setResp] = useState<RespuestasSalud>({});
  const [aceptaAviso, setAceptaAviso] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const ultima = evals[evals.length - 1];
  const previa = evals[evals.length - 2];

  function set(id: string, v: RespuestaSalud) { setResp(s => ({ ...s, [id]: v })); }

  async function aceptarYContinuar() {
    await registrarConsentimiento(createClient(), userId, AVISO_PRIVACIDAD_VERSION);
    router.refresh();
  }

  async function guardar() {
    setGuardando(true);
    try {
      const r = evaluar(resp);
      await addEvaluacion(createClient(), { usuario_id: userId, respuestas: resp, ...r });
      setResp({}); setTab("panel"); router.refresh();
    } finally { setGuardando(false); }
  }

  return (
    <div>
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
                semaforo={ultima.semaforo_metabolico}
                delta={mejora(ultima, previa)?.metabolico} />
              <BloqueCard titulo="Riesgo oncológico" desc="Tamizaje de factores de cáncer"
                semaforo={ultima.semaforo_oncologico}
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
      ) : !consentido ? (
        <Card>
          <h3 className="font-semibold text-navy mb-2">Aviso de Privacidad</h3>
          <p className="text-sm text-slate-600">
            Los datos de salud son <b>datos personales sensibles</b>. Antes de continuar, lee y acepta el{" "}
            <Link href="/privacidad" className="text-royal underline">Aviso de Privacidad</Link>. Tu evaluación
            es orientativa y <b>no sustituye una consulta médica</b>. Solo tú puedes ver tu detalle de salud.
          </p>
          <label className="flex items-center gap-2 text-sm mt-4">
            <input type="checkbox" checked={aceptaAviso} onChange={e => setAceptaAviso(e.target.checked)} />
            He leído y acepto el Aviso de Privacidad.
          </label>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
            <Button variant="ghost" onClick={() => setTab("panel")}>Cancelar</Button>
            <Button disabled={!aceptaAviso} onClick={aceptarYContinuar}>Aceptar y continuar</Button>
          </div>
        </Card>
      ) : (
        <Card>
          <Cuestionario resp={resp} set={set} />
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button variant="ghost" onClick={() => setTab("panel")}>Cancelar</Button>
            <Button onClick={guardar} disabled={guardando}>Guardar evaluación</Button>
          </div>
        </Card>
      )}

      {consentido && tab === "panel" && (
        <ArcoSalud evals={evals} onChange={() => router.refresh()} />
      )}
    </div>
  );
}

// Derechos ARCO (LFPDPPP): el hermano puede exportar sus datos de salud, revocar su consentimiento
// (impide nuevas evaluaciones hasta volver a consentir) y borrar sus evaluaciones.
function ArcoSalud({ evals, onChange }: { evals: EvaluacionSalud[]; onChange: () => void }) {
  const [ocupado, setOcupado] = useState(false);

  function exportar() {
    const blob = new Blob([JSON.stringify(evals, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "mis-datos-salud.json"; a.click();
    URL.revokeObjectURL(url);
  }
  async function revocar() {
    if (!confirm("¿Revocar tu consentimiento? No podrás registrar nuevas evaluaciones hasta volver a aceptarlo.")) return;
    setOcupado(true);
    try { await revocarConsentimiento(createClient()); onChange(); } finally { setOcupado(false); }
  }
  async function borrar() {
    if (!confirm("¿Borrar TODAS tus evaluaciones de salud? Esta acción no se puede deshacer.")) return;
    setOcupado(true);
    try { await borrarMiSalud(createClient()); onChange(); } finally { setOcupado(false); }
  }

  return (
    <Card className="mt-6">
      <h3 className="font-semibold text-navy mb-1 text-sm">Tus datos y privacidad (derechos ARCO)</h3>
      <p className="text-xs text-slate-400 mb-3">Solo tú puedes ver, exportar o eliminar tu detalle de salud.</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" className="text-xs" onClick={exportar} disabled={evals.length === 0}>Exportar mis datos</Button>
        <Button variant="ghost" className="text-xs" onClick={revocar} disabled={ocupado}>Revocar consentimiento</Button>
        <Button variant="ghost" className="text-xs text-rose-600" onClick={borrar} disabled={ocupado || evals.length === 0}>Borrar mis evaluaciones</Button>
      </div>
    </Card>
  );
}

function BloqueCard({ titulo, desc, semaforo, delta }:
  { titulo: string; desc: string; semaforo: Semaforo; delta?: number | null }) {
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

function Cuestionario({ resp, set }: { resp: RespuestasSalud; set: (id: string, v: RespuestaSalud) => void }) {
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
                  <select className="input sm:w-56" value={(resp[p.id] ?? "") as string | number} onChange={e => set(p.id, e.target.value)}>
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
