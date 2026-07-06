"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { Card, PageTitle, Stat, Button, Input, Empty } from "@/components/ui";
import { addTenida, setAsistencia, listTenidas, listMiembros, listAsistencias, MiembroTenida, AsistenciaRow } from "@/lib/data/tenidas";
import { Tenida, MESES } from "@/lib/types";
import { fecha } from "@/lib/format";

// Isla de tenidas: recibe el estado inicial del servidor. La logia sobre la que opera un admin
// global la fija el selector del header (logia activa); aquí se refresca tras cada mutación.
export default function TenidasClient({ global, logiaId, tenidas: tenidas0, miembros: miembros0, asistencias: asistencias0 }:
  { global: boolean; logiaId: string;
    tenidas: Tenida[]; miembros: MiembroTenida[]; asistencias: AsistenciaRow[] }) {
  const { user } = useAuth();
  const [tenidas, setTenidas] = useState<Tenida[]>(tenidas0);
  const [miembros, setMiembros] = useState<MiembroTenida[]>(miembros0);
  const [asistencias, setAsistencias] = useState<AsistenciaRow[]>(asistencias0);
  const [sel, setSel] = useState<string | null>(null);
  const [nueva, setNueva] = useState({ titulo: "", fecha: "" });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!user) return null;

  // Recarga los datos de la logia activa con el cliente de navegador (RLS) tras una alta/asistencia.
  async function refrescar() {
    const sb = createClient();
    const [ts, ms, as] = await Promise.all([listTenidas(sb, logiaId), listMiembros(sb, logiaId), listAsistencias(sb)]);
    setTenidas(ts); setMiembros(ms); setAsistencias(as); setSel(null);
  }

  // Admin global sin ninguna logia creada: estado vacío claro, no un formulario que no puede operar.
  if (global && !logiaId) {
    return (
      <div>
        <PageTitle title="Tenidas y asistencia" subtitle="Calendario de tenidas y registro de asistencia." />
        <Card><div className="p-6 text-center text-slate-400 text-sm">Aún no hay logias creadas.</div></Card>
      </div>
    );
  }

  const total = tenidas.length;
  const pctDe = (id: string) => {
    if (!total) return 0;
    const presentes = asistencias.filter(a => a.usuario_id === id && a.presente).length;
    return Math.round((presentes / total) * 100);
  };
  const pctLogia = miembros.length ? Math.round(miembros.reduce((s, h) => s + pctDe(h.id), 0) / miembros.length) : 0;
  const tenida = tenidas.find(t => t.id === sel);

  // Tendencia de asistencia por mes del año en curso (presentes / registros de ese mes).
  const anioActual = new Date().getFullYear();
  const tenidasAnio = tenidas.filter(t => new Date(t.fecha).getFullYear() === anioActual);
  const porMes = MESES.map((m, i) => {
    const ids = new Set(tenidasAnio.filter(t => new Date(t.fecha).getMonth() === i).map(t => t.id));
    const regs = asistencias.filter(a => ids.has(a.tenida_id));
    const presentes = regs.filter(a => a.presente).length;
    return { mes: m, tenidas: ids.size, pct: regs.length ? Math.round((presentes / regs.length) * 100) : 0 };
  });

  async function crear() {
    setError(null);
    if (!logiaId) { setError("Selecciona una logia en el encabezado antes de crear una tenida."); return; }
    if (!nueva.titulo || !nueva.fecha) { setError("Indica título y fecha."); return; }
    setEnviando(true);
    const { error } = await addTenida(createClient(), logiaId, nueva.titulo, new Date(nueva.fecha).toISOString());
    setEnviando(false);
    if (error) { setError("No se pudo crear la tenida. Inténtalo de nuevo."); return; }
    setNueva({ titulo: "", fecha: "" });
    await refrescar();
  }
  async function marcar(usuarioId: string, presente: boolean) {
    if (!tenida) return;
    setError(null);
    const { error } = await setAsistencia(createClient(), tenida.id, usuarioId, presente);
    if (error) { setError("No se pudo registrar la asistencia. Inténtalo de nuevo."); return; }
    await refrescar();
  }

  return (
    <div>
      <PageTitle title="Tenidas y asistencia" subtitle="Calendario de tenidas y registro de asistencia." />
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Stat label="Tenidas registradas" value={total} />
        <Stat label="Asistencia promedio (logia)" value={`${pctLogia}%`} />
        <Stat label="Hermanos activos" value={miembros.length} />
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
            <Button className="w-full" onClick={crear} disabled={enviando}>{enviando ? "Agregando…" : "Agregar tenida"}</Button>
            {error && <p className="text-rose-600 text-sm" role="alert">{error}</p>}
          </div>
        </Card>

        <Card className="md:col-span-2">
          {!tenida ? <Empty>Selecciona una tenida para pasar lista.</Empty> : (
            <>
              <h3 className="font-semibold text-navy mb-1">{tenida.titulo}</h3>
              <p className="text-xs text-slate-400 mb-4">{fecha(tenida.fecha)} · Marca la asistencia</p>
              <div className="space-y-2">
                {miembros.map(h => {
                  const presente = asistencias.find(a => a.tenida_id === tenida.id && a.usuario_id === h.id)?.presente ?? false;
                  return (
                    <label key={h.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                      <span className="text-sm text-slate-700">{h.nombre.split("(")[0].trim()}</span>
                      <input type="checkbox" checked={presente}
                        onChange={e => marcar(h.id, e.target.checked)}
                        className="w-5 h-5 accent-emerald-500" />
                    </label>
                  );
                })}
                {miembros.length === 0 && <Empty>No hay hermanos validados en la logia.</Empty>}
              </div>
            </>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <h3 className="font-semibold text-navy mb-3">Asistencia por hermano (acumulada)</h3>
        <div className="space-y-2">
          {miembros.map(h => {
            const pct = pctDe(h.id);
            return (
              <div key={h.id} className="flex items-center gap-3">
                <div className="w-40 text-sm text-slate-700 truncate">{h.nombre.split("(")[0].trim()}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-royal h-full" style={{ width: `${pct}%` }} />
                </div>
                <div className="w-16 text-right text-sm text-slate-500">{pct}%</div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="mt-6">
        <h3 className="font-semibold text-navy mb-3">Tendencia de asistencia por mes · {anioActual}</h3>
        <div className="flex items-end gap-1 h-32">
          {porMes.map(x => (
            <div key={x.mes} className="flex-1 flex flex-col items-center justify-end gap-1" title={`${x.tenidas} tenida(s) · ${x.pct}%`}>
              <div className="w-full rounded-t bg-royal/80" style={{ height: `${x.pct}%`, minHeight: x.tenidas ? 2 : 0 }} />
              <span className="text-[10px] text-slate-400">{x.mes}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">Porcentaje de asistencia por mes (sobre los registros de las tenidas del mes). Los meses sin tenidas aparecen vacíos.</p>
      </Card>
    </div>
  );
}
