"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { accesoCompleto, esAdminLogia } from "@/lib/roles";
import { Card, PageTitle, Stat, Badge } from "@/components/ui";
import { ROL_LABEL, GRADO_LABEL } from "@/lib/types";
import {
  getLogia, listEvaluaciones, listUsuariosLogia, listEventos, cumplimientoCapitas, asistenciasUsuario,
} from "@/lib/data/store";
import { fecha } from "@/lib/format";

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;
  const logia = getLogia(user.logia_id);
  const evals = listEvaluaciones(user.id);
  const ultima = evals[evals.length - 1];
  const eventos = listEventos(user.logia_id).slice(0, 3);
  const anio = new Date().getFullYear();
  const cap = cumplimientoCapitas(user, anio);
  const asis = asistenciasUsuario(user.id, user.logia_id);
  const validado = accesoCompleto(user);

  return (
    <div>
      <PageTitle title={`Bienvenido, ${user.nombre.split("(")[0].trim()}`}
        subtitle={`${ROL_LABEL[user.rol]}${user.grado ? " · " + GRADO_LABEL[user.grado] : ""} · ${logia?.nombre ?? ""}`} />

      {!validado && (
        <Card className="mb-6 border-amber-300 bg-amber-50">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <div className="font-semibold text-amber-900">Tu cuenta está pendiente de validación</div>
              <p className="text-sm text-amber-800 mt-1">
                Mientras el secretario de tu logia valida tu inscripción y asigna tu grado, solo puedes
                llenar <Link href="/generales" className="underline">Generales</Link> y <Link href="/salud" className="underline">Salud</Link>.
                Las demás secciones se habilitarán al validarte.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="Salud" value={ultima ? (ultima.semaforo_metabolico === "rojo" || ultima.semaforo_oncologico === "rojo" ? "Atención" : ultima.semaforo_metabolico === "amarillo" ? "Moderado" : "Bien") : "Sin datos"}
          sub={ultima ? `Última: ${fecha(ultima.fecha)}` : "Llena tu evaluación"} />
        <Stat label="Cápitas pagadas" value={`${cap.pagados}/${cap.count}`} sub={`${cap.pct}% de cumplimiento`} />
        <Stat label="Asistencia" value={`${asis.pct}%`} sub={`${asis.presentes}/${asis.total} tenidas`} />
        <Stat label="Hermanos en tu logia" value={listUsuariosLogia(user.logia_id).length} sub={logia?.oriente} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-navy">Próximos eventos</h3>
            <Link href="/eventos" className="text-royal text-sm">Ver todos</Link>
          </div>
          {eventos.length === 0 ? <p className="text-slate-400 text-sm">Sin eventos.</p> :
            <ul className="space-y-3">
              {eventos.map(e => (
                <li key={e.id} className="flex items-start gap-3">
                  <div className="text-center bg-slate-100 rounded-lg px-2 py-1 text-xs">
                    <div className="font-bold text-navy">{new Date(e.fecha_evento).getDate()}</div>
                    <div className="text-slate-500">{new Date(e.fecha_evento).toLocaleDateString("es-MX",{month:"short"})}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">{e.titulo}</div>
                    <Badge color={e.alcance === "global" ? "gold" : "blue"}>{e.alcance === "global" ? "Todas las logias" : "Mi logia"}</Badge>
                  </div>
                </li>
              ))}
            </ul>}
        </Card>

        <Card>
          <h3 className="font-semibold text-navy mb-3">Accesos rápidos</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Link href="/salud" className="btn btn-ghost justify-start">❤️ Evaluar mi salud</Link>
            <Link href="/generales" className="btn btn-ghost justify-start">📋 Mis generales</Link>
            {accesoCompleto(user) && <Link href="/directorio" className="btn btn-ghost justify-start">💼 Directorio</Link>}
            {accesoCompleto(user) && <Link href="/trabajos" className="btn btn-ghost justify-start">📜 Trabajos</Link>}
            {esAdminLogia(user.rol) && <Link href="/admin" className="btn btn-ghost justify-start">⚙️ Administrar</Link>}
            <Link href="/cumplimientos" className="btn btn-ghost justify-start">✅ Cumplimientos</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
