"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, PageTitle, Button, Input, Textarea, Badge, Empty, Modal } from "@/components/ui";
import { listCorrespondencia, addCorrespondencia, listLogias, getLogia } from "@/lib/data/store";
import { fechaHora } from "@/lib/format";

export default function Correspondencia() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);
  if (!user) return null;
  const items = listCorrespondencia(user.logia_id);

  return (
    <div key={tick}>
      <PageTitle title="Correspondencia masónica" subtitle="Comunicación oficial fechada entre secretarías, con adjuntos."
        action={<Button onClick={() => setOpen(true)}>Nueva correspondencia</Button>} />
      {items.length === 0 ? <Card><Empty>Sin correspondencia.</Empty></Card> : (
        <div className="space-y-3">
          {items.map(c => {
            const enviado = c.de_logia_id === user.logia_id;
            return (
              <Card key={c.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge color={enviado ? "blue" : "green"}>{enviado ? "Enviada" : "Recibida"}</Badge>
                      <h3 className="font-semibold text-navy">{c.asunto}</h3>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{c.cuerpo}</p>
                    <div className="text-xs text-slate-400 mt-2">
                      De {getLogia(c.de_logia_id)?.nombre} → {c.destinatarios_logia_ids.map(id => getLogia(id)?.nombre).join(", ")} · {fechaHora(c.fecha)}
                    </div>
                    {c.adjuntos.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {c.adjuntos.map((a, i) => <Badge key={i} color="slate">📎 {a.nombre}</Badge>)}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {open && <Redactar deLogia={user.logia_id} userId={user.id} onClose={() => { setOpen(false); setTick(t => t + 1); }} />}
    </div>
  );
}

function Redactar({ deLogia, userId, onClose }: { deLogia: string; userId: string; onClose: () => void }) {
  const logias = listLogias().filter(l => l.id !== deLogia);
  const [f, setF] = useState({ asunto: "", cuerpo: "", destinos: [] as string[], adjunto: "" });
  const toggle = (id: string) => setF(s => ({ ...s, destinos: s.destinos.includes(id) ? s.destinos.filter(x => x !== id) : [...s.destinos, id] }));
  function enviar() {
    if (!f.asunto || f.destinos.length === 0) return;
    const adjuntos = f.adjunto ? [{ nombre: f.adjunto, tipo: f.adjunto.split(".").pop() ?? "file" }] : [];
    addCorrespondencia({ de_logia_id: deLogia, destinatarios_logia_ids: f.destinos, asunto: f.asunto, cuerpo: f.cuerpo, adjuntos, autor_id: userId });
    onClose();
  }
  return (
    <Modal open onClose={onClose} title="Nueva correspondencia">
      <div className="space-y-3">
        <div>
          <label className="label">Logias destinatarias</label>
          <div className="flex flex-wrap gap-2">
            {logias.map(l => (
              <button key={l.id} type="button" onClick={() => toggle(l.id)}
                className={`btn text-xs ${f.destinos.includes(l.id) ? "btn-primary" : "btn-ghost"}`}>{l.nombre}</button>
            ))}
          </div>
        </div>
        <Input label="Asunto" value={f.asunto} onChange={e => setF(s => ({ ...s, asunto: e.target.value }))} />
        <Textarea label="Mensaje" value={f.cuerpo} onChange={e => setF(s => ({ ...s, cuerpo: e.target.value }))} />
        <div>
          <label className="label">Adjunto (PDF, Word, PNG, JPG)</label>
          <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" className="input"
            onChange={e => setF(s => ({ ...s, adjunto: e.target.files?.[0]?.name ?? "" }))} />
        </div>
        <div className="flex justify-end gap-2 pt-2"><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={enviar}>Enviar</Button></div>
      </div>
    </Modal>
  );
}
