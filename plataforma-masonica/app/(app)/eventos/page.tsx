"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { can } from "@/lib/roles";
import { Card, PageTitle, Button, Input, Textarea, Select, Badge, Empty, Modal } from "@/components/ui";
import { listEventos, addEvento } from "@/lib/data/eventos";
import { Evento, Usuario } from "@/lib/types";
import { fecha } from "@/lib/format";

export default function Eventos() {
  const { user } = useAuth();
  if (!user) return null;
  return <EventosInner user={user} />;
}

function EventosInner({ user }: { user: Usuario }) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [reload, setReload] = useState(0);
  const puede = can.publicarEventos(user);
  const global = user.rol === "gran_secretario" || user.rol === "master";

  useEffect(() => {
    let activo = true;
    listEventos().then(e => { if (activo) { setEventos(e); setLoading(false); } });
    return () => { activo = false; };
  }, [reload]);

  if (loading) return <div className="min-h-[40vh] grid place-items-center text-slate-400">Cargando…</div>;

  return (
    <div>
      <PageTitle title="Eventos y anuncios" subtitle="Anuncios de tu logia y de toda la Gran Logia."
        action={puede ? <Button onClick={() => setOpen(true)}>Publicar evento</Button> : undefined} />
      {eventos.length === 0 ? <Card><Empty>No hay eventos publicados.</Empty></Card> : (
        <div className="space-y-3">
          {eventos.map(e => (
            <Card key={e.id}>
              <div className="flex items-start gap-4">
                <div className="text-center bg-navy text-white rounded-lg px-3 py-2 min-w-[60px]">
                  <div className="text-xl font-bold">{new Date(e.fecha_evento).getDate()}</div>
                  <div className="text-xs">{new Date(e.fecha_evento).toLocaleDateString("es-MX", { month: "short" })}</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-navy">{e.titulo}</h3>
                    <Badge color={e.alcance === "global" ? "gold" : "blue"}>{e.alcance === "global" ? "Todas las logias" : "Mi logia"}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{e.descripcion}</p>
                  <p className="text-xs text-slate-400 mt-2">{fecha(e.fecha_evento)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {open && <Crear userId={user.id} logiaId={user.logia_id} global={global}
        onClose={() => { setOpen(false); setReload(x => x + 1); }} />}
    </div>
  );
}

function Crear({ userId, logiaId, global, onClose }:
  { userId: string; logiaId: string; global: boolean; onClose: () => void }) {
  const [f, setF] = useState({ titulo: "", descripcion: "", fecha_evento: "", alcance: "logia" });
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const set = (k: string, v: string) => setF(s => ({ ...s, [k]: v }));

  async function guardar() {
    if (!f.titulo || !f.fecha_evento) return;
    setGuardando(true);
    const alcance = f.alcance === "global" ? "global" : "logia";
    const { error } = await addEvento({
      titulo: f.titulo, descripcion: f.descripcion, fecha_evento: new Date(f.fecha_evento).toISOString(),
      alcance, logia_id: alcance === "global" ? null : logiaId, autor_id: userId,
    });
    setGuardando(false);
    if (error) { setError("No se pudo publicar el evento."); return; }
    onClose();
  }

  return (
    <Modal open onClose={onClose} title="Publicar evento">
      <div className="space-y-3">
        <Input label="Título" value={f.titulo} onChange={e => set("titulo", e.target.value)} />
        <Textarea label="Descripción" value={f.descripcion} onChange={e => set("descripcion", e.target.value)} />
        <Input label="Fecha del evento" type="date" value={f.fecha_evento} onChange={e => set("fecha_evento", e.target.value)} />
        <Select label="Alcance" value={f.alcance} onChange={e => set("alcance", e.target.value)}>
          <option value="logia">Solo mi logia</option>
          {global && <option value="global">Todas las logias</option>}
        </Select>
        {error && <p className="text-rose-600 text-sm">{error}</p>}
        <div className="flex justify-end gap-2 pt-2"><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={guardar} disabled={guardando}>Publicar</Button></div>
      </div>
    </Modal>
  );
}
