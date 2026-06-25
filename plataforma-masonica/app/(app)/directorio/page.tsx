"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Card, PageTitle, Button, Input, Textarea, Badge, Empty, Modal } from "@/components/ui";
import { listDirectorio, miPerfil, guardarPerfil, listLogias } from "@/lib/data/directorio";
import { enviarMensaje } from "@/lib/data/store";
import { PerfilProfesional, Logia, Usuario } from "@/lib/types";
import { initials } from "@/lib/format";

export default function DirectorioPage() {
  const { user } = useAuth();
  if (!user) return null;
  return <DirectorioInner user={user} />;
}

function DirectorioInner({ user }: { user: Usuario }) {
  const router = useRouter();
  const [perfiles, setPerfiles] = useState<PerfilProfesional[]>([]);
  const [logias, setLogias] = useState<Logia[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [contact, setContact] = useState<{ id: string; nombre: string } | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let activo = true;
    Promise.all([listDirectorio(), listLogias()]).then(([p, l]) => {
      if (activo) { setPerfiles(p); setLogias(l); setLoading(false); }
    });
    return () => { activo = false; };
  }, [reload]);

  const nombreLogia = (id?: string) => logias.find(l => l.id === id);
  const term = q.trim().toLowerCase();
  const visibles = perfiles.filter(p => {
    if (p.usuario_id === user.id) return false;
    if (!p.mostrar_en_directorio) return false;
    if (!term) return true;
    const hay = [p.nombre, p.profesion, p.negocio, p.sector, ...(p.palabras_clave ?? [])].join(" ").toLowerCase();
    return hay.includes(term);
  });

  return (
    <div>
      <PageTitle title="Directorio profesional"
        subtitle="Contacta hermanos por sus servicios. Solo se muestran nombre, logia y datos profesionales."
        action={<Button variant="gold" onClick={() => setEditOpen(true)}>Mi perfil profesional</Button>} />

      <div className="mb-5">
        <Input placeholder="Buscar por profesión, negocio o palabra clave…" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {loading ? <Card><Empty>Cargando…</Empty></Card>
        : visibles.length === 0 ? <Card><Empty>No se encontraron hermanos con esos criterios.</Empty></Card> : (
        <div className="grid sm:grid-cols-2 gap-4">
          {visibles.map(p => {
            const l = nombreLogia(p.logia_id);
            const nombre = (p.nombre ?? "").split("(")[0].trim() || "Hermano";
            return (
              <Card key={p.usuario_id}>
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-navy text-white grid place-items-center font-semibold">{initials(nombre)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-navy">{nombre}</div>
                    <div className="text-sm text-slate-600">{p.profesion}{p.negocio ? ` · ${p.negocio}` : ""}</div>
                    <div className="text-xs text-slate-400">{l ? `${l.nombre} N.°${l.numero}` : ""}</div>
                    {p.descripcion && <p className="text-sm text-slate-600 mt-2">{p.descripcion}</p>}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(p.palabras_clave ?? []).map(k => <Badge key={k}>{k}</Badge>)}
                    </div>
                    <Button className="mt-3 text-xs" onClick={() => setContact({ id: p.usuario_id, nombre })}>✉️ Contactar</Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {editOpen && <EditarPerfil user={user} onClose={() => { setEditOpen(false); setReload(x => x + 1); }} />}
      {contact && <Contactar de={user.id} para={contact} onClose={() => setContact(null)}
        onSent={() => { setContact(null); router.push("/mensajes"); }} />}
    </div>
  );
}

function EditarPerfil({ user, onClose }: { user: Usuario; onClose: () => void }) {
  const [p, setP] = useState<PerfilProfesional>({ usuario_id: user.id, mostrar_en_directorio: true, palabras_clave: [] });
  const [kw, setKw] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    miPerfil(user.id).then(perfil => {
      if (!activo || !perfil) return;
      setP(perfil);
      setKw((perfil.palabras_clave ?? []).join(", "));
    });
    return () => { activo = false; };
  }, [user.id]);

  function set<K extends keyof PerfilProfesional>(k: K, v: PerfilProfesional[K]) {
    setP(s => ({ ...s, [k]: v }));
  }
  async function guardar() {
    setGuardando(true); setError("");
    const { error } = await guardarPerfil(
      { ...p, palabras_clave: kw.split(",").map(x => x.trim()).filter(Boolean) }, user.nombre, user.logia_id);
    setGuardando(false);
    if (error) { setError("No se pudo guardar el perfil."); return; }
    onClose();
  }

  return (
    <Modal open onClose={onClose} title="Mi perfil profesional">
      <div className="space-y-3">
        <Input label="Profesión" value={p.profesion ?? ""} onChange={e => set("profesion", e.target.value)} />
        <Input label="Negocio / empresa" value={p.negocio ?? ""} onChange={e => set("negocio", e.target.value)} />
        <Input label="Sector" value={p.sector ?? ""} onChange={e => set("sector", e.target.value)} />
        <Textarea label="Descripción de servicios" value={p.descripcion ?? ""} onChange={e => set("descripcion", e.target.value)} />
        <Input label="Palabras clave (separadas por coma)" value={kw} onChange={e => setKw(e.target.value)} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={p.mostrar_en_directorio} onChange={e => set("mostrar_en_directorio", e.target.checked)} />
          Mostrar mi perfil en el directorio
        </label>
        {error && <p className="text-rose-600 text-sm">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={guardar} disabled={guardando}>{guardando ? "Guardando…" : "Guardar"}</Button>
        </div>
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
