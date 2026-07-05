"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, PageTitle, Stat, Empty, Select } from "@/components/ui";
import { CONDICION_LABEL } from "@/lib/types";
import { estadisticasSalud, EstadisticasSalud, Distribucion } from "@/lib/data/salud-estadisticas";
import { CapitaLogiaAgg } from "@/lib/data/tesoreria";
import { AsistenciaLogiaAgg } from "@/lib/data/tenidas";

const mxn = (n: number) => n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });

const ET_LABEL: Record<string, string> = {
  tabaquismo: "Tabaquismo", alcohol: "Consumo de alcohol", sedentarismo: "Sedentarismo",
  dieta_baja_frutas_verduras: "Mala alimentación", obesidad: "Obesidad", sobrepeso: "Sobrepeso",
  glucosa_elevada: "Glucosa elevada", antecedente_familiar_cancer: "Antec. familiar de cáncer",
  sintoma_de_alarma: "Síntoma de alarma", riesgo_metabolico_alto: "Riesgo metabólico alto",
};
const etLabel = (t: string) => ET_LABEL[t] ?? t.replace(/_/g, " ");

export interface LogiaOpcion { id: string; nombre: string; numero: number }

// Isla de estadísticas: recibe el agregado inicial del servidor; el admin global puede cambiar de
// logia y la isla recalcula con el cliente de navegador (RPC agregado, nunca individual).
export default function EstadisticasClient({ global, logias, initial, capitas = [], asistencia = [] }:
  { global: boolean; logias: LogiaOpcion[]; initial: EstadisticasSalud | null; capitas?: CapitaLogiaAgg[]; asistencia?: AsistenciaLogiaAgg[] }) {
  const [sel, setSel] = useState<string>("todas");
  const [data, setData] = useState<EstadisticasSalud | null | undefined>(initial);

  async function cambiar(value: string) {
    setSel(value);
    setData(undefined);
    const logiaParam = value === "todas" ? null : value;
    setData(await estadisticasSalud(createClient(), logiaParam));
  }

  return (
    <div>
      <PageTitle title="Estadísticas de salud"
        subtitle="Prevalencia agregada y anonimizada para orientar acciones preventivas."
        action={global ? (
          <Select value={sel} onChange={e => cambiar(e.target.value)}>
            <option value="todas">Todas las logias</option>
            {logias.map(l => <option key={l.id} value={l.id}>{l.nombre} N.°{l.numero}</option>)}
          </Select>
        ) : undefined} />

      {data === undefined ? (
        <Card><Empty>Cargando…</Empty></Card>
      ) : data === null ? (
        <Card><Empty>No fue posible cargar las estadísticas.</Empty></Card>
      ) : data.suprimido ? (
        <Card>
          <Stat label="Evaluaciones de salud" value={data.cohorte} sub="hermanos evaluados en el alcance" />
          <p className="text-sm text-slate-500 mt-4">
            Cohorte insuficiente para mostrar el desglose. Para proteger la privacidad, las prevalencias
            solo se muestran cuando hay suficientes evaluaciones (mínimo 5) en el alcance seleccionado.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <Stat label="Hermanos evaluados" value={data.cohorte} sub="base del agregado (última evaluación por hermano)" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <h3 className="font-semibold text-navy mb-1">Estado de salud de la membresía</h3>
              <p className="text-xs text-slate-400 mb-4">Distribución por semáforo (anonimizada).</p>
              <div className="space-y-4">
                <SemaforoBar titulo="Riesgo metabólico" d={data.semaforo_metabolico!} />
                <SemaforoBar titulo="Riesgo oncológico" d={data.semaforo_oncologico!} />
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-navy mb-1">¿Qué es lo que más necesitan?</h3>
              <p className="text-xs text-slate-400 mb-4">Factores de riesgo más frecuentes — orientan las acciones preventivas.</p>
              {(data.etiquetas?.length ?? 0) === 0 ? <Empty>Sin datos suficientes.</Empty> : (
                <div className="space-y-3">
                  {data.etiquetas!.map(({ k, n }) => {
                    const pct = data.cohorte ? Math.round((n / data.cohorte) * 100) : 0;
                    return (
                      <div key={k}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-700">{etLabel(k)}</span>
                          <span className="text-slate-400">{n} hno(s) · {pct}%</span>
                        </div>
                        <div className="bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div className="bg-amber-500 h-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          <Card className="mb-6">
            <h3 className="font-semibold text-navy mb-1">Padecimientos en la membresía</h3>
            <p className="text-xs text-slate-400 mb-4">Enfermedades registradas por los hermanos (agregado y anonimizado).</p>
            {(data.condiciones?.length ?? 0) === 0 ? <Empty>Sin padecimientos registrados.</Empty> : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.condiciones!.map(({ k, n }) => {
                  const pct = data.cohorte ? Math.round((n / data.cohorte) * 100) : 0;
                  return (
                    <div key={k} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                      <span className="text-sm text-slate-700">{CONDICION_LABEL[k] ?? k}</span>
                      <span className="text-sm"><b className="text-navy">{n}</b> <span className="text-slate-400">· {pct}%</span></span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </>
      )}

      {global && capitas.length > 0 && (
        <Card className="mt-6 p-0 overflow-hidden">
          <div className="p-4 border-b font-semibold text-navy">Cápitas por logia (agregado)</div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-500 border-b">
              <th className="p-3">Logia</th><th>Recaudado</th><th>Cumplimiento</th><th>Pagos</th></tr></thead>
            <tbody>
              {capitas.map(c => (
                <tr key={c.logia_id} className="border-b last:border-0">
                  <td className="p-3 text-slate-700">{c.nombre} <span className="text-slate-400">N.°{c.numero}</span></td>
                  <td className="text-navy font-medium">{mxn(c.recaudado)}</td>
                  <td className="text-slate-600">{c.cumplimiento_pct}%</td>
                  <td className="text-slate-500 text-xs">{c.pagos_cubiertos}/{c.pagos_registrados}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="p-3 text-xs text-slate-400">Cifras agregadas por logia. No se muestran pagos individuales.</p>
        </Card>
      )}

      {global && asistencia.length > 0 && (
        <Card className="mt-6 p-0 overflow-hidden">
          <div className="p-4 border-b font-semibold text-navy">Asistencia por logia (agregado)</div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-500 border-b">
              <th className="p-3">Logia</th><th>Asistencia</th><th>Tenidas</th><th>Registros</th></tr></thead>
            <tbody>
              {asistencia.map(a => (
                <tr key={a.logia_id} className="border-b last:border-0">
                  <td className="p-3 text-slate-700">{a.nombre} <span className="text-slate-400">N.°{a.numero}</span></td>
                  <td className="text-navy font-medium">{a.asistencia_pct}%</td>
                  <td className="text-slate-600">{a.tenidas}</td>
                  <td className="text-slate-500 text-xs">{a.presentes}/{a.registros}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="p-3 text-xs text-slate-400">Cifras agregadas por logia. No se muestran asistencias individuales.</p>
        </Card>
      )}

      <p className="text-xs text-slate-400 mt-4">
        Los datos de salud se muestran únicamente de forma agregada y anonimizada. El detalle individual
        solo es visible para cada hermano.
      </p>
    </div>
  );
}

function SemaforoBar({ titulo, d }: { titulo: string; d: Distribucion }) {
  const total = d.verde + d.amarillo + d.rojo || 1;
  const seg = (n: number, color: string) => n > 0 ?
    <div className={color} style={{ width: `${(n / total) * 100}%` }} title={`${n}`} /> : null;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-700">{titulo}</span>
        <span className="text-slate-400 text-xs">🟢 {d.verde} · 🟡 {d.amarillo} · 🔴 {d.rojo}</span>
      </div>
      <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
        {seg(d.verde, "bg-emerald-500")}{seg(d.amarillo, "bg-amber-400")}{seg(d.rojo, "bg-rose-500")}
      </div>
    </div>
  );
}
