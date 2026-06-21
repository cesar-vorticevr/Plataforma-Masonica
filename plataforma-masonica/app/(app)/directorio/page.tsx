"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Card, PageTitle, Button, Input, Textarea, Badge, Empty, Modal } from "@/components/ui";
import { listPerfilesDirectorio, getUsuario, getLogia, getPerfil, guardarPerfil, enviarMensaje } from "@/lib/data/store";
import { PerfilProfesional } from "@/lib/types";
import { initials } from "@/lib/format";

export default function Directorio() {
  const { user } = useAuth();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [contact, setContact] = useState<{ id: string; nombre: string } | null>(null);
  const [tick, setTick] = useState(0);
  if (!user) return null;

  const term = q.trim().toLowerCase();
  const perfiles = listPerfilesDirectorio().filter(p => {
    if (p.usuario_id === user.id) return false;
    if (!term) return true;
    const u = getUsuario(p.usuario_id);
    const hay = [u?.nombre, p.profesion, p.negocio, p.sector, ...(p.palabras_clave ?? [])].join(" ").toLowerCase();
    return hay.includes(term);
  });

  return (
    <div key={tick}>
      <PageTitle title="Directorio profesional"
        subtitle="Contacta hermanos por sus servicios. Solo se muestran nombre, logia y datos profesionales."
        action={<Button variant="gold" onClick={() => setEditOpen(true)}>Mi perfil profesional</Button>} />

      <div className="mb-5">
        <Input placeholder="Buscar por profesión, negocio o palabra clave…" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {perfiles.length === 0 ? <Card><Empty>No se encontraron hermanos con esos criterios.</Empty></Card> : (
        <div className="grid sm:grid-cols-2 gap-4">
          {perfiles.map(p => {
            const u = getUsuario(p.usuario_id)!;
            const l = getLogia(u.logia_id);
            return (
              <Card key={p.usuario_id}>
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-navy text-white grid place-items-center font-semibold">{initials(u.nombre)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-navy">{u.nombre.split("(")[0].trim()}</div>
                    <div className="text-sm text-slate-600">{p.profesion}{p.negocio ? ` · ${p.negocio}` : ""}</div>
                    <div className="text-xs text-slate-400">{l?.nombre} N.°{l?.numero}</div>
                    {p.descripcion && <p className="text-sm text-slate-600 mt-2">{p.descripcion}</p>}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(p.palabras_clave ?? []).map(k => <Badge key={k}>{k}</Badge>)}
                    </div>
                    <Button className="mt-3 text-xs" onClick={() => setContact({ id: u.id, nombre: u.nombre })}>✉️ Contactar</Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {editOpen && <EditarPerfil userId={user.id} onClose={() => { setEditOpen(false); setTick(t => t + 1); }} />}
      {contact && <Contactar de={user.id} para={contact} onClose={() => setContact(null)}
        onSent={() => { setContact(null); router.push("/mensajes"); }} />}
    </div>
  );
}

function EditarPerfil({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [p, setP] = useState<PerfilProfesional>(() =>
    getPerfil(userId) ?? { usuario_id: userId, mostrar_en_directorio: true, palabras_clave: [] });
  const set = (k: keyof PerfilProfesional, v: any) => setP(s => ({ ...s, [k]: v }));
  function guardar() {
    guardarPerfil({ ...p, palabras_clave: typeof (p as any)._kw === "string"
      ? (p as any)._kw.split(",").map((x: string) => x.trim()).filter(Boolean) : p.palabras_clave });
    onClose();
  }
  return (
    <Modal open onClose={onClose} title="Mi perfil profesional">
      <div className="space-y-3">
        <Input label="Profesión" value={p.profesion ?? ""} onChange={e => set("profesion", e.target.value)} />
        <Input label="Negocio / empresa" value={p.negocio ?? ""} onChange={e => set("negocio", e.target.value)} />
        <Input label="Sector" value={p.sector ?? ""} onChange={e => set("sector", e.target.value)} />
        <Textarea label="Descripción de servicios" value={p.descripcion ?? ""} onChange={e => set("descripcion", e.target.value)} />
        <Input label="Palabras clave (separadas por coma)" defaultValue={(p.palabras_clave ?? []).join(", ")}
          onChange={e => set("_kw" as any, e.target.value)} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={p.mostrar_en_directorio} onChange={e => set("mostrar_en_directorio", e.target.checked)} />
          Mostrar mi perfil en el directorio
        </label>
        <div className="flex justify-end gap-2 pt-2"><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button onClick={guardar}>Guardar</Button></div>
      </div>
    </Modal>
  );
}

function Contactar({ de, para, onClose, onSent }:
  { de: string; para: { id: string; nombre: string }; onClose: () => void; onSent: () => void }) {
  const [txt, setTxt] = useState("");
  return (
    <Modal open onClose={onClose} title={`Contactar a ${para.nombre.split("(")[0].trim()}`}>
      <p className="text-xs text-slate-500 mb-3">El contacto es por la plataforma. No se comparten datos personales.</p>
      <Textarea label="Mensaje" value={txt} onChange={e => setTxt(e.target.value)} placeholder="Hermano, me interesa tu servicio profesional…" />
      <div className="flex justify-end gap-2 pt-3">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button onClick={() => { if (txt.trim()) { enviarMensaje(de, para.id, txt.trim()); onSent(); } }}>Enviar</Button>
      </div>
    </Modal>
  );
}
