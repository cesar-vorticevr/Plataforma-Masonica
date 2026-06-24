"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, PageTitle, Stat, Button, Input, Empty } from "@/components/ui";
import {
  listTenidas, addTenida, listMiembros, listAsistencias, setAsistencia,
  MiembroTenida, AsistenciaRow,
} from "@/lib/data/tenidas";
import { Tenida, Usuario } from "@/lib/types";
import { fecha } from "@/lib/format";

export default function Tenidas() {
  const { user } = useAuth();
  if (!user) return null;
  return <TenidasInner user={user} />;
}

function TenidasInner({ user }: { user: Usuario }) {
  const [tenidas, setTenidas] = useState<Tenida[]>([]);
  const [miembros, setMiembros] = useState<MiembroTenida[]>([]);
  const [asistencias, setAsistencias] = useState<AsistenciaRow[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [nueva, setNueva] = useState({ titulo: "", fecha: "" });
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let activo = true;
    (async () => {
      const [ts, ms, as] = await Promise.all([
        listTenidas(user.logia_id), listMiembros(user.logia_id), listAsistencias(),
      ]);
      if (!activo) return;
      setTenidas(ts); setMiembros(ms); setAsistencias(as); setLoading(false);
    })();
    return () => { activo = false; };
  }, [user.logia_id, reload]);

  const refresh = () => setReload(x => x + 1);
  const total = tenidas.length;
  const pctDe = (id: string) => {
    if (!total) return 0;
    const presentes = asistencias.filter(a => a.usuario_id === id && a.presente).length;
    return Math.round((presentes / total) * 100);
  };
  const pctLogia = miembros.length ? Math.round(miembros.reduce((s, h) => s + pctDe(h.id), 0) / miembros.length) : 0;
  const tenida = tenidas.find(t => t.id === sel);

  async function crear() {
    if (nueva.titulo && nueva.fecha) {
      await addTenida(user.logia_id, nueva.titulo, new Date(nueva.fecha).toISOString());
      setNueva({ titulo: "", fecha: "" }); refresh();
    }
  }
  async function marcar(usuarioId: string, presente: boolean) {
    if (!tenida) return;
    await setAsistencia(tenida.id, usuarioId, presente); refresh();
  }

  if (loading) return <div className="min-h-[40vh] grid place-items-center text-slate-400">Cargando…</div>;

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
            <Button className="w-full" onClick={crear}>Agregar tenida</Button>
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
    </div>
  );
}
