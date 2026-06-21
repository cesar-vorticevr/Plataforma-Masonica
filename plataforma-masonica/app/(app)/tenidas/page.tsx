"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, PageTitle, Stat, Button, Input, Empty } from "@/components/ui";
import {
  listTenidas, addTenida, listUsuariosLogia, listAsistencias, setAsistencia, asistenciasUsuario,
} from "@/lib/data/store";
import { fecha } from "@/lib/format";

export default function Tenidas() {
  const { user } = useAuth();
  const [sel, setSel] = useState<string | null>(null);
  const [nueva, setNueva] = useState({ titulo: "", fecha: "" });
  const [tick, setTick] = useState(0);
  if (!user) return null;

  const tenidas = listTenidas(user.logia_id);
  const hermanos = listUsuariosLogia(user.logia_id).filter(u => u.estado === "validado");
  const tenida = tenidas.find(t => t.id === sel);

  // Promedio de asistencia de la logia
  let sumaPct = 0;
  hermanos.forEach(h => { sumaPct += asistenciasUsuario(h.id, user.logia_id).pct; });
  const pctLogia = hermanos.length ? Math.round(sumaPct / hermanos.length) : 0;

  return (
    <div key={tick}>
      <PageTitle title="Tenidas y asistencia" subtitle="Calendario de tenidas y registro de asistencia." />
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Stat label="Tenidas registradas" value={tenidas.length} />
        <Stat label="Asistencia promedio (logia)" value={`${pctLogia}%`} />
        <Stat label="Hermanos activos" value={hermanos.length} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <h3 className="font-semibold text-navy mb-3">Calendario</h3>
          <div className="space-y-2 mb-4">
            {tenidas.length === 0 ? <Empty>Sin tenidas.</Empty> : tenidas.map(t => (
              <button key={t.id} onClick={() => setSel(t.id)}
                className={`w-full text-left rounded-lg p-3 text-sm ${sel === t.id ? "bg-navy text-white" : "bg-slate-50 hover:bg-slate-100"}`}>
                <div className="font-medium">{t.titulo}</div>
                <div className={`text-xs ${sel === t.id ? "text-white/70" : "text-slate-400"}`}>{fecha(t.fecha)}</div>
              </button>
            ))}
          </div>
          <div className="border-t pt-3 space-y-2">
            <Input label="Nueva tenida" placeholder="Título" value={nueva.titulo} onChange={e => setNueva(s => ({ ...s, titulo: e.target.value }))} />
            <Input type="date" value={nueva.fecha} onChange={e => setNueva(s => ({ ...s, fecha: e.target.value }))} />
            <Button className="w-full" onClick={() => {
              if (nueva.titulo && nueva.fecha) { addTenida(user.logia_id, nueva.titulo, new Date(nueva.fecha).toISOString()); setNueva({ titulo: "", fecha: "" }); setTick(t => t + 1); }
            }}>Agregar tenida</Button>
          </div>
        </Card>

        <Card className="md:col-span-2">
          {!tenida ? <Empty>Selecciona una tenida para pasar lista.</Empty> : (
            <>
              <h3 className="font-semibold text-navy mb-1">{tenida.titulo}</h3>
              <p className="text-xs text-slate-400 mb-4">{fecha(tenida.fecha)} · Marca la asistencia</p>
              <div className="space-y-2">
                {hermanos.map(h => {
                  const a = listAsistencias(tenida.id).find(x => x.usuario_id === h.id);
                  const presente = a?.presente ?? false;
                  return (
                    <label key={h.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                      <span className="text-sm text-slate-700">{h.nombre.split("(")[0].trim()}</span>
                      <input type="checkbox" checked={presente}
                        onChange={e => { setAsistencia(tenida.id, h.id, e.target.checked); setTick(t => t + 1); }}
                        className="w-5 h-5 accent-emerald-500" />
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <h3 className="font-semibold text-navy mb-3">Asistencia por hermano (acumulada)</h3>
        <div className="space-y-2">
          {hermanos.map(h => {
            const a = asistenciasUsuario(h.id, user.logia_id);
            return (
              <div key={h.id} className="flex items-center gap-3">
                <div className="w-40 text-sm text-slate-700 truncate">{h.nombre.split("(")[0].trim()}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-royal h-full" style={{ width: `${a.pct}%` }} />
                </div>
                <div className="w-16 text-right text-sm text-slate-500">{a.pct}%</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
