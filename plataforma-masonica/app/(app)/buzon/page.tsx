"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, PageTitle, Button, Input, Select, Badge, Empty, Modal } from "@/components/ui";
import { listBuzon, subir, urlDescarga, DocBuzon } from "@/lib/data/buzon";
import { Usuario } from "@/lib/types";
import { fecha } from "@/lib/format";

export default function Buzon() {
  const { user } = useAuth();
  if (!user) return null;
  return <BuzonInner user={user} />;
}

function BuzonInner({ user }: { user: Usuario }) {
  const [docs, setDocs] = useState<DocBuzon[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let activo = true;
    listBuzon().then(d => { if (activo) { setDocs(d); setLoading(false); } });
    return () => { activo = false; };
  }, [reload]);

  async function descargar(ruta: string) {
    const url = await urlDescarga(ruta);
    if (url) window.open(url, "_blank", "noopener");
  }

  return (
    <div>
      <PageTitle title="Buzón interlogial" subtitle="Documentos compartidos entre las secretarías (PDF y Word)."
        action={<Button onClick={() => setOpen(true)}>Subir documento</Button>} />
      {loading ? <Card><Empty>Cargando…</Empty></Card>
        : docs.length === 0 ? <Card><Empty>No hay documentos.</Empty></Card> : (
        <Card className="p-0 overflow-hidden">
          {docs.map(d => (
            <div key={d.id} className="flex items-center gap-4 p-4 border-b last:border-0 hover:bg-slate-50">
              <span className="text-2xl">{d.tipo === "pdf" ? "📕" : "📘"}</span>
              <div className="flex-1">
                <div className="font-medium text-slate-800">{d.titulo}</div>
                <div className="text-xs text-slate-400">{fecha(d.fecha)}</div>
              </div>
              <Badge color={d.tipo === "pdf" ? "red" : "blue"}>{d.tipo.toUpperCase()}</Badge>
              <Button variant="ghost" className="text-xs" onClick={() => descargar(d.archivo_url)}>Descargar</Button>
            </div>
          ))}
        </Card>
      )}
      {open && <Subir userId={user.id} onClose={() => { setOpen(false); setReload(x => x + 1); }} />}
    </div>
  );
}

function Subir({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<"pdf" | "word">("pdf");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [subiendo, setSubiendo] = useState(false);

  async function guardar() {
    if (!titulo || !archivo) { setError("Indica un título y selecciona un archivo."); return; }
    setSubiendo(true); setError("");
    const { error } = await subir(titulo, tipo, archivo, userId);
    setSubiendo(false);
    if (error) { setError("No se pudo subir el documento."); return; }
    onClose();
  }

  return (
    <Modal open onClose={onClose} title="Subir documento al buzón">
      <div className="space-y-3">
        <Input label="Título" value={titulo} onChange={e => setTitulo(e.target.value)} />
        <Select label="Tipo" value={tipo} onChange={e => setTipo(e.target.value as "pdf" | "word")}>
          <option value="pdf">PDF</option><option value="word">Word</option>
        </Select>
        <div>
          <label className="label">Archivo</label>
          <input type="file" accept=".pdf,.doc,.docx" className="input"
            onChange={e => setArchivo(e.target.files?.[0] ?? null)} />
          <p className="text-xs text-slate-400 mt-1">PDF o Word. Se almacena de forma privada; la descarga usa un enlace temporal.</p>
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
