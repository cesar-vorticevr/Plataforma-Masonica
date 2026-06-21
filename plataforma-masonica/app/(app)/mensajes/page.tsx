"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, PageTitle, Button, Empty } from "@/components/ui";
import { listMensajes, conversacion, getUsuario, enviarMensaje, marcarMensajesLeidos } from "@/lib/data/store";
import { initials, fechaHora } from "@/lib/format";

export default function Mensajes() {
  const { user } = useAuth();
  const [activo, setActivo] = useState<string | null>(null);
  const [txt, setTxt] = useState("");
  const [tick, setTick] = useState(0);
  if (!user) return null;

  const msgs = listMensajes(user.id);
  const contactos = Array.from(new Set(msgs.map(m => m.de_usuario_id === user.id ? m.a_usuario_id : m.de_usuario_id)));
  const conv = activo ? conversacion(user.id, activo) : [];

  function abrir(cid: string) {
    setActivo(cid);
    if (user) { marcarMensajesLeidos(user.id, cid); window.dispatchEvent(new Event("notif")); }
    setTick(t => t + 1);
  }
  function enviar() {
    if (!user || !activo || !txt.trim()) return;
    enviarMensaje(user.id, activo, txt.trim()); setTxt(""); setTick(t => t + 1);
  }

  return (
    <div key={tick}>
      <PageTitle title="Mensajes profesionales" subtitle="Buzón interno para contacto profesional entre hermanos." />
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-1 p-0 overflow-hidden">
          <div className="p-4 border-b font-semibold text-navy text-sm">Conversaciones</div>
          {contactos.length === 0 ? <Empty>Sin mensajes aún.</Empty> :
            contactos.map(cid => {
              const u = getUsuario(cid);
              return (
                <button key={cid} onClick={() => abrir(cid)}
                  className={`w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 ${activo === cid ? "bg-slate-100" : ""}`}>
                  <div className="w-9 h-9 rounded-full bg-navy text-white grid place-items-center text-xs font-semibold">{initials(u?.nombre ?? "?")}</div>
                  <div className="text-sm font-medium text-slate-700 truncate">{u?.nombre.split("(")[0].trim()}</div>
                </button>
              );
            })}
        </Card>

        <Card className="md:col-span-2 flex flex-col p-0 min-h-[420px]">
          {!activo ? <div className="flex-1 grid place-items-center text-slate-400 text-sm">Selecciona una conversación</div> : (
            <>
              <div className="p-4 border-b font-semibold text-navy text-sm">{getUsuario(activo)?.nombre.split("(")[0].trim()}</div>
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
                  onKeyDown={e => e.key === "Enter" && enviar()} placeholder="Escribe un mensaje…" />
                <Button onClick={enviar}>Enviar</Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
