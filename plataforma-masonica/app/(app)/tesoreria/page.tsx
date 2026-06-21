"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, PageTitle, Stat, Button, Input } from "@/components/ui";
import {
  listUsuariosLogia, getCapita, setCapita, listPagos, togglePago,
  cumplimientoCapitas, mesAplica, setInicioUsuario,
} from "@/lib/data/store";
import { MESES } from "@/lib/types";
import { money } from "@/lib/format";

export default function Tesoreria() {
  const { user } = useAuth();
  const [anio] = useState(new Date().getFullYear());
  const [tick, setTick] = useState(0);
  if (!user) return null;

  const hermanos = listUsuariosLogia(user.logia_id).filter(u => u.rol === "hermano" || u.rol === "tesorero" || u.rol === "secretario");
  const capita = getCapita(user.logia_id)?.monto ?? 0;
  const [montoEdit, setMontoEdit] = useState(String(capita));

  let totalPagos = 0, totalEsperado = 0;
  hermanos.forEach(h => {
    const c = cumplimientoCapitas(h, anio);
    totalPagos += c.pagados;
    totalEsperado += c.count;
  });
  const recaudado = totalPagos * capita;
  const cumplimiento = totalEsperado ? Math.round((totalPagos / totalEsperado) * 100) : 0;

  const fechaInicioVal = (iso?: string) => iso ? new Date(iso).toISOString().slice(0, 7) : "";

  return (
    <div key={tick}>
      <PageTitle title="Tesorería" subtitle={`Control de cápitas ${anio} · solo cuenta hasta el mes actual y desde el inicio de cada hermano`} />
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Stat label="Recaudado (al mes actual)" value={money(recaudado)} sub={`${totalPagos} de ${totalEsperado} cápitas`} />
        <Stat label="Cumplimiento" value={`${cumplimiento}%`} sub="sobre lo que va del año" />
        <Card>
          <label className="label">Monto de cápita mensual</label>
          <div className="flex gap-2">
            <Input value={montoEdit} onChange={e => setMontoEdit(e.target.value)} type="number" />
            <Button onClick={() => { setCapita(user.logia_id, Number(montoEdit) || 0); setTick(t => t + 1); }}>Guardar</Button>
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 border-b">
              <th className="text-left p-3 sticky left-0 bg-white">Hermano</th>
              <th className="p-2 text-center">Inicio</th>
              {MESES.map(m => <th key={m} className="p-2 text-center font-medium">{m}</th>)}
              <th className="p-2 text-center">%</th>
            </tr>
          </thead>
          <tbody>
            {hermanos.map(h => {
              const pagos = listPagos(h.id, anio);
              const c = cumplimientoCapitas(h, anio);
              return (
                <tr key={h.id} className="border-b last:border-0">
                  <td className="p-3 font-medium text-slate-700 sticky left-0 bg-white whitespace-nowrap">{h.nombre.split("(")[0].trim()}</td>
                  <td className="p-1 text-center">
                    <input type="month" value={fechaInicioVal(h.fecha_inicio ?? h.fecha_registro)}
                      onChange={e => { if (e.target.value) { setInicioUsuario(h.id, new Date(e.target.value + "-01").toISOString()); setTick(t => t + 1); } }}
                      className="border border-slate-200 rounded px-1 py-0.5 text-xs w-28" />
                  </td>
                  {MESES.map((m, i) => {
                    const mes = i + 1;
                    if (!mesAplica(h, anio, mes)) {
                      return <td key={m} className="p-1 text-center"><div className="w-7 h-7 mx-auto rounded-md bg-slate-50 text-slate-300 grid place-items-center text-[10px]">–</div></td>;
                    }
                    const p = pagos.find(x => x.mes === mes);
                    const ok = p?.pagado;
                    return (
                      <td key={m} className="p-1 text-center">
                        <button onClick={() => { togglePago(h.id, anio, mes, user.id, capita); setTick(t => t + 1); }}
                          className={`w-7 h-7 rounded-md text-xs ${ok ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-300 hover:bg-slate-200"}`}>
                          {ok ? "✓" : ""}
                        </button>
                      </td>
                    );
                  })}
                  <td className="p-2 text-center font-semibold text-navy">{c.pct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <p className="text-xs text-slate-400 mt-3">
        Los meses con “–” no aplican (anteriores al inicio del hermano o posteriores al mes actual). Ajusta la fecha de “Inicio” para definir desde cuándo debe pagar.
      </p>
    </div>
  );
}
