import { createClient } from "@/lib/supabase/server";
import { cargarPerfil } from "@/lib/data/perfil";
import { Card, PageTitle, Stat, Badge } from "@/components/ui";
import { getCapita, listPagos } from "@/lib/data/tesoreria";
import { listTenidas, listAsistencias } from "@/lib/data/tenidas";
import { rangoCapitas, mesAplica, cumplimiento } from "@/lib/capitas";
import { MESES } from "@/lib/types";
import { money, fecha } from "@/lib/format";

// Server Component puro (sin interactividad): calcula cápitas y asistencia del propio hermano.
export const metadata = { title: "Mis cumplimientos · Plataforma Masónica" };

export default async function Cumplimientos() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const perfil = await cargarPerfil(supabase, user.id);
  if (!perfil) return null;
  const anio = new Date().getFullYear();
  const [capita, pagos, tenidas, asistencias] = await Promise.all([
    getCapita(supabase, perfil.logia_id),
    listPagos(supabase, anio),
    listTenidas(supabase, perfil.logia_id),
    listAsistencias(supabase),
  ]);

  const rango = rangoCapitas(perfil.fecha_inicio, perfil.fecha_registro, anio);
  const c = cumplimiento(rango, pagos);
  const debe = c.pendientes * capita;
  const presentes = asistencias.filter(a => a.presente).length;
  const totalTenidas = tenidas.length;
  const asisPct = totalTenidas ? Math.round((presentes / totalTenidas) * 100) : 0;

  return (
    <div>
      <PageTitle title="Mis cumplimientos" subtitle={`Tu situación de cápitas y asistencia · ${anio}`} />
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Stat label="Cápitas pagadas" value={`${c.pagados}/${c.count}`} sub={`${c.pct}% de lo que va del año`} />
        <Stat label="Adeudo estimado" value={money(debe)} sub={`${c.pendientes} mes(es) · cápita ${money(capita)}`} />
        <Stat label="Asistencia" value={`${asisPct}%`} sub={`${presentes}/${totalTenidas} tenidas`} />
      </div>

      <Card className="mb-6">
        <h3 className="font-semibold text-navy mb-3">Cápitas {anio}</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {MESES.map((m, i) => {
            const mes = i + 1;
            if (!mesAplica(rango, mes)) {
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
              const presente = asistencias.find(a => a.tenida_id === t.id)?.presente ?? false;
              return (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="py-2">{t.titulo}</td><td>{fecha(t.fecha)}</td>
                  <td>{presente ? <Badge color="green">Presente</Badge> : <Badge color="red">Ausente</Badge>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {tenidas.length === 0 && <div className="text-center text-slate-400 py-6 text-sm">Aún no hay tenidas registradas.</div>}
      </Card>
    </div>
  );
}
