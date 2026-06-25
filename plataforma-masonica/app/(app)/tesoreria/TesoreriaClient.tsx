"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { Card, PageTitle, Stat, Button, Input } from "@/components/ui";
import { setCapita, setPago, setInicioCapita, MiembroTesoreria, PagoRow } from "@/lib/data/tesoreria";
import { rangoCapitas, mesAplica, cumplimiento } from "@/lib/capitas";
import { MESES } from "@/lib/types";
import { money } from "@/lib/format";

// Isla de tesorería: recibe miembros/cápita/pagos del servidor; edición de monto, registro de
// pagos e inicio de cápita con el cliente de navegador; router.refresh() tras cada cambio.
export default function TesoreriaClient({ anio, miembros: miembrosRaw, capita, pagos }:
  { anio: number; miembros: MiembroTesoreria[]; capita: number; pagos: PagoRow[] }) {
  const { user } = useAuth();
  const router = useRouter();
  const [montoEdit, setMontoEdit] = useState(String(capita));
  if (!user) return null;

  const miembros = miembrosRaw.filter(m => m.rol === "hermano" || m.rol === "tesorero" || m.rol === "secretario");
  const pagosDe = (id: string) => pagos.filter(p => p.usuario_id === id);

  let totalPagos = 0, totalEsperado = 0;
  for (const m of miembros) {
    const c = cumplimiento(rangoCapitas(m.fecha_inicio, m.fecha_registro, anio), pagosDe(m.id));
    totalPagos += c.pagados; totalEsperado += c.count;
  }
  const recaudado = totalPagos * capita;
  const cumpl = totalEsperado ? Math.round((totalPagos / totalEsperado) * 100) : 0;

  const inicioVal = (m: MiembroTesoreria) => (m.fecha_inicio ?? m.fecha_registro).slice(0, 7);

  async function guardarMonto() { await setCapita(createClient(), user!.logia_id, Number(montoEdit) || 0); router.refresh(); }
  async function toggle(id: string, mes: number) {
    const actual = pagos.find(p => p.usuario_id === id && p.mes === mes)?.pagado ?? false;
    await setPago(createClient(), id, anio, mes, !actual, capita, user!.id); router.refresh();
  }
  async function cambiarInicio(id: string, value: string) {
    if (value) { await setInicioCapita(createClient(), id, value + "-01"); router.refresh(); }
  }

  return (
    <div>
      <PageTitle title="Tesorería" subtitle={`Control de cápitas ${anio} · solo cuenta hasta el mes actual y desde el inicio de cada hermano`} />
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Stat label="Recaudado (al mes actual)" value={money(recaudado)} sub={`${totalPagos} de ${totalEsperado} cápitas`} />
        <Stat label="Cumplimiento" value={`${cumpl}%`} sub="sobre lo que va del año" />
        <Card>
          <label className="label">Monto de cápita mensual</label>
          <div className="flex gap-2">
            <Input value={montoEdit} onChange={e => setMontoEdit(e.target.value)} type="number" />
            <Button onClick={guardarMonto}>Guardar</Button>
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
            {miembros.map(h => {
              const r = rangoCapitas(h.fecha_inicio, h.fecha_registro, anio);
              const c = cumplimiento(r, pagosDe(h.id));
              return (
                <tr key={h.id} className="border-b last:border-0">
                  <td className="p-3 font-medium text-slate-700 sticky left-0 bg-white whitespace-nowrap">{h.nombre.split("(")[0].trim()}</td>
                  <td className="p-1 text-center">
                    <input type="month" value={inicioVal(h)}
                      onChange={e => cambiarInicio(h.id, e.target.value)}
                      className="border border-slate-200 rounded px-1 py-0.5 text-xs w-28" />
                  </td>
                  {MESES.map((m, i) => {
                    const mes = i + 1;
                    if (!mesAplica(r, mes)) {
                      return <td key={m} className="p-1 text-center"><div className="w-7 h-7 mx-auto rounded-md bg-slate-50 text-slate-300 grid place-items-center text-[10px]">–</div></td>;
                    }
                    const ok = pagos.find(x => x.usuario_id === h.id && x.mes === mes)?.pagado;
                    return (
                      <td key={m} className="p-1 text-center">
                        <button onClick={() => toggle(h.id, mes)}
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
        {miembros.length === 0 && <div className="p-6 text-center text-slate-400 text-sm">No hay hermanos en esta logia.</div>}
      </Card>
      <p className="text-xs text-slate-400 mt-3">
        Los meses con “–” no aplican (anteriores al inicio del hermano o posteriores al mes actual). Ajusta la fecha de “Inicio” para definir desde cuándo debe pagar.
      </p>
    </div>
  );
}
