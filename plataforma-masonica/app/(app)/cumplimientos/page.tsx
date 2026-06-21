"use client";
import { useAuth } from "@/lib/auth";
import { Card, PageTitle, Stat, Badge } from "@/components/ui";
import { getCapita, asistenciasUsuario, listTenidas, listAsistencias, listPagos, cumplimientoCapitas, mesAplica } from "@/lib/data/store";
import { MESES } from "@/lib/types";
import { money, fecha } from "@/lib/format";

export default function Cumplimientos() {
  const { user } = useAuth();
  if (!user) return null;
  const anio = new Date().getFullYear();
  const capita = getCapita(user.logia_id)?.monto ?? 0;
  const c = cumplimientoCapitas(user, anio);
  const pagos = listPagos(user.id, anio);
  const debe = c.pendientes * capita;
  const asis = asistenciasUsuario(user.id, user.logia_id);
  const tenidas = listTenidas(user.logia_id);

  return (
    <div>
      <PageTitle title="Mis cumplimientos" subtitle={`Tu situación de cápitas y asistencia · ${anio}`} />
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Stat label="Cápitas pagadas" value={`${c.pagados}/${c.count}`} sub={`${c.pct}% de lo que va del año`} />
        <Stat label="Adeudo estimado" value={money(debe)} sub={`${c.pendientes} mes(es) · cápita ${money(capita)}`} />
        <Stat label="Asistencia" value={`${asis.pct}%`} sub={`${asis.presentes}/${asis.total} tenidas`} />
      </div>

      <Card className="mb-6">
        <h3 className="font-semibold text-navy mb-3">Cápitas {anio}</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {MESES.map((m, i) => {
            const mes = i + 1;
            if (!mesAplica(user, anio, mes)) {
              return <div key={m} className="rounded-lg p-2 text-center text-sm bg-slate-50 text-slate-300">
                <div className="font-medium">{m}</div><div className="text-xs">—</div></div>;
            }
            const ok = pagos.find(x => x.mes === mes)?.pagado;
            return (
              <div key={m} className={`rounded-lg p-2 text-center text-sm ${ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
                <div className="font-medium">{m}</div>
                <div className="text-xs">{ok ? "✓ Pagado" : "Pendiente"}</div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-400 mt-3">Solo se consideran los meses desde tu ingreso hasta el mes actual.</p>
      </Card>

      <Card>
        <h3 className="font-semibold text-navy mb-3">Asistencia a tenidas</h3>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500 border-b"><th className="py-2">Tenida</th><th>Fecha</th><th>Asistencia</th></tr></thead>
          <tbody>
            {tenidas.map(t => {
              const a = listAsistencias(t.id).find(x => x.usuario_id === user.id);
              return (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="py-2">{t.titulo}</td><td>{fecha(t.fecha)}</td>
                  <td>{a?.presente ? <Badge color="green">Presente</Badge> : <Badge color="red">Ausente</Badge>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
