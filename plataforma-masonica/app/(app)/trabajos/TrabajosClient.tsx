"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { nivelCamara } from "@/lib/roles";
import { Card, PageTitle, Button, Input, Textarea, Select, Badge, Empty, Modal } from "@/components/ui";
import { subir, urlDescarga } from "@/lib/data/trabajos";
import { Camara, CAMARA_LABEL, TRABAJO_LABEL, Trabajo, Usuario } from "@/lib/types";
import { fecha } from "@/lib/format";

// Isla de trabajos: recibe la lista del servidor; mantiene filtro, descarga (enlace firmado) y
// subida (Storage). Tras subir, router.refresh().
export default function TrabajosClient({ trabajos }: { trabajos: Trabajo[] }) {
  const { user } = useAuth();
  if (!user || !user.grado) return null;
  return <TrabajosInner user={user} trabajos={trabajos} />;
}

function TrabajosInner({ user, trabajos }: { user: Usuario; trabajos: Trabajo[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [filtro, setFiltro] = useState<string>("todos");

  const camarasDisponibles: Camara[] = (["aprendiz", "companero", "maestro"] as Camara[])
    .filter(c => nivelCamara(c) <= nivelCamara(user.grado as Camara));
  const visibles = trabajos.filter(t => filtro === "todos" || t.camara === filtro);

  async function descargar(ruta?: string) {
    if (!ruta) return;
    const url = await urlDescarga(createClient(), ruta);
    if (url) window.open(url, "_blank", "noopener");
  }

  return (
    <div>
      <PageTitle title="Trabajos, Burilados y Trazados"
        subtitle="Solo ves trabajos de tu cámara y de las inferiores."
        action={<Button onClick={() => setOpen(true)}>Subir trabajo</Button>} />

      <div className="flex gap-2 mb-4 flex-wrap">
        {["todos", ...camarasDisponibles].map(c => (
          <button key={c} onClick={() => setFiltro(c)}
            className={`btn text-xs ${filtro === c ? "btn-primary" : "btn-ghost"}`}>
            {c === "todos" ? "Todos" : TRABAJO_LABEL[c as Camara] + "s"}
          </button>
        ))}
      </div>

      {visibles.length === 0 ? <Card><Empty>No hay trabajos visibles para tu grado con este filtro.</Empty></Card> : (
        <div className="grid sm:grid-cols-2 gap-4">
          {visibles.map(t => {
            const color = t.camara === "aprendiz" ? "blue" : t.camara === "companero" ? "gold" : "green";
            return (
              <Card key={t.id}>
                <div className="flex items-start justify-between">
                  <span className="text-2xl">📜</span>
                  <Badge color={color}>{TRABAJO_LABEL[t.camara]} · {CAMARA_LABEL[t.camara]}</Badge>
                </div>
                <h3 className="font-semibold text-navy mt-2">{t.titulo}</h3>
                {t.descripcion && <p className="text-sm text-slate-600 mt-1">{t.descripcion}</p>}
                <div className="text-xs text-slate-400 mt-2">{t.autor_nombre ?? "—"} · {fecha(t.fecha)}</div>
                <Button variant="ghost" className="text-xs mt-3" onClick={() => descargar(t.archivo_url)}>
                  📎 {t.archivo_nombre ?? "archivo"}
                </Button>
              </Card>
            );
          })}
        </div>
      )}
      {open && <Subir user={user} camaras={camarasDisponibles}
        onClose={() => setOpen(false)} onSaved={() => { setOpen(false); router.refresh(); }} />}
    </div>
  );
}

function Subir({ user, camaras, onClose, onSaved }:
  { user: Usuario; camaras: Camara[]; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ titulo: "", descripcion: "", camara: camaras[camaras.length - 1] });
  const [archivo, setArchivo] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [subiendo, setSubiendo] = useState(false);

  async function guardar() {
    if (!f.titulo || !archivo) { setError("Indica un título y selecciona un archivo."); return; }
    setSubiendo(true); setError("");
    const autor = user.nombre.split("(")[0].trim();
    const { error } = await subir(createClient(), user.id, user.logia_id, f.titulo, f.descripcion, f.camara, archivo, autor);
    setSubiendo(false);
    if (error) { setError("No se pudo subir el trabajo."); return; }
    onSaved();
  }

  return (
    <Modal open onClose={onClose} title="Subir trabajo">
      <div className="space-y-3">
        <Input label="Título" value={f.titulo} onChange={e => setF(s => ({ ...s, titulo: e.target.value }))} />
        <Textarea label="Descripción (opcional)" value={f.descripcion} onChange={e => setF(s => ({ ...s, descripcion: e.target.value }))} />
        <Select label="Cámara del trabajo" value={f.camara} onChange={e => setF(s => ({ ...s, camara: e.target.value as Camara }))}>
          {camaras.map(c => <option key={c} value={c}>{TRABAJO_LABEL[c]} ({CAMARA_LABEL[c]})</option>)}
        </Select>
        <div>
          <label className="label">Archivo (PDF / Word)</label>
          <input type="file" accept=".pdf,.doc,.docx" className="input"
            onChange={e => setArchivo(e.target.files?.[0] ?? null)} />
          <p className="text-xs text-slate-400 mt-1">Se almacena de forma privada; la descarga usa un enlace temporal.</p>
        </div>
        {error && <p className="text-rose-600 text-sm">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={guardar} disabled={subiendo}>{subiendo ? "Subiendo…" : "Subir"}</Button>
        </div>
      </div>
    </Modal>
  );
}
