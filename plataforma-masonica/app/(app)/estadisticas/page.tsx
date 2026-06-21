"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { esGlobal, can } from "@/lib/roles";
import { Card, PageTitle, Stat, Badge, Empty, Select } from "@/components/ui";
import { statsLogia, statsTodas, consolidar, topEtiquetas, StatsLogia } from "@/lib/data/store";
import { CONDICION_LABEL } from "@/lib/types";

const ET_LABEL: Record<string, string> = {
  tabaquismo: "Tabaquismo", alcohol: "Consumo de alcohol", sedentarismo: "Sedentarismo",
  dieta_baja_frutas_verduras: "Mala alimentación", obesidad: "Obesidad", sobrepeso: "Sobrepeso",
  glucosa_elevada: "Glucosa elevada", antecedente_familiar_cancer: "Antec. familiar de cáncer",
  sintoma_de_alarma: "Síntoma de alarma", riesgo_metabolico_alto: "Riesgo metabólico alto",
};
const etLabel = (t: string) => ET_LABEL[t] ?? t.replace(/_/g, " ");

export default function Estadisticas() {
  const { user } = useAuth();
  const [sel, setSel] = useState<string>("todas");
  if (!user) return null;
  const global = esGlobal(user.rol);
  const verCapitas = can.verCapitasStats(user); // Gran Secretario NO ve tesorería/cápitas

  const todas = global ? statsTodas() : [statsLogia(user.logia_id)];
  const visibles = global && sel !== "todas" ? todas.filter(s => s.logiaId === sel) : todas;
  const con = consolidar(visibles);
  const top = topEtiquetas(con.etiquetas);
  const condiciones = topEtiquetas(con.condiciones, 12);
  const totalSemaforo = con.saludMetab.verde + con.saludMetab.amarillo + con.saludMetab.rojo;

  return (
    <div>
      <PageTitle title="Estadísticas"
        subtitle={global ? "Panel general de todas las logias y por logia." : `Indicadores de ${todas[0].nombre}.`}
        action={global ? (
          <Select value={sel} onChange={e => setSel(e.target.value)}>
            <option value="todas">Todas las logias</option>
            {todas.map(s => <option key={s.logiaId} value={s.logiaId}>{s.nombre}</option>)}
          </Select>
        ) : undefined} />

      <div className={`grid sm:grid-cols-2 ${verCapitas ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-4 mb-6`}>
        <Stat label="Hermanos" value={con.total} sub={`${con.validados} validados`} />
        {verCapitas && <Stat label="Cumplimiento de cápitas" value={`${con.capitasPct}%`} sub="promedio" />}
        <Stat label="Asistencia" value={`${con.asistenciaPct}%`} sub="promedio a tenidas" />
        <Stat label="Evaluaciones de salud" value={con.evaluados} sub={`${con.total ? Math.round(con.evaluados/con.total*100) : 0}% participación`} />
      </div>

      {/* Salud agregada */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="font-semibold text-navy mb-1">Estado de salud de la membresía</h3>
          <p className="text-xs text-slate-400 mb-4">Distribución por semáforo (anonimizada). Riesgo metabólico y oncológico.</p>
          {totalSemaforo === 0 ? <Empty>Aún no hay evaluaciones registradas.</Empty> : (
            <div className="space-y-4">
              <SemaforoBar titulo="Riesgo metabólico" d={con.saludMetab} />
              <SemaforoBar titulo="Riesgo oncológico" d={con.saludOnc} />
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold text-navy mb-1">¿Qué es lo que más necesitan?</h3>
          <p className="text-xs text-slate-400 mb-4">Factores de riesgo más frecuentes — orientan las acciones preventivas.</p>
          {top.length === 0 ? <Empty>Sin datos suficientes.</Empty> : (
            <div className="space-y-3">
              {top.map(([t, n]) => {
                const pct = con.evaluados ? Math.round((n / con.evaluados) * 100) : 0;
                return (
                  <div key={t}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700">{etLabel(t)}</span>
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

      {/* Padecimientos de la membresía */}
      <Card className="mb-6">
        <h3 className="font-semibold text-navy mb-1">Padecimientos en la membresía</h3>
        <p className="text-xs text-slate-400 mb-4">Enfermedades registradas por los hermanos (agregado y anonimizado).</p>
        {condiciones.length === 0 ? <Empty>Sin padecimientos registrados.</Empty> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {condiciones.map(([c, n]) => {
              const pct = con.evaluados ? Math.round((n / con.evaluados) * 100) : 0;
              return (
                <div key={c} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span className="text-sm text-slate-700">{CONDICION_LABEL[c] ?? c}</span>
                  <span className="text-sm"><b className="text-navy">{n}</b> <span className="text-slate-400">· {pct}%</span></span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Tabla por logia (solo global y vista "todas") */}
      {global && sel === "todas" && (
        <Card className="p-0 overflow-x-auto">
          <div className="p-4 border-b font-semibold text-navy">Comparativo por logia</div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-500 border-b">
              <th className="p-3">Logia</th><th>Hermanos</th>
              {verCapitas && <th>Cápitas</th>}
              <th>Asistencia</th><th>Salud (atención)</th></tr></thead>
            <tbody>
              {todas.map(s => <LogiaRow key={s.logiaId} s={s} verCapitas={verCapitas} />)}
            </tbody>
          </table>
        </Card>
      )}
      <p className="text-xs text-slate-400 mt-4">
        Los datos de salud se muestran únicamente de forma agregada y anonimizada. El detalle individual solo es visible para cada hermano.
      </p>
    </div>
  );
}

function SemaforoBar({ titulo, d }: { titulo: string; d: { verde: number; amarillo: number; rojo: number } }) {
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

function LogiaRow({ s, verCapitas }: { s: StatsLogia; verCapitas: boolean }) {
  const atencion = s.saludMetab.rojo + s.saludMetab.amarillo + s.saludOnc.rojo + s.saludOnc.amarillo;
  const color = (p: number) => p >= 80 ? "green" : p >= 50 ? "yellow" : "red";
  return (
    <tr className="border-b last:border-0">
      <td className="p-3">
        <div className="font-medium text-slate-800">{s.nombre}</div>
        <div className="text-xs text-slate-400">{s.oriente} · {s.validados}/{s.totalMiembros} validados</div>
      </td>
      <td>{s.totalMiembros}</td>
      {verCapitas && <td><Badge color={color(s.capitasPct)}>{s.capitasPct}%</Badge></td>}
      <td><Badge color={color(s.asistenciaPct)}>{s.asistenciaPct}%</Badge></td>
      <td>{atencion > 0 ? <Badge color="yellow">{atencion} en seguimiento</Badge> : <Badge color="green">Sin alertas</Badge>}</td>
    </tr>
  );
}
