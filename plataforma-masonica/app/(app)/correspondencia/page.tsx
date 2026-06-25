"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, PageTitle, Button, Input, Textarea, Badge, Empty, Modal } from "@/components/ui";
import { listCorrespondencia, listLogias, enviar, urlDescarga } from "@/lib/data/correspondencia";
import { Correspondencia, Logia, Usuario } from "@/lib/types";
import { fechaHora } from "@/lib/format";

export default function CorrespondenciaPage() {
  const { user } = useAuth();
  if (!user) return null;
  return <CorrespondenciaInner user={user} />;
}

function CorrespondenciaInner({ user }: { user: Usuario }) {
  const [items, setItems] = useState<Correspondencia[]>([]);
  const [logias, setLogias] = useState<Logia[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let activo = true;
    Promise.all([listCorrespondencia(), listLogias()]).then(([c, l]) => {
      if (activo) { setItems(c); setLogias(l); setLoading(false); }
    });
    return () => { activo = false; };
  }, [reload]);

  const nombreLogia = (id: string) => logias.find(l => l.id === id)?.nombre ?? "—";

  async function descargar(ruta: string) {
    const url = await urlDescarga(ruta);
    if (url) window.open(url, "_blank", "noopener");
  }

  return (
    <div>
      <PageTitle title="Correspondencia masónica" subtitle="Comunicación oficial fechada entre secretarías, con adjuntos."
        action={<Button onClick={() => setOpen(true)}>Nueva correspondencia</Button>} />
      {loading ? <Card><Empty>Cargando…</Empty></Card>
        : items.length === 0 ? <Card><Empty>Sin correspondencia.</Empty></Card> : (
        <div className="space-y-3">
          {items.map(c => {
            const enviado = c.de_logia_id === user.logia_id;
            return (
              <Card key={c.id}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge color={enviado ? "blue" : "green"}>{enviado ? "Enviada" : "Recibida"}</Badge>
                    <h3 className="font-semibold text-navy">{c.asunto}</h3>
                  </div>
                  <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{c.cuerpo}</p>
                  <div className="text-xs text-slate-400 mt-2">
                    De {nombreLogia(c.de_logia_id)} → {c.destinatarios_logia_ids.map(nombreLogia).join(", ")} · {fechaHora(c.fecha)}
                  </div>
                  {c.adjuntos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {c.adjuntos.map((a, i) => (
                        <button key={i} type="button" onClick={() => descargar(a.ruta)}
                          className="badge bg-slate-100 text-slate-700 hover:bg-slate-200">📎 {a.nombre}</button>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {open && <Redactar deLogia={user.logia_id} userId={user.id} logias={logias}
        onClose={() => { setOpen(false); setReload(x => x + 1); }} />}
    </div>
  );
}

function Redactar({ deLogia, userId, logias, onClose }:
  { deLogia: string; userId: string; logias: Logia[]; onClose: () => void }) {
  const otras = logias.filter(l => l.id !== deLogia);
  const [f, setF] = useState({ asunto: "", cuerpo: "", destinos: [] as string[] });
  const [archivos, setArchivos] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const toggle = (id: string) => setF(s => ({ ...s, destinos: s.destinos.includes(id) ? s.destinos.filter(x => x !== id) : [...s.destinos, id] }));

  async function enviarCorr() {
    if (!f.asunto || f.destinos.length === 0) { setError("Indica un asunto y al menos una logia destinataria."); return; }
    setEnviando(true); setError("");
    const { error } = await enviar(deLogia, f.destinos, f.asunto, f.cuerpo, archivos, userId);
    setEnviando(false);
    if (error) { setError("No se pudo enviar la correspondencia."); return; }
    onClose();
  }

  return (
    <Modal open onClose={onClose} title="Nueva correspondencia">
      <div className="space-y-3">
        <div>
          <label className="label">Logias destinatarias</label>
          <div className="flex flex-wrap gap-2">
            {otras.map(l => (
              <button key={l.id} type="button" onClick={() => toggle(l.id)}
                className={`btn text-xs ${f.destinos.includes(l.id) ? "btn-primary" : "btn-ghost"}`}>{l.nombre}</button>
            ))}
          </div>
        </div>
        <Input label="Asunto" value={f.asunto} onChange={e => setF(s => ({ ...s, asunto: e.target.value }))} />
        <Textarea label="Mensaje" value={f.cuerpo} onChange={e => setF(s => ({ ...s, cuerpo: e.target.value }))} />
        <div>
          <label className="label">Adjuntos (PDF, Word, PNG, JPG)</label>
          <input type="file" multiple accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" className="input"
            onChange={e => setArchivos(Array.from(e.target.files ?? []))} />
          <p className="text-xs text-slate-400 mt-1">Se almacenan de forma privada; la descarga usa un enlace temporal.</p>
        </div>
        {error && <p className="text-rose-600 text-sm">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={enviarCorr} disabled={enviando}>{enviando ? "Enviando…" : "Enviar"}</Button>
        </div>
      </div>
    </Modal>
  );
}
