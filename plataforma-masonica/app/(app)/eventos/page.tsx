"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { can } from "@/lib/roles";
import { Card, PageTitle, Button, Input, Textarea, Select, Badge, Empty, Modal } from "@/components/ui";
import { listEventos, addEvento, getUsuario, marcarEventosVistos } from "@/lib/data/store";
import { fecha } from "@/lib/format";

export default function Eventos() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (user) { marcarEventosVistos(user.id); window.dispatchEvent(new Event("notif")); }
  }, [user]);
  if (!user) return null;
  const eventos = listEventos(user.logia_id);
  const puede = can.publicarEventos(user);

  return (
    <div key={tick}>
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
                  <p className="text-xs text-slate-400 mt-2">{fecha(e.fecha_evento)} · por {getUsuario(e.autor_id)?.nombre.split("(")[0].trim()}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {open && <Crear userId={user.id} logiaId={user.logia_id} global={user.rol === "gran_secretario" || user.rol === "master"}
        onClose={() => { setOpen(false); setTick(t => t + 1); }} />}
    </div>
  );
}

function Crear({ userId, logiaId, global, onClose }:
  { userId: string; logiaId: string; global: boolean; onClose: () => void }) {
  const [f, setF] = useState({ titulo: "", descripcion: "", fecha_evento: "", alcance: "logia" });
  const set = (k: string, v: string) => setF(s => ({ ...s, [k]: v }));
  function guardar() {
    if (!f.titulo || !f.fecha_evento) return;
    addEvento({ titulo: f.titulo, descripcion: f.descripcion, fecha_evento: new Date(f.fecha_evento).toISOString(),
      alcance: f.alcance as "logia" | "global", logia_id: f.alcance === "global" ? null : logiaId, autor_id: userId });
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
        <div className="flex justify-end gap-2 pt-2"><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={guardar}>Publicar</Button></div>
      </div>
    </Modal>
  );
}
