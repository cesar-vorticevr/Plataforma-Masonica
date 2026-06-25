"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, PageTitle, Button, Empty } from "@/components/ui";
import { listMensajes, enviar, marcarLeidos } from "@/lib/data/mensajes";
import { MensajeProfesional, Usuario } from "@/lib/types";
import { initials, fechaHora } from "@/lib/format";

export default function MensajesPage() {
  const { user } = useAuth();
  if (!user) return null;
  return <MensajesInner user={user} />;
}

interface Contacto { id: string; nombre: string }

function MensajesInner({ user }: { user: Usuario }) {
  const [msgs, setMsgs] = useState<MensajeProfesional[]>([]);
  const [loading, setLoading] = useState(true);
  const [activo, setActivo] = useState<string | null>(null);
  const [txt, setTxt] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let on = true;
    listMensajes(user.id).then(m => { if (on) { setMsgs(m); setLoading(false); } });
    return () => { on = false; };
  }, [user.id, reload]);

  // El "otro" de cada mensaje y su nombre denormalizado.
  const otroDe = (m: MensajeProfesional): Contacto =>
    m.de_usuario_id === user.id
      ? { id: m.a_usuario_id, nombre: m.a_nombre ?? "Hermano" }
      : { id: m.de_usuario_id, nombre: m.de_nombre ?? "Hermano" };

  const contactos: Contacto[] = [];
  for (const m of msgs) {
    const o = otroDe(m);
    if (!contactos.some(c => c.id === o.id)) contactos.push(o);
  }
  const activoNombre = contactos.find(c => c.id === activo)?.nombre ?? "";
  const conv = activo ? msgs.filter(m => m.de_usuario_id === activo || m.a_usuario_id === activo) : [];

  async function abrir(cid: string) {
    setActivo(cid);
    await marcarLeidos(cid);
    window.dispatchEvent(new Event("notif"));
    setReload(t => t + 1);
  }
  async function enviarMsg() {
    if (!activo || !txt.trim()) return;
    const cuerpo = txt.trim();
    setTxt("");
    await enviar(user.id, user.nombre, activo, activoNombre, cuerpo);
    setReload(t => t + 1);
  }

  return (
    <div>
      <PageTitle title="Mensajes profesionales" subtitle="Buzón interno para contacto profesional entre hermanos." />
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-1 p-0 overflow-hidden">
          <div className="p-4 border-b font-semibold text-navy text-sm">Conversaciones</div>
          {loading ? <Empty>Cargando…</Empty>
            : contactos.length === 0 ? <Empty>Sin mensajes aún.</Empty> :
            contactos.map(c => (
              <button key={c.id} onClick={() => abrir(c.id)}
                className={`w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 ${activo === c.id ? "bg-slate-100" : ""}`}>
                <div className="w-9 h-9 rounded-full bg-navy text-white grid place-items-center text-xs font-semibold">{initials(c.nombre)}</div>
                <div className="text-sm font-medium text-slate-700 truncate">{c.nombre.split("(")[0].trim()}</div>
              </button>
            ))}
        </Card>

        <Card className="md:col-span-2 flex flex-col p-0 min-h-[420px]">
          {!activo ? <div className="flex-1 grid place-items-center text-slate-400 text-sm">Selecciona una conversación</div> : (
            <>
              <div className="p-4 border-b font-semibold text-navy text-sm">{activoNombre.split("(")[0].trim()}</div>
              <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {conv.map(m => (
                  <div key={m.id} className={`flex ${m.de_usuario_id === user.id ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${m.de_usuario_id === user.id ? "bg-navy text-white" : "bg-slate-100 text-slate-700"}`}>
                      {m.cuerpo}
                      <div className={`text-[10px] mt-1 ${m.de_usuario_id === user.id ? "text-white/60" : "text-slate-400"}`}>{fechaHora(m.fecha)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t flex gap-2">
                <input className="input flex-1" value={txt} onChange={e => setTxt(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && enviarMsg()} placeholder="Escribe un mensaje…" />
                <Button onClick={enviarMsg}>Enviar</Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
