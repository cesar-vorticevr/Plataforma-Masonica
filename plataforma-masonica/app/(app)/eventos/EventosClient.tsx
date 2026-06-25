"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { can } from "@/lib/roles";
import { Card, PageTitle, Button, Input, Textarea, Select, Badge, Empty, Modal } from "@/components/ui";
import { addEvento, marcarEventosVistos } from "@/lib/data/eventos";
import { Evento } from "@/lib/types";
import { fecha } from "@/lib/format";

// Isla de eventos: recibe la lista del servidor y mantiene la publicación (modal). Tras publicar,
// router.refresh() vuelve a ejecutar el Server Component.
export default function EventosClient({ eventos }: { eventos: Evento[] }) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Al abrir Eventos, marca todo como visto y avisa a AppShell para que el badge baje a 0.
  useEffect(() => {
    marcarEventosVistos(createClient()).then(() => window.dispatchEvent(new Event("notif")));
  }, []);

  if (!user) return null;
  const puede = can.publicarEventos(user);
  const global = user.rol === "gran_secretario" || user.rol === "master";

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
        onClose={() => setOpen(false)} onSaved={() => { setOpen(false); router.refresh(); }} />}
    </div>
  );
}

function Crear({ userId, logiaId, global, onClose, onSaved }:
  { userId: string; logiaId: string; global: boolean; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ titulo: "", descripcion: "", fecha_evento: "", alcance: "logia" });
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const set = (k: string, v: string) => setF(s => ({ ...s, [k]: v }));

  async function guardar() {
    if (!f.titulo || !f.fecha_evento) return;
    setGuardando(true);
    const alcance = f.alcance === "global" ? "global" : "logia";
    const { error } = await addEvento(createClient(), {
      titulo: f.titulo, descripcion: f.descripcion, fecha_evento: new Date(f.fecha_evento).toISOString(),
      alcance, logia_id: alcance === "global" ? null : logiaId, autor_id: userId,
    });
    setGuardando(false);
    if (error) { setError("No se pudo publicar el evento."); return; }
    onSaved();
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
