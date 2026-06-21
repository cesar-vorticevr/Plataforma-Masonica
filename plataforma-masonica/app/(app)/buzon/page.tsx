"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, PageTitle, Button, Input, Select, Badge, Empty, Modal } from "@/components/ui";
import { listBuzon, addBuzon, getUsuario } from "@/lib/data/store";
import { fecha } from "@/lib/format";

export default function Buzon() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);
  if (!user) return null;
  const docs = listBuzon();

  return (
    <div key={tick}>
      <PageTitle title="Buzón interlogial" subtitle="Documentos compartidos entre las secretarías (PDF y Word)."
        action={<Button onClick={() => setOpen(true)}>Subir documento</Button>} />
      {docs.length === 0 ? <Card><Empty>No hay documentos.</Empty></Card> : (
        <Card className="p-0 overflow-hidden">
          {docs.map(d => (
            <div key={d.id} className="flex items-center gap-4 p-4 border-b last:border-0 hover:bg-slate-50">
              <span className="text-2xl">{d.tipo === "pdf" ? "📕" : "📘"}</span>
              <div className="flex-1">
                <div className="font-medium text-slate-800">{d.titulo}</div>
                <div className="text-xs text-slate-400">{d.archivo_nombre} · {getUsuario(d.autor_id)?.nombre.split("(")[0].trim()} · {fecha(d.fecha)}</div>
              </div>
              <Badge color={d.tipo === "pdf" ? "red" : "blue"}>{d.tipo.toUpperCase()}</Badge>
              <Button variant="ghost" className="text-xs">Descargar</Button>
            </div>
          ))}
        </Card>
      )}
      {open && <Subir userId={user.id} onClose={() => { setOpen(false); setTick(t => t + 1); }} />}
    </div>
  );
}

function Subir({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [f, setF] = useState({ titulo: "", tipo: "pdf", archivo_nombre: "" });
  const set = (k: string, v: string) => setF(s => ({ ...s, [k]: v }));
  return (
    <Modal open onClose={onClose} title="Subir documento al buzón">
      <div className="space-y-3">
        <Input label="Título" value={f.titulo} onChange={e => set("titulo", e.target.value)} />
        <Select label="Tipo" value={f.tipo} onChange={e => set("tipo", e.target.value)}>
          <option value="pdf">PDF</option><option value="word">Word</option>
        </Select>
        <div>
          <label className="label">Archivo</label>
          <input type="file" accept=".pdf,.doc,.docx" className="input"
            onChange={e => set("archivo_nombre", e.target.files?.[0]?.name ?? "")} />
          <p className="text-xs text-slate-400 mt-1">En la demo solo se guarda el nombre. El programador conectará el almacenamiento real (Supabase Storage).</p>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => { if (f.titulo) { addBuzon({ titulo: f.titulo, tipo: f.tipo as any, archivo_nombre: f.archivo_nombre || "documento", autor_id: userId }); onClose(); } }}>Subir</Button>
        </div>
      </div>
    </Modal>
  );
}
